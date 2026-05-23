import pytest
from django.utils import timezone
from apps.trades.models import Trade, Direction, TradeResult
from apps.mentors.models import MentorRequest, MentorAssignment


REQUESTS_URL = "/api/mentors/requests/"
MY_TRADERS_URL = "/api/mentors/my-traders/"
MY_MENTOR_URL = "/api/mentors/my-mentor/"


def accept_url(pk: int) -> str:
    return f"/api/mentors/requests/{pk}/accept/"


def reject_url(pk: int) -> str:
    return f"/api/mentors/requests/{pk}/reject/"


def annotation_list_url(trade_id: int) -> str:
    return f"/api/mentors/trades/{trade_id}/annotations/"


def annotation_detail_url(pk: int) -> str:
    return f"/api/mentors/annotations/{pk}/"


def trader_trades_url(trader_id: int) -> str:
    return f"/api/mentors/traders/{trader_id}/trades/"


@pytest.fixture
def mentor_request(db, mentor_user, trader_user):
    return MentorRequest.objects.create(mentor=mentor_user, trader=trader_user)


@pytest.fixture
def active_assignment(db, mentor_user, trader_user):
    MentorRequest.objects.create(
        mentor=mentor_user, trader=trader_user, status=MentorRequest.Status.ACCEPTED
    )
    return MentorAssignment.objects.create(mentor=mentor_user, trader=trader_user)


@pytest.mark.django_db
class TestMentorRequestFlow:
    def test_mentor_sends_request(self, mentor_client, trader_user):
        res = mentor_client.post(REQUESTS_URL, {"trader_email": trader_user.email}, format="json")
        assert res.status_code == 201
        assert MentorRequest.objects.filter(trader=trader_user).exists()

    def test_trader_accepts_request(self, api_client, mentor_request, trader_user):
        api_client.force_authenticate(user=trader_user)
        res = api_client.post(accept_url(mentor_request.pk))
        assert res.status_code == 200
        mentor_request.refresh_from_db()
        assert mentor_request.status == MentorRequest.Status.ACCEPTED
        assert MentorAssignment.objects.filter(
            mentor=mentor_request.mentor, trader=trader_user
        ).exists()

    def test_trader_rejects_request(self, api_client, mentor_request, trader_user):
        api_client.force_authenticate(user=trader_user)
        res = api_client.post(reject_url(mentor_request.pk))
        assert res.status_code == 200
        mentor_request.refresh_from_db()
        assert mentor_request.status == MentorRequest.Status.REJECTED
        assert not MentorAssignment.objects.filter(
            mentor=mentor_request.mentor, trader=trader_user
        ).exists()

    def test_mentor_cannot_send_request_to_nonexistent_trader(self, mentor_client):
        res = mentor_client.post(REQUESTS_URL, {"trader_email": "ghost@test.com"}, format="json")
        assert res.status_code == 400

    def test_duplicate_request_blocked(self, mentor_client, mentor_request, trader_user):
        res = mentor_client.post(REQUESTS_URL, {"trader_email": trader_user.email}, format="json")
        assert res.status_code == 400


@pytest.mark.django_db
class TestMentorReadAccess:
    def test_mentor_reads_assigned_trader_trades(
        self, api_client, active_assignment, mentor_user, trader_user
    ):
        Trade.objects.create(
            user=trader_user, pair="BTC/USD", direction=Direction.LONG,
            entry_price="50000", quantity="0.1", entry_time=timezone.now(),
            result=TradeResult.WIN,
        )
        api_client.force_authenticate(user=mentor_user)
        res = api_client.get(trader_trades_url(trader_user.pk))
        assert res.status_code == 200
        assert res.data["count"] >= 1

    def test_mentor_cannot_read_unassigned_trader_trades(self, mentor_client, trader_user):
        res = mentor_client.get(trader_trades_url(trader_user.pk))
        assert res.status_code in (403, 404)

    def test_trader_sees_mentor_info(self, api_client, active_assignment, trader_user):
        api_client.force_authenticate(user=trader_user)
        res = api_client.get(MY_MENTOR_URL)
        assert res.status_code == 200

    def test_mentor_lists_own_traders(self, api_client, active_assignment, mentor_user):
        api_client.force_authenticate(user=mentor_user)
        res = api_client.get(MY_TRADERS_URL)
        assert res.status_code == 200
        assert res.data["count"] >= 1


@pytest.mark.django_db
class TestAnnotations:
    def test_mentor_creates_annotation(self, api_client, active_assignment, mentor_user, trader_user):
        trade = Trade.objects.create(
            user=trader_user, pair="ETH/USD", direction=Direction.LONG,
            entry_price="3000", quantity="1", entry_time=timezone.now(),
        )
        api_client.force_authenticate(user=mentor_user)
        res = api_client.post(
            annotation_list_url(trade.pk),
            {"body": "Good entry, watch the spread."},
            format="json",
        )
        assert res.status_code == 201
        assert res.data["body"] == "Good entry, watch the spread."

    def test_mentor_updates_annotation(self, api_client, active_assignment, mentor_user, trader_user):
        from apps.mentors.models import MentorAnnotation
        trade = Trade.objects.create(
            user=trader_user, pair="ETH/USD", direction=Direction.LONG,
            entry_price="3000", quantity="1", entry_time=timezone.now(),
        )
        annotation = MentorAnnotation.objects.create(
            trade=trade, mentor=mentor_user, body="Initial note."
        )
        api_client.force_authenticate(user=mentor_user)
        res = api_client.patch(
            annotation_detail_url(annotation.pk),
            {"body": "Updated note."},
            format="json",
        )
        assert res.status_code == 200
        annotation.refresh_from_db()
        assert annotation.body == "Updated note."

    def test_mentor_deletes_annotation(self, api_client, active_assignment, mentor_user, trader_user):
        from apps.mentors.models import MentorAnnotation
        trade = Trade.objects.create(
            user=trader_user, pair="ETH/USD", direction=Direction.LONG,
            entry_price="3000", quantity="1", entry_time=timezone.now(),
        )
        annotation = MentorAnnotation.objects.create(
            trade=trade, mentor=mentor_user, body="To be deleted."
        )
        api_client.force_authenticate(user=mentor_user)
        res = api_client.delete(annotation_detail_url(annotation.pk))
        assert res.status_code == 204

    def test_unassigned_mentor_cannot_annotate(self, mentor_client, trader_user):
        trade = Trade.objects.create(
            user=trader_user, pair="ETH/USD", direction=Direction.LONG,
            entry_price="3000", quantity="1", entry_time=timezone.now(),
        )
        res = mentor_client.post(
            annotation_list_url(trade.pk),
            {"body": "Sneaky note."},
            format="json",
        )
        assert res.status_code in (403, 404)

from django.urls import path
from . import views

urlpatterns = [
    # Mentor request flow
    path("requests/", views.MentorRequestCreateView.as_view()),
    path("requests/sent/", views.MentorRequestSentView.as_view()),
    path("requests/received/", views.MentorRequestReceivedView.as_view()),
    path("requests/<int:pk>/accept/", views.MentorRequestAcceptView.as_view()),
    path("requests/<int:pk>/reject/", views.MentorRequestRejectView.as_view()),

    # Assignments
    path("assignments/<int:pk>/", views.AssignmentDeleteView.as_view()),

    # Mentor sees their traders
    path("my-traders/", views.MentorTraderListView.as_view()),
    path("traders/<int:trader_id>/trades/", views.MentorTraderTradeListView.as_view()),

    # Trader sees their mentor
    path("my-mentor/", views.MentorMyMentorView.as_view()),
    path("mentor-trades/", views.MentorTradesView.as_view()),

    # Annotations
    path("trades/<int:trade_id>/annotations/", views.AnnotationListCreateView.as_view()),
    path("annotations/<int:pk>/", views.AnnotationDetailView.as_view()),
]

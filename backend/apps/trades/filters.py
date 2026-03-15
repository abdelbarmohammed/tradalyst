import django_filters
from .models import Trade, Direction, TradeResult, Emotion


class TradeFilter(django_filters.FilterSet):
    pair = django_filters.CharFilter(lookup_expr="icontains")
    direction = django_filters.ChoiceFilter(choices=Direction.choices)
    result = django_filters.ChoiceFilter(choices=TradeResult.choices)
    emotion = django_filters.ChoiceFilter(choices=Emotion.choices)
    entry_time_after = django_filters.DateTimeFilter(field_name="entry_time", lookup_expr="gte")
    entry_time_before = django_filters.DateTimeFilter(field_name="entry_time", lookup_expr="lte")

    class Meta:
        model = Trade
        fields = ["pair", "direction", "result", "emotion"]

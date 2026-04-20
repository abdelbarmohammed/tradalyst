from django.urls import path
from . import views

urlpatterns = [
    path("", views.TradeListCreateView.as_view()),
    path("stats/", views.TradeStatsView.as_view()),
    path("<int:pk>/", views.TradeDetailView.as_view()),
]

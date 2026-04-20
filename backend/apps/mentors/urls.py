from django.urls import path
from . import views

urlpatterns = [
    path("assignments/", views.AssignmentListCreateView.as_view()),
    path("assignments/<int:pk>/", views.AssignmentDetailView.as_view()),
    path("my-traders/", views.MentorTraderListView.as_view()),
    path("traders/<int:trader_id>/trades/", views.MentorTraderTradeListView.as_view()),
    path("trades/<int:trade_id>/annotations/", views.AnnotationListCreateView.as_view()),
    path("annotations/<int:pk>/", views.AnnotationDetailView.as_view()),
]

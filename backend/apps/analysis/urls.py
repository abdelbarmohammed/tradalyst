from django.urls import path
from . import views

urlpatterns = [
    path("insights/", views.InsightListView.as_view()),
    path("insights/generate/", views.InsightGenerateView.as_view()),
    path("chat/", views.ChatHistoryView.as_view()),
    path("chat/send/", views.ChatSendView.as_view()),
]

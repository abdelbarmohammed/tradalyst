from django.urls import path
from . import admin_views

urlpatterns = [
    path("stats/", admin_views.AdminStatsView.as_view()),
    path("mentorships/", admin_views.AdminMentorshipsView.as_view()),
    path("assignments/<int:pk>/", admin_views.AdminAssignmentDeleteView.as_view()),
    path("users/<int:pk>/trades/", admin_views.AdminUserTradesView.as_view()),
    path("export/users/", admin_views.AdminExportUsersView.as_view()),
]

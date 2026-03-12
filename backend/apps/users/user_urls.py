from django.urls import path
from . import views

urlpatterns = [
    path("me/", views.UserMeView.as_view()),
    path("", views.AdminUserListView.as_view()),
    path("<int:pk>/", views.AdminUserDetailView.as_view()),
]

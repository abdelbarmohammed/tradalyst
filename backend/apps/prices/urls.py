from django.urls import path
from . import views

urlpatterns = [
    path("", views.PriceView.as_view()),
]

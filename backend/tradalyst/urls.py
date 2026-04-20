from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/users/", include("apps.users.user_urls")),
    path("api/trades/", include("apps.trades.urls")),
    path("api/analysis/", include("apps.analysis.urls")),
    path("api/mentors/", include("apps.mentors.urls")),
    path("api/prices/", include("apps.prices.urls")),
]

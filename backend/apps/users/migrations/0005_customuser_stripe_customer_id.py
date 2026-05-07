from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0004_customuser_pinned_assets"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="stripe_customer_id",
            field=models.CharField(blank=True, max_length=100),
        ),
    ]

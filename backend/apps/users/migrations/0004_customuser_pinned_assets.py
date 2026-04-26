from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_customuser_language_preference'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='pinned_assets',
            field=models.JSONField(blank=True, default=list),
        ),
    ]

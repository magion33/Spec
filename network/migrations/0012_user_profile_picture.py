# Generated by Django 3.2.3 on 2021-08-26 15:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0011_like_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='profile_picture',
            field=models.ImageField(blank=True, null=True, upload_to=''),
        ),
    ]
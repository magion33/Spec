# Generated by Django 3.2.3 on 2021-08-17 11:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_post_author'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='time_string',
            field=models.CharField(max_length=30, null=True),
        ),
    ]

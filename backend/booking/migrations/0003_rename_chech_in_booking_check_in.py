# Generated by Django 5.1 on 2024-09-14 19:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0002_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='booking',
            old_name='chech_in',
            new_name='check_in',
        ),
    ]

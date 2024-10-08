# Generated by Django 5.1 on 2024-09-11 19:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0006_hotel_manager_hotel'),
    ]

    operations = [
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=100)),
                ('floor', models.CharField(blank=True, max_length=100)),
                ('is_occupied', models.BooleanField(default=False)),
                ('beds', models.PositiveIntegerField(default=2)),
                ('hotel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.hotel')),
            ],
            options={
                'unique_together': {('hotel', 'name')},
            },
        ),
    ]

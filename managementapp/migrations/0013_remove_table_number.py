# Generated by Django 5.1 on 2024-10-20 15:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('managementapp', '0012_alter_table_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='table',
            name='number',
        ),
    ]
# Generated by Django 4.2 on 2023-04-16 08:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('english', '0014_alter_word_last_review'),
    ]

    operations = [
        migrations.AlterField(
            model_name='word',
            name='last_review',
            field=models.DateTimeField(default='2023.04.16'),
        ),
    ]

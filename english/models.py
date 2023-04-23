from django.db import models
from django.contrib.auth.models import User
import datetime

# Create your models here.

class Type(models.Model):
    code = models.CharField(max_length=5)
    name = models.CharField(max_length=30)

    def __str__(self):
        return f"{self.id}: {self.name}, {self.code}"

class Level(models.Model):
    code = models.CharField(max_length=2)
    name = models.CharField(max_length=30)

    def __str__(self):
        return f"{self.id}: {self.code} -> {self.name}"

class Word(models.Model):
    word = models.CharField(max_length=200)
    meaning = models.TextField()
    type = models.ForeignKey(Type, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name="level")
    last_review = models.DateTimeField(default="2023.04.16")

    def __str__(self):
        return f"{self.id}: {self.word}: {self.level.code}"

class WordImage(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    users = models.ManyToManyField(User, blank=True, related_name="users")
    url = models.TextField()

    def __str__(self):
        return f"{self.id}: {self.word.word}, {self.url}"

class Example(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name="examples")
    sentence = models.TextField()

    def __str__(self):
        return f"{self.id}: {self.word.word} -> {self.sentence}"

class LearningList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    words = models.ManyToManyField(Word, blank=True)
    learned = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True, blank=True)

    def __str__(self):
        return f"#{self.id}: {self.user.username}, {self.created.day} {self.created.strftime('%B')}"

class ListReview(models.Model):
    list = models.ForeignKey(LearningList, on_delete=models.CASCADE, related_name="reviews")
    datetime = models.DateTimeField()

    def __str__(self):
        return f"{self.id}: {self.datetime.day} {self.datetime.strftime('%B')}"
    
class WordLastReview(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    datetime = models.DateTimeField(default=datetime.datetime.now)

    def __str__(self):
        return f"{self.id}: {self.word.word}, {self.datetime.day} : {self.datetime.strftime('%B')}"

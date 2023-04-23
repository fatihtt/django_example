from django.contrib import admin
from .models import Type, Level, Word, WordImage, Example, LearningList, ListReview, WordLastReview

# Register your models here.
admin.site.register(Type)
admin.site.register(Level)
admin.site.register(Word)
admin.site.register(WordImage)
admin.site.register(Example)
admin.site.register(LearningList)
admin.site.register(ListReview)
admin.site.register(WordLastReview)
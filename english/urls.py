from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("review", views.review_view, name="review"),
    path("reviewed", views.reviewed_view, name="reviewed"),
    path("newlist", views.new_list_view, name="newlist"),
    path("newlistcreate", views.new_list_create_view, name="newlistcreate"),
    path("move-list-learned", views.move_list_learned_view, name="move-list-learned"),
    path("my-words-review", views.my_words_review_view, name="my-words-review"),
    path("word-reviewed", views.word_reviewed_view, name="word-reviewed"),
    path("signup", views.signup_view, name="signup")
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
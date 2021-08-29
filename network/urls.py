from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("following", views.following, name="following"),
    path("<str:username>", views.profile, name="profile"),

    # API Routes
    path("posts/create", views.create, name="create"),
    path("posts/<int:post_id>", views.edit, name="edit"),
    path("posts/all", views.all_posts, name="all_posts"),
    path("follow/<str:follower_n>/<str:followed_n>", views.follow, name="follow"),
    path("following/all", views.all_following, name="all_following"),
    path("likes/<int:post_id>", views.likes, name="likes"),
    path("like/<int:post_id>", views.like, name="like")
]

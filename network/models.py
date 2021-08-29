from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    profile_picture = models.ImageField(default="placeholder_img.jpg", null=True, blank=True)

    def serialize(self):
        return {
            "username": self.username
        }


class Follow(models.Model):
    follower = models.ForeignKey("User", on_delete=models.CASCADE, null=True, related_name="reverse_follower")
    followed = models.ForeignKey("User", on_delete=models.CASCADE, null=True, related_name="followed")
    status = models.BooleanField(default=False)

    def serialize(self):
        return {
            "follower": self.follower.username,
            "followed": self.followed.username,
            "status": self.status
        }

    def serialize2(self):
        return {
            "followed": self.followed.username
        }


class Post(models.Model):
    text = models.TextField()
    author = models.ForeignKey("User", on_delete=models.CASCADE, null=True)
    time_string = models.CharField(max_length=30, null=True)
    likes = models.IntegerField(default=0, null=True)

    def serialize(self):
        return {
            "id": self.pk,
            "author": self.author.username,
            "time_string": self.time_string,
            "text": self.text,
            "likes": Like.objects.filter(post=self).all().count()
        }


class Like(models.Model):
    post = models.ForeignKey("Post", on_delete=models.CASCADE, null=True)
    liker = models.ForeignKey("User", on_delete=models.CASCADE, null=True)
    status = models.BooleanField(default=False)

    def serialize(self):
        return {
            "post": self.post.id,
            "liker": self.liker.username,
            "status": self.status
        }

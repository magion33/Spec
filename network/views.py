from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post, Follow, Like
from django import forms
import time
import datetime
from django.http import JsonResponse
import json
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt


# create new post
@csrf_exempt
def create(request):
    if request.method == "POST":
        data = json.loads(request.body)
        ts = time.time()
        time_string = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
        if data.get("text") is not None and request.user.is_authenticated:
            if data["text"] is not "":
                new_post = data["text"]
                p = Post(text=new_post, author=request.user, time_string=time_string)
                p.save()
                # IMPORTANT - also create like fields for every user
                all_users = User.objects.all()
                for i in all_users:
                    l = Like(post=p, liker=i, status=False)
                    l.save()
                return JsonResponse({"message": "Post created."}, status=201)
            else:
                pass


# get all posts
def all_posts(request):
    posts = reversed(Post.objects.all())
    return JsonResponse([i.serialize() for i in posts], safe=False)


# edit a post
@csrf_exempt
@login_required
def edit(request, post_id):
    post = Post.objects.get(id=post_id)
    if request.method == "GET":
        return JsonResponse(post.serialize, safe=False)
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("text") is not None:
            post.text = data["text"]
            post.save()
            return HttpResponse(status=204)


# GET - find out if user is following user    PUT - make user follow user
@csrf_exempt
@login_required
def follow(request, follower_n, followed_n):
    follower = User.objects.get(username=follower_n)
    followed = User.objects.get(username=followed_n)
    follow = Follow.objects.get(follower=follower, followed=followed)
    if request.method == "GET":
        return JsonResponse(follow.serialize(), safe=False)
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("status") is not None:
            follow.status = data["status"]
            follow.save()
            return HttpResponse(status=204)


# GET all users the logged user is following, used for Following page
def all_following(request):
    all_following = Follow.objects.filter(follower=request.user, status=True).all()
    return JsonResponse([i.serialize2() for i in all_following], safe=False)


# like/unlike post by user
@csrf_exempt
def like(request, post_id):
    the_like = Like.objects.get(post=post_id, liker=request.user)
    if request.method == "GET":
        return JsonResponse(the_like.serialize(), safe=False)
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("status") is not None:
            the_like.status = data["status"]
            the_like.save()
            return HttpResponse(status=204)


# GET all likes of a post (to determine number of likes)
def likes(request, post_id):
    likes_of_post = Like.objects.filter(post=(Post.objects.get(id=post_id)), status=True).all()
    return JsonResponse([i.serialize() for i in likes_of_post], safe=False)


# index page
def index(request):
    return render(request, "network/index.html", {
        "posts": reversed(Post.objects.all())
    })


# profile page
def profile(request, username):
    try:
        username = username.capitalize()
        User.objects.get(username=username)
        following = Follow.objects.filter(follower=User.objects.get(username=username), status=True).all()
        followers = Follow.objects.filter(followed=User.objects.get(username=username), status=True).all()
        return render(request, "network/profile.html", {
            "profile": User.objects.get(username=username),
            "followers_num": followers.count(),
            "following_num": following.count()
        })
    except:
        return render(request, "network/not_found.html")


# I need to account for not logged in user accessing http://127.0.0.1:8000/following
# and all urls not existing like profile
# Following page
def following(request):
    if request.user.is_authenticated:
        following = Follow.objects.filter(follower=request.user, status=True).all()
        return render(request, "network/following.html", {
        })
    else:
        return render(request, "network/not_found.html")


# Login page
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


# Logout page
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


# Register page
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            # IMPORTANT - also create 2n follow fields (including 2 self-follows)
            all_users = User.objects.all()
            for i in all_users:
                f = Follow(follower=user, followed=i, status=False)
                f.save()
                f2 = Follow(follower=i, followed=user, status=False)
                f2.save()
            duplicates = Follow.objects.filter(follower=user, followed=user)
            # delete one of the duplicates
            for i in duplicates:
                i.delete()
                break  # to delete only one of the duplicates
            # IMPORTANT - also create n likes - for every post and the new user
            all_posts = Post.objects.all()
            for i in all_posts:
                l = Like(post=i, liker=user, status=False)
                l.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

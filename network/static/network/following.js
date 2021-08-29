document.addEventListener('DOMContentLoaded', function() {

    // Checking if user is logged in
    let currentUser
    let x = document.querySelector("#current-user");
    if (x !== null) {
        currentUser = document.querySelector("#current-user").innerHTML;
    } else {
        currentUser = null;}


    fetch('following/all')
    .then(response => response.json())
    .then(followedUsers => {
        fetch('/posts/all')
        .then(response => response.json())
        .then(allPosts => {
            let postCounter = 0;
            allPosts.forEach(element => {
                for (i in followedUsers) {
                    if ( element.author === followedUsers[i].followed ) {
                        let individualPostDiv = document.createElement("div");
                        individualPostDiv.className = "individual-post";
                        individualPostDiv.id = `p${postCounter}`;
                        document.querySelector("#posts").appendChild(individualPostDiv);

                        postCounter++;

                        let postUserName = document.createElement("div");
                        postUserName.innerHTML =
                        `<a class="profile-link" href="/${element.author}">${element.author}</a>` ;
                        individualPostDiv.appendChild(postUserName);

                        let postTimeString = document.createElement("div");
                        postTimeString.className = "time-string";
                        postTimeString.innerHTML = `${element.time_string}`;
                        individualPostDiv.appendChild(postTimeString);

                        let textWrap = document.createElement("div");
                        textWrap.className = "text-wrap";
                        individualPostDiv.appendChild(textWrap);

                        let postText = document.createElement("div");
                        postText.className = "post-text";
                        postText.innerHTML = `${element.text}`;
                        textWrap.appendChild(postText);

                        let likeWrap = document.createElement("div");
                        likeWrap.className = "like-wrap";
                        individualPostDiv.appendChild(likeWrap);

                        fetch(`likes/${element.id}`)
                        .then(response => response.json())
                        .then(likesOfPost => {

                            let LikeButton = document.createElement("button");
                            LikeButton.className = "like-btn";
                            LikeButton.innerHTML = "&#10084;";
                            LikeButton.setAttribute("title", "Like");
                            LikeButton.style.display = 'none';
                            likeWrap.appendChild(LikeButton);

                            let UnlikeButton = document.createElement("button");
                            UnlikeButton.className = "unlike-btn";
                            UnlikeButton.innerHTML = "&#10084;";
                            UnlikeButton.setAttribute("title", "Unlike");
                            UnlikeButton.style.display = 'none';
                            likeWrap.appendChild(UnlikeButton);

                            let postLikes = document.createElement("div");
                            postLikes.innerHTML = `${likesOfPost.length}`;
                            likeWrap.appendChild(postLikes);

                            LikeButton.addEventListener("click", function like() {
                                fetch(`like/${element.id}`, {
                                    method: "PUT",
                                    body: JSON.stringify({
                                        status: true
                                    })
                                });
                                // Asynchronously increase follower count
                                let likeCount = parseInt(postLikes.innerHTML);
                                likeCount++;
                                postLikes.innerHTML = likeCount;
                                // Change buttons
                                LikeButton.style.display = 'none';
                                UnlikeButton.style.display = 'block';
                            })

                            UnlikeButton.addEventListener("click", function() {
                                fetch(`like/${element.id}`, {
                                    method: "PUT",
                                    body: JSON.stringify({
                                        status: false
                                    })
                                });
                                // Asynchronously decrease follower count
                                let likeCount = parseInt(postLikes.innerHTML);
                                likeCount--;
                                postLikes.innerHTML = likeCount;
                                // Change buttons
                                UnlikeButton.style.display = 'none';
                                LikeButton.style.display = 'block';
                            })

                            fetch(`like/${element.id}`)
                            .then(response => response.json())
                            .then(likedOrNot => {
                                if (likedOrNot.status === false) {
                                    LikeButton.style.display = 'block';
                                } else {
                                    UnlikeButton.style.display = 'block';
                                }
                            });
                        });

                        // Editing posts
                        let editButton = document.createElement("button");
                        editButton.innerHTML = "Edit";
                        editButton.style.display = 'none';
                        individualPostDiv.appendChild(editButton);
                        if (element.author === currentUser) {
                            editButton.style.display = 'block';
                        }
                        let editTextPlaceholder = `${element.text}`
                        editButton.addEventListener("click", function() {
                            postText.innerHTML = null;
                            let editField = document.createElement("textarea");
                            editField.value = editTextPlaceholder;
                            editButton.style.display = "none";
                            postText.appendChild(editField);
                            let submitButton = document.createElement("button");
                            submitButton.id = `s${element.id}`
                            submitButton.innerHTML = "Save";
                            editField.parentNode.insertBefore(submitButton, editField.nextSibling);

                            document.querySelector(`#s${element.id}`).addEventListener("click", function() {
                                let newText = editField.value;
                                fetch(`posts/${element.id}`, {
                                    method: "PUT",
                                    body: JSON.stringify({
                                        text: newText
                                    })
                                })
                            postText.innerHTML = newText;
                            editTextPlaceholder = newText;
                            editButton.style.display = "block";
                            });
                        });


                    }
                }
            })

            // If no posts in Following
            if ( postCounter == 0 ) {
                let noFollows = document.createElement("p");
                document.querySelector("#posts").appendChild(noFollows);
                noFollows.innerHTML = "Follow people to see their posts here.";
            }

// Pagination - quantity set to 10
    let quantity = 10;
    let counter = quantity + 1;
    if ( postCounter > quantity ) {
        for (let i = (quantity + 1); i < (postCounter + 1); i++) {
            document.querySelector(`#p${i-1}`).style.display = 'none';
        }
        // create Previous button and hide it
        let previousButton = document.createElement("button");
        previousButton.id = "previous-button";
        previousButton.innerHTML = "&#x2039;";
        previousButton.setAttribute("title","Previous posts");
        /*previousButton.style.display = 'none';*/
        previousButton.disabled = true;
        previousButton.setAttribute("title","");
        document.querySelector("#posts").appendChild(previousButton);
        previousButton.addEventListener("click", function() {
            loadPreviousPage();
        })
        // create Next button
        let nextButton = document.createElement("button");
        nextButton.id = "next-button";
        nextButton.innerHTML = "&#x203A;";
        nextButton.setAttribute("title","Next posts");
        document.querySelector("#posts").appendChild(nextButton);
        nextButton.addEventListener("click", function() {
            loadNextPage();
        })

    }
    function loadNextPage() {
        /*document.querySelector("#previous-button").style.display = 'block';*/
        document.querySelector("#previous-button").disabled = false;
        document.querySelector("#previous-button").setAttribute("title","Previous posts");
        let start = counter;
        if ( (start + quantity - 1) < postCounter) {
            let end = start + quantity - 1;
            for (let i = 1; i < start; i++) {
                document.querySelector(`#p${i-1}`).style.display = 'none';
            }
            for (let i = start; i < (end + 1); i++) {
                document.querySelector(`#p${i-1}`).style.display = 'block';
            }
                counter = end + 1;
        } else {
            let end = postCounter;
            for (let i = 1; i < start; i++) {
                document.querySelector(`#p${i-1}`).style.display = 'none';
            }
            for (let i = start; i < (end + 1); i++) {
            document.querySelector(`#p${i-1}`).style.display = 'block';
            }
            counter = start + quantity;
            /*document.querySelector("#next-button").style.display = 'none';*/
            document.querySelector("#next-button").disabled = true;
            document.querySelector("#next-button").setAttribute("title","");
        }
        window.scrollTo(0, 0);
     }

    function loadPreviousPage() {
        /*document.querySelector("#next-button").style.display = 'block';*/
        document.querySelector("#next-button").disabled = false;
        document.querySelector("#next-button").setAttribute("title","Next posts");
        let start = counter - (2 * quantity);
        let end = start + quantity - 1;
        if ( (end + quantity) > postCounter ) {
            for (let i = start + quantity; i < (postCounter + 1); i++) {
                document.querySelector(`#p${i-1}`).style.display = 'none';
            }
        }
        else {
            for (let i = start + quantity; i < (end + quantity + 1); i++) {
                document.querySelector(`#p${i-1}`).style.display = 'none';
            }
        }
        for (let i = start; i < (end + 1); i++) {
            document.querySelector(`#p${i-1}`).style.display = 'block';
        }
        counter = counter - quantity;
        if ( counter === (quantity + 1) ) {
            /*document.querySelector("#previous-button").style.display = 'none';*/
            document.querySelector("#previous-button").disabled = true;
            document.querySelector("#previous-button").setAttribute("title","");
        }
        window.scrollTo(0, 0);
    }




        })
    });


});


document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('#follow-btn').style.display = 'none';   // by default hide follow btn
    document.querySelector('#unfollow-btn').style.display = 'none'; // by default hide unfollow btn
    // getting displayed profile's username - capitalized first letter
    let str = window.location.pathname.slice(1);
    let cap_str = str.charAt(0).toUpperCase() + str.slice(1);
    const profileUser = cap_str;

    // Unfollow button styling
    fBtn = document.querySelector("#follow-btn");
    uBtn = document.querySelector("#unfollow-btn");
    fBtn.onclick = function() {
        uBtn.innerHTML = "Following";
        uBtn.onmouseover = function() {
            uBtn.innerHTML = "Following";
            uBtn.style.color = "black";
            uBtn.style.backgroundColor = "white";
            uBtn.style.borderColor = "#E0E0E0";
        }
    }
    uBtn.onmouseout = function() {
        uBtn.innerHTML = "Following";
        uBtn.style.color = "black";
        uBtn.style.backgroundColor = "white";
        uBtn.style.borderColor = "#E0E0E0";
        uBtn.onmouseover = function() {
            uBtn.innerHTML = "Unfollow";
            uBtn.style.color = "red";
            uBtn.style.backgroundColor = "#ffd6eb";
            uBtn.style.borderColor = "#ffc7e3";
        }
    }
    uBtn.onmouseover = function() {
            uBtn.innerHTML = "Unfollow";
            uBtn.style.color = "red";
            uBtn.style.backgroundColor = "#ffd6eb";
            uBtn.style.borderColor = "#ffc7e3";
    }


    // Checking if user is logged in
    let currentUser
    let x = document.querySelector("#current-user");
    if (x !== null) {
        currentUser = document.querySelector("#current-user").innerHTML;
    } else {
        currentUser = null;
        let followNotLogged = document.createElement('button');
        followNotLogged.id = "follow-btn";
        followNotLogged.innerHTML = "Follow";
        document.querySelector('#follow-unfollow').appendChild(followNotLogged);
        followNotLogged.onclick = function() {

            // Get the modal
            let modal = document.getElementById("myModal");
            modal.style.display = "block";
            document.querySelector("body").classList.add("freeze-scrolling");
            document.querySelector("#modal-login").onclick = function() {
                window.location.href = "/login";
            }
            document.querySelector("#modal-register").onclick = function() {
                window.location.href = "/register";
            }
            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                document.querySelector("body").classList.remove("freeze-scrolling");
                }
            }

        }
    }

    // GET and display ONLY posts from the displayed profile USER
    fetch('/posts/all')
    .then(response => response.json())
    .then(data => {
        let postCounter = 0;
        data.forEach(element => {
            if ( element.author === profileUser ) {
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
                individualPostDiv.appendChild(likeWrap)

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
                    UnlikeButton.innerHTML = "&#10084;";;
                    UnlikeButton.setAttribute("title", "Unlike");
                    UnlikeButton.style.display = 'none';
                    likeWrap.appendChild(UnlikeButton);

                    // Like button if not logged in
                    let likeNotLogged = document.createElement("button");
                    likeNotLogged.className = "like-btn";
                    likeNotLogged.innerHTML = "&#10084;";
                    likeNotLogged.setAttribute("title", "Like");
                    likeNotLogged.style.display = 'none';
                    likeWrap.appendChild(likeNotLogged);

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


                    if ( currentUser !== null ) {
                        fetch(`like/${element.id}`)
                        .then(response => response.json())
                        .then(likedOrNot => {
                            if (likedOrNot.status === false) {
                                LikeButton.style.display = 'block';
                            } else {
                                UnlikeButton.style.display = 'block';
                            }
                        });
                    } else { likeNotLogged.style.display = 'block'; }

// Get the modal
let modal = document.getElementById("myModal");
// When the user clicks on the button, open the modal
likeNotLogged.onclick = function() {
  modal.style.display = "block";
  document.querySelector("body").classList.add("freeze-scrolling");
  document.querySelector("#modal-login").onclick = function() {
      window.location.href = "/login";
  }
  document.querySelector("#modal-register").onclick = function() {
      window.location.href = "/register";
  }
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    document.querySelector("body").classList.remove("freeze-scrolling");
  }
}

            });


            // Editing posts
            let editButton = document.createElement("button");
            editButton.className = "edit-btn";
            editButton.innerHTML = "&#9998;";
            editButton.setAttribute("title", "Edit");
            editButton.style.display = 'none';
            textWrap.insertBefore(editButton, postText.nextSibling);
            if (element.author === currentUser) {
                editButton.style.display = 'block';
            }
            let editTextPlaceholder = `${element.text}`
            // Edit button function is complicated
            editButton.addEventListener("click", function() {
                postText.innerHTML = null;
                let editField = document.createElement("textarea");
                editField.className = "edit-field";
                editField.value = editTextPlaceholder;
                editButton.style.display = "none";
                postText.appendChild(editField);
                editField.focus();
                editField.setAttribute("spellcheck","false");
                let submitButton = document.createElement("button");
                submitButton.className = "submit-btn";
                submitButton.id = `s${element.id}`
                submitButton.innerHTML = "&#x1f4be;";
                submitButton.setAttribute("title", "Save");
                editField.parentNode.insertBefore(submitButton, editField.nextSibling);

                // Enables Save button function
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

        });

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
        //previousButton.style.display = 'none';
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



    });


    // Following system
    if ( currentUser !== null ) {
        fetch(`/follow/${currentUser}/${profileUser}`)
        .then(response => response.json())
        .then(data => {
            /* Showing correct button (follow/unfollow) based on the status
               whether the logged in user is following the displayed profile user or not */
            if (profileUser !== currentUser) {
                if (data.status === false) {
                    document.querySelector("#follow-btn").style.display = 'block';
                    document.querySelector("#unfollow-btn").style.display = 'none';
                } else {
                    document.querySelector("#follow-btn").style.display = 'none';
                    document.querySelector("#unfollow-btn").style.display = 'block';
                }
            }

            // Follow button function
            document.querySelector("#follow-btn").addEventListener("click", function() {
                fetch(`/follow/${currentUser}/${profileUser}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        status: true
                    })
                });
                // Asynchronously increase follower count
                let followerCount = parseInt(document.querySelector("#follower-count").innerHTML);
                followerCount++;
                document.querySelector("#follower-count").innerHTML = followerCount;
                // Hide follow-btn, show unfollow-btn
                document.querySelector('#follow-btn').style.display = 'none';
                document.querySelector('#unfollow-btn').style.display = 'block';
            })
            // Unfollow button function
            document.querySelector("#unfollow-btn").addEventListener("click", function() {
                fetch(`/follow/${currentUser}/${profileUser}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        status: false
                    })
                });
                // Asynchronously decrease follower count
                followerCount = parseInt(document.querySelector("#follower-count").innerHTML);
                followerCount--;
                document.querySelector("#follower-count").innerHTML = followerCount;
                // Hide unfollow-btn, show follow-btn
                document.querySelector('#follow-btn').style.display = 'block';
                document.querySelector('#unfollow-btn').style.display = 'none';
            })
        });
    }


});
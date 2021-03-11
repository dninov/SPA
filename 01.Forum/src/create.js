/////// PROBABLY IT SHOULDN'T BE CALLED CREATE, BUT ANYHOW...

/////// INITIALISE SECTION
export async function showCreate(id){
    const main = document.getElementById('main');
    main.innerHTML = '';
    // this is the main div
    const parentDiv = document.createElement('div');
    parentDiv.className = 'theme-content';
    main.appendChild(parentDiv);
    // this is comments-only div
    const commentsDiv = document.createElement('div');
    commentsDiv.id = 'comments';
    //create the header
    await loadPost(id);
    parentDiv.appendChild(commentsDiv);
    //load the comments filtered by postId
    await loadComments(id);
    createForm(parentDiv);
    document.getElementById('commentBtn').addEventListener('click', (e) => postNewComment(e, id));
}

async function loadPost(id){
    const response = await fetch('http://localhost:3030/jsonstore/collections/myboard/posts/' + id);
    const data = await response.json();
    if (response.ok == false) {
        const error = await response.json();
        return alert(error.message);
    }
    createTitle(data);
}

function createTitle(d){
    const parentDiv = document.querySelector('.theme-content')
    const title = document.createElement('div');
    title.className = 'theme-title';
    title.innerHTML = `<div class="theme-name-wrapper">
                            <div class="theme-name">
                                <h2>${d.topicName}</h2>
                                <p>Date: ${d.date}</p>
                            </div>
                        </div>`
    parentDiv.appendChild(title);
}

async function loadComments(id){
    document.getElementById('comments').innerHTML = '';
    const response = await fetch('http://localhost:3030/jsonstore/collections/myboard/comments');
    const data = await response.json();
    if (response.ok == false) {
        const error = await response.json();
        return alert(error.message);
    }
    const filteredComments = Object.values(data).filter(c=> c.postId == id).forEach(c=> createComment(c));
}

async function postNewComment(e, id){
    e.preventDefault();
    const form = document.querySelector('.answer form');
    const d = new Date;
    const formData = new FormData(form);
    const comment = {
        username: formData.get('username'),
        postText: formData.get('postText'),
        date: d,
        postId: id
    };
    if(comment.topicName == ''|| comment.username == ''|| comment.postText == ''){
        return alert('All fields are required!');
    }

    const response = await fetch('http://localhost:3030/jsonstore/collections/myboard/comments', {
        method:'post',
        headers:{
            'Content-Type': 'apllication/json'
        },
        body:JSON.stringify(comment)
    });
    if (response.ok) {
        form.reset();
        loadComments(id);
    }else{
        const error = response.json();
        alert (error.message);
    }
}

function createForm(parentDiv){
    const form = document.createElement('div');
    form.className = 'answer-comment';
    form.innerHTML = `<p><span>currentUser</span> comment:</p>
                        <div class="answer">
                            <form>
                                <textarea name="postText" id="comment" cols="30" rows="10"></textarea>
                                <div>
                                    <label for="username">Username <span class="red">*</span></label>
                                    <input type="text" name="username" id="username">
                                </div>
                                <button id = "commentBtn">Post</button>
                            </form>
                        </div>`
    parentDiv.appendChild(form);
}





function createComment(d){
    const comment = document.createElement('div');
    comment.className = 'comment';
    comment.innerHTML = ` <header class="header">
                            <p><span>${d.username}</span> posted on ${d.date}</p>
                        </header>
                        <div class="comment-main">
                            <div class="userdetails">
                                <img src="./static/profile.png" alt="avatar">
                            </div>
                            <div class="post-content"><p>${d.postText}</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p><span>5</span> likes</p>
                        </div>`;
    document.getElementById('comments').appendChild(comment);
}
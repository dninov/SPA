import { e } from './dom.js'
import { showCreate } from './create.js'
/////// SETUP HOME
export function showHome(){
    const main = document.getElementById('main');
    main.innerHTML = '';
    const div = e('div', {className: 'new-topic-border'});
    div.innerHTML = createForm();
    main.appendChild(div);
    const topicsContainer = e('div', {className:'topic-title'});
    main.appendChild(topicsContainer);
    const form = document.querySelector('.new-topic-border form');
    const submitBtn = form.querySelector('.public');
    const cancelBtn = form.querySelector('.cancel');
    submitBtn.addEventListener('click', onSubmit);
    cancelBtn.addEventListener('click', cancelForm);
    getPosts();
}
/////// LOAD ALL POSTS
async function getPosts(){
    const container = document.querySelector('.topic-title');
    container.innerHTML = '';
    const response = await fetch('http://localhost:3030/jsonstore/collections/myboard/posts');
    const data = await response.json();
    if (response.ok == false) {
        const error = await response.json();
        return alert(error.message);
    }
    Object.values(data).forEach(e => {container.appendChild(createPost(e))});
}
/////// CREATE A POST WITH HIDDEN ID AND ADD EVENT LISTENER TO IT
function createPost(p){
    const topic = e('div', {className:'topic-container'},
                    e('div', {className: 'topic-name-wrapper'},
                        e('div', {className: 'topic-name'}, 
                            e('a', {className:'normal', href: '#'},
                                e('h2', {}, p.topicName)
                            ),
                            e('div', {className: 'columns'},
                                e('div',{},
                                    e('p', {}, `Date: ${p.date}`),
                                    e('div', {className: 'nick-name'},
                                        e('p', {}, 'Username:' ,e('span', {}, p.username))
                                    ),
                                ),
                                e('div', {className: 'subscribers'},
                                    e('p', {}, 'Subscribers:' , e('span', {}, '0'))
                                )
                            ),
                            e('input', {type:'hidden'}, p._id)
                        )
        )
    );
    topic.querySelector('.normal').addEventListener('click', () => showCreate(p._id));
    return topic;
}
/////// SENDING THE POST FIRST AND THEN CREATING A COMMENT WITH THE GIVEN POST ID
async function onSubmit(event){
    event.preventDefault();
    const form = document.querySelector('.new-topic-border form');
    const d = new Date;
    const formData = new FormData(form);
    const comment = {
        topicName: formData.get('topicName'),
        username: formData.get('username'),
        postText: formData.get('postText'),
        date: d
    };
    if(comment.topicName == ''|| comment.username == ''|| comment.postText == ''){
        return alert('All fields are required!');
    }
    const response = await fetch('http://localhost:3030/jsonstore/collections/myboard/posts', {
        method:'post',
        headers:{
            'Content-Type': 'apllication/json'
        },
        body:JSON.stringify(comment)
    });
    if (response.ok) {       
        const data = await response.json();
        postFirstComment(data._id, comment);
        form.reset();
        getPosts();
    }else{
        const error = response.json();
        alert (error.message);
    }
}

/////// SENDING THE FIRST COMMENT
async function postFirstComment(id, c){
    const comment = {
        username: c.username,
        postText: c.postText,
        date: c.date,
        postId: id
    };
    const response = await fetch('http://localhost:3030/jsonstore/collections/myboard/comments', {
        method:'post',
        headers:{
            'Content-Type': 'apllication/json'
        },
        body:JSON.stringify(comment)
    });
    if (response.ok) {
        return
    }else{
        const error = response.json();
        alert (error.message);
    }
}

function cancelForm(event){
    event.preventDefault();
    const form = document.querySelector('.new-topic-border form');
    form.reset();
}
function createForm(){
    const form = `
    <div class="header-background">
        <span>New Topic</span>
    </div>
    <form>
        <div class="new-topic-title">
            <label for="topicName">Title <span class="red">*</span></label>
            <input type="text" name="topicName" id="topicName">
            <input type="hidden" name="topicDate" value="">
        </div>
        <div class="new-topic-title">
            <label for="username">Username <span class="red">*</span></label>
            <input type="text" name="username" id="username">
        </div>
        <div class="new-topic-content">
            <label for="postText">Post <span class="red">*</span></label>
            <textarea type="text" name="postText" id="postText" rows="8" class="height"></textarea>
        </div>
        <div class="new-topic-buttons">
            <button class="cancel">Cancel</button>
            <button class="public">Post</button>
        </div>

    </form>
    `
    return form;
}
const BASE_URL = "/feedup";

document.addEventListener("DOMContentLoaded", () => {
  loadAllPosts();
  loadTopPosts();
  loadMyPosts();
});

async function post() {
  const message = document.getElementById("message").value.trim();
  if (!message) return alert("Please write something before posting!");

  const res = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ post: message })
  });

  if (res.ok) {
    document.getElementById("message").value = "";
    loadAllPosts();
    loadMyPosts();
    loadTopPosts();
  } else {
    const data = await res.json();
    alert(data.error || "Failed to post");
  }
}

// ALL POSTS - sorted by date - with upvote button
async function loadAllPosts() {
  const res = await fetch(`${BASE_URL}/posts`, {
    credentials: "include"
  });
  const feeds = await res.json();

  const list = document.getElementById("allfeedlist");
  list.innerHTML = "";

  if (feeds.length === 0) {
    list.innerHTML = "<li>No Posts Yet!!!</li>";
    return;
  }

  feeds.forEach(feed => {
    const li = document.createElement("li");
    li.className = "border rounded p-3 mb-3 text-start";
    li.innerHTML = `
      <p class="mb-1">${feed.post}</p>
      <small class="text-muted">${new Date(feed.createdAt).toLocaleString()}</small>
      <div class="mt-2">
        <button onclick="upvote('${feed._id}')" class="btn btn-sm btn-outline-success">
          ▲ ${feed.votes}
        </button>
      </div>
    `;
    list.appendChild(li);
  });
}

// TOP POSTS - sorted by votes - no upvote button
async function loadTopPosts() {
  const res = await fetch(`${BASE_URL}/posts/top`, {
    credentials: "include"
  });
  const feeds = await res.json();

  const list = document.getElementById("topfeedlist"); 
  list.innerHTML = "";

  if (feeds.length === 0) {
    list.innerHTML = "<li>No Posts Yet!!!</li>";
    return;
  }

  feeds.forEach(feed => {
    const li = document.createElement("li");
    li.className = "border rounded p-3 mb-3 text-start";
    li.innerHTML = `
      <p class="mb-1">${feed.post}</p>
      <small class="text-muted">Votes: ${feed.votes}</small>
    `;
    list.appendChild(li);
  });
}

// MY POSTS - with delete button
async function loadMyPosts() {
  const res = await fetch(`${BASE_URL}/posts/my`, {
    credentials: "include"
  });
  const feeds = await res.json();

  const list = document.getElementById("mypostlist");
  list.innerHTML = "";

  if (feeds.length === 0) {
    list.innerHTML = "<li>No Posts by me Yet!!!</li>";
    return;
  }

  feeds.forEach(feed => {
    const li = document.createElement("li");
    li.className = "border rounded p-3 mb-3 text-start";
    li.innerHTML = `
      <p class="mb-1">${feed.post}</p>
      <small class="text-muted">${new Date(feed.createdAt).toLocaleString()}</small>
      <div class="mt-2">
<button onclick="deletePost('${feed._id}')" class="btn btn-sm btn-danger text-white">
  <i class="bi bi-trash"></i> Delete
</button>
      </div>
    `;
    list.appendChild(li);
  });
}

async function upvote(id) {
  const res = await fetch(`${BASE_URL}/posts/${id}/upvote`, {
    method: "PATCH",
    credentials: "include"
  });

  if (res.ok) {
    loadAllPosts();
    loadTopPosts();
  } else {
    const data = await res.json();
    alert(data.error || "Failed to upvote");
  }
}

async function deletePost(id) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (res.ok) {
    loadMyPosts();
    loadAllPosts();
  } else {
    const data = await res.json();
    alert(data.error || "Failed to delete post");
  }
}

function signOut() {
  window.location.href = `${BASE_URL}/signout`;
}
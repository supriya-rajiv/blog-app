// Wait for the page to fully load before running any JS
document.addEventListener('DOMContentLoaded', function() {

  const form = document.querySelector('form');
  if (form) {

    // REGISTER page (has #name field)
    if (document.querySelector('#name')) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.querySelector('#name').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          if (data.message.includes('successful')) form.reset();
        })
        .catch(err => alert('Error: ' + err));
      });
    }

    // CREATE BLOG page (has #title field)
    else if (document.querySelector('#title')) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please log in first.');
          window.location.href = 'login.html';
          return;
        }

        const title = document.querySelector('#title').value;
        const content = document.querySelector('#content').value;

        fetch('http://localhost:3000/api/blogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ title, content })
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          if (data.message.includes('successfully')) form.reset();
        })
        .catch(err => alert('Error: ' + err));
      });
    }

    // LOGIN page (has #email but NOT #name or #title)
    else if (document.querySelector('#email')) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name);
            window.location.href = 'dashboard.html';
          }
        })
        .catch(err => alert('Error: ' + err));
      });
    }
  }

  // HOME page: fetch and display all blogs
  const blogList = document.querySelector('#blog-list');
  if (blogList) {
    fetch('http://localhost:3000/api/blogs')
      .then(res => res.json())
      .then(blogs => {
        if (blogs.length === 0) {
          blogList.innerHTML = '<p>No blog posts yet. Be the first to create one!</p>';
          return;
        }

        blogList.innerHTML = blogs.map(blog => `
          <div class="post-card">
            <h3>${blog.title}</h3>
            <p>${blog.content.substring(0, 100)}...</p>
            <a href="pages/blog-detail.html?id=${blog._id}">Read more</a>
          </div>
        `).join('');
      })
      .catch(err => {
        blogList.innerHTML = '<p>Error loading posts.</p>';
        console.error(err);
      });
  }

  // BLOG DETAIL page: fetch and display one blog
  const blogTitle = document.querySelector('#blog-title');
  if (blogTitle) {
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get('id');

    fetch(`http://localhost:3000/api/blogs/${blogId}`)
      .then(res => res.json())
      .then(blog => {
        document.querySelector('#blog-title').textContent = blog.title;
        document.querySelector('#blog-content').textContent = blog.content;
        document.querySelector('#blog-date').textContent = new Date(blog.createdAt).toLocaleDateString();

        document.querySelector('#edit-title').value = blog.title;
        document.querySelector('#edit-content').value = blog.content;
      })
      .catch(err => {
        document.querySelector('#blog-title').textContent = 'Blog not found';
      });

    document.querySelector('#edit-btn').addEventListener('click', function() {
      document.querySelector('#edit-form-container').style.display = 'block';
    });

    document.querySelector('#edit-form').addEventListener('submit', function(event) {
      event.preventDefault();

      const title = document.querySelector('#edit-title').value;
      const content = document.querySelector('#edit-content').value;

      fetch(`http://localhost:3000/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        location.reload();
      })
      .catch(err => alert('Error: ' + err));
    });

    document.querySelector('#delete-btn').addEventListener('click', function() {
      const confirmDelete = confirm('Are you sure you want to delete this post?');
      if (!confirmDelete) return;

      fetch(`http://localhost:3000/api/blogs/${blogId}`, {
        method: 'DELETE'
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        window.location.href = '../index.html';
      })
      .catch(err => alert('Error: ' + err));
    });
  }

  // DASHBOARD page: show only logged-in user's blogs
  const myBlogList = document.querySelector('#my-blog-list');
  if (myBlogList) {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');

    if (!token) {
      alert('Please log in to view your dashboard.');
      window.location.href = 'login.html';
      return;
    }

    document.querySelector('#welcome-msg').textContent = `Welcome back, ${userName}!`;

    fetch('http://localhost:3000/api/my-blogs', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => {
        if (res.status === 401) {
          alert('Session expired. Please log in again.');
          localStorage.removeItem('token');
          window.location.href = 'login.html';
          return;
        }
        return res.json();
      })
      .then(blogs => {
        if (!blogs) return;
        if (blogs.length === 0) {
          myBlogList.innerHTML = '<p>You haven\'t published any posts yet.</p>';
          return;
        }

        myBlogList.innerHTML = blogs.map(blog => `
          <div class="post-card">
            <h3>${blog.title}</h3>
            <p>${blog.content.substring(0, 100)}...</p>
            <a href="blog-detail.html?id=${blog._id}">View / Edit</a>
          </div>
        `).join('');
      })
      .catch(err => {
        myBlogList.innerHTML = '<p>Error loading your posts.</p>';
      });
  }

  // LOGOUT (works on any page with this link)
  const logoutLink = document.querySelector('#logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(event) {
      event.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      window.location.href = '../index.html';
    });
  }

});
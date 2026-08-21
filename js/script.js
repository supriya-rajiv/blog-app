// Wait for the page to fully load before running any JS
document.addEventListener('DOMContentLoaded', function() {

  const form = document.querySelector('form');
  if (!form) return; // no form on this page, stop here

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

      const title = document.querySelector('#title').value;
      const content = document.querySelector('#content').value;

      fetch('http://localhost:3000/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      })
      .catch(err => alert('Error: ' + err));
    });
  }

});
// HOME page: fetch and display all blogs
document.addEventListener('DOMContentLoaded', function() {
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

        // Pre-fill the edit form with current values
        document.querySelector('#edit-title').value = blog.title;
        document.querySelector('#edit-content').value = blog.content;
      })
      .catch(err => {
        document.querySelector('#blog-title').textContent = 'Blog not found';
      });

    // Show edit form when "Edit" is clicked
    document.querySelector('#edit-btn').addEventListener('click', function() {
      document.querySelector('#edit-form-container').style.display = 'block';
    });

    // Handle saving the edit
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
        location.reload(); // refresh page to show updated content
      })
      .catch(err => alert('Error: ' + err));
    });

    // Handle delete
    document.querySelector('#delete-btn').addEventListener('click', function() {
      const confirmDelete = confirm('Are you sure you want to delete this post?');
      if (!confirmDelete) return;

      fetch(`http://localhost:3000/api/blogs/${blogId}`, {
        method: 'DELETE'
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        window.location.href = '../index.html'; // go back to home after deleting
      })
      .catch(err => alert('Error: ' + err));
    });
  }
  });
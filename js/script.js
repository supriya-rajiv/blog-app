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
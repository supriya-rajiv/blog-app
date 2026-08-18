// Wait for the page to fully load before running any JS
document.addEventListener('DOMContentLoaded', function() {

  // Try to find a login form on this page
  const loginForm = document.querySelector('#email');

  if (loginForm) {
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // stops the page from reloading
      alert('Login form submitted! (Backend not connected yet)');
    });
  }

});
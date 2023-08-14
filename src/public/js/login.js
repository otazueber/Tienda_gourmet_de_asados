const form = document.getElementById('loginForm')

form.addEventListener('submit', e => {
  e.preventDefault()

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const url = '/auth'
  const headers = {
    'Content-type': 'application/json',
  }
  const method = 'POST'
  const body = JSON.stringify({ email, password })
  fetch(url, {
    headers,
    method,
    body,
  })
    .then(response => response.json())
    .then(data => {
      if (data.status == 'success') {
        location.href = '/';
      } else {
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.innerHTML = data.message;
      }
    })
    .catch(error => console.error(error))
});

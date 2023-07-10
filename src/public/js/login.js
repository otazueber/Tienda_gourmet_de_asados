const form = document.getElementById('loginForm')

form.addEventListener('submit', e => {
  e.preventDefault()
  
  const data = new FormData(form)
  const obj = {}

  data.forEach((value, key) => (obj[key] = value))

  const url = '/auth'
  const headers = {
    'Content-type': 'application/json',
  }
  const method = 'POST'
  const body = JSON.stringify(obj)
  fetch(url, {
    headers,
    method,
    body,
  })
    .then(response => response.json())
    .then(data => redirect(data))
    .catch(error => console.error(error))
});

function redirect(data) {
  if (data.status == 'success') {
    location.href = '/api/views/products';
  } else {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.innerHTML = data.message;
  }
}
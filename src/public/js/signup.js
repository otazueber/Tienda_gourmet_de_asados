const form = document.getElementById('signupForm');

form.addEventListener('submit', e => {
  e.preventDefault();
  Submit();
});

function Submit() {
  const url = '/api/users';
  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));
  const options = {
    method: "POST",
    body: JSON.stringify(obj),
    headers: { "Content-Type": "application/json" },
  };

  fetch(url, options)
  .then(response => response.json())
  .then(data => redirect(data))
    .catch(error => console.log(error))
}

function redirect(data) {
  if (data.status == 'success') {
      location.href = '/login';
  }
}
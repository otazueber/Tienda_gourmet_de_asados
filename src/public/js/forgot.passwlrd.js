const form = document.getElementById('forgotPasswordForm')

form.addEventListener('submit', e => {
  e.preventDefault()
  const emailInput = document.getElementById('mail')
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    const errorMessage = document.getElementById('errorMessage')
    errorMessage.innerHTML = 'Por favor, ingresa una dirección de correo electrónico válida.';
  }
  else {
    const url = '/auth/mail-password'
    const headers = {
      'Content-type': 'application/json',
    }
    const method = 'POST'
    const body = JSON.stringify({ email })
    if (body.length > 0) {
      fetch(url, {
        headers,
        method,
        body,
      })
        .then(response => response.json())
        .then(redirect())
        .catch(error => console.error(error))
    }
  }
});

function redirect() {
  location.href = '/';
}
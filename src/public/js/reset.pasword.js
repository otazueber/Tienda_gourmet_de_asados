const form = document.getElementById("resetPassForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const userId = document.getElementById("userId");
  const pass1 = document.getElementById("password1");
  const pass2 = document.getElementById("password2");
  const errorMessage = document.getElementById("errorMessage");

  const email = userId.value.trim();
  const password1 = pass1.value.trim();
  const password2 = pass2.value.trim();

  if (password1 != password2) {
    errorMessage.innerHTML = "Las contraseñas no coinciden";
  } else if (password1.trim() == "") {
    errorMessage.innerHTML = "Ingrese una constraseña";
  } else {
    const url = "/auth/updatepassword";
    const headers = {
      "Content-type": "application/json",
    };
    const method = "POST";
    const body = JSON.stringify({ email, password: password1 });
    fetch(url, {
      headers,
      method,
      body,
    })
      .then((response) => response.json())
      .then((data) => redirect(data))
      .catch((error) => console.error(error));
  }
});

function redirect(data) {
  if (data.status == "success") {
    location.href = "/login";
  } else {
    errorMessage.innerHTML = data.message;
  }
}

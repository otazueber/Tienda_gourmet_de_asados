const form = document.getElementById("signupForm");
const responseMessage = document.getElementById("responseMessage");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  Submit();
});

function Submit() {
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;
  if (password === password2) {
    const url = "/api/users";
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => (obj[key] = value));
    const options = {
      method: "POST",
      body: JSON.stringify(obj),
      headers: { "Content-Type": "application/json" },
    };

    fetch(url, options)
      .then((response) => response.json())
      .then((data) => redirect(data))
      .catch((error) => console.error(error));
  } else {
    responseMessage.innerHTML = "Las contraseñas no coinciden";
  }
}

function redirect(data) {
  if (data.status == "success") {
    location.href = "/";
  } else {
    responseMessage.innerHTML = data.message;
  }
}

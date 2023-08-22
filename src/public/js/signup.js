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
  if (data.status === "success") {
    const icon = "success";
    const message = "Te enviamos un correo electrónico para que confirmes tu cuenta, Muchas gracias!!!";
    showMessage(message, icon);
    sleep(3500).then(function () {
      location.href = "/";
    });
  } else {
    responseMessage.innerHTML = data.message;
  }
}

function showMessage(message, icon) {
  const Toast = Swal.mixin({
    toast: true,
    position: "center",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  Toast.fire({
    icon: icon,
    title: message,
  });
}

function sleep(time) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, time);
  });
}

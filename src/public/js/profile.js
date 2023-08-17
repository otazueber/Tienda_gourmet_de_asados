const form = document.getElementById("btnCarrarSesion");

form.addEventListener("click", (e) => {
  cerrarSesion();
});

function cerrarSesion() {
  fetch("/auth/logout", { method: "GET" })
    .then((location.href = "/login"))
    .catch((error) => console.error(error));
}

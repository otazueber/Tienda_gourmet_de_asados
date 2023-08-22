document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-button");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const userMail = button.getAttribute("data-user-id");
      deleteUser(userMail);
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const updateButtons = document.querySelectorAll(".update-button");
  updateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const userContainer = button.closest(".user-container");
      const userMail = userContainer.getAttribute("data-user-id");
      const combo = userContainer.querySelector(".role-combo");
      const selectedRole = combo.value;
      // Aquí puedes realizar la lógica para actualizar el rol del usuario con userId al selectedRole.
      updateUserRol(userMail, selectedRole);
    });
  });
});
async function updateUserRol(userMail, selectedRole) {
  setLoading(true);
  const url = `/api/users/${userMail}/role/${selectedRole}`;
  fetch(url, { method: "PUT" })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const message = "Rol de usuario actualizado";
        const icon = "success";
        showMessage(message, icon);
      } else {
        const icon = "error";
        const message = data.message;
        showMessage(message, icon);
      }
      setLoading(false);
    })
    .catch((error) => {
      setLoading(false);
      console.error(error);
    });
}
async function deleteUser(userMail) {
  const userConfirmed = await ConfirmDelete();
  if (userConfirmed) {
    setLoading(true);
    const url = `/api/users/${userMail}`;
    fetch(url, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          location.reload();
        } else {
          const icon = "error";
          const message = data.message;
          showMessage(message, icon);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
  }
}

async function ConfirmDelete() {
  return new Promise((resolve) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "No se podrá revertir esta cambio!!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar!",
    }).then((result) => {
      if (result.isConfirmed) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
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

function setLoading(isLoading) {
  const spiner = document.getElementById("spiner");
  if (isLoading) {
    spiner.innerHTML = '<div class="loader"></div>';
  } else {
    spiner.innerHTML = "";
  }
}

function sleep(time) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, time);
  });
}

let buttons = document.getElementsByClassName("del-from-cart");



if (buttons != null) {
    for (let button of buttons) {
        button.addEventListener("click", (e) => {
            eliminarDelCarrito(e.target.id);
        })
    }
}

function eliminarDelCarrito(pid) {
    const cart = JSON.parse(localStorage.getItem("cart"));
    const url = `/api/carts/${cart.idCart}/products/${pid}`;
    const opciones = {
        method: "DELETE",
    };
    fetch(url, { method: "DELETE" })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success'){                
                const message = 'Producto eliminado';
                const icon = 'success';
                mostrarMensaje(message, icon);
                location.reload();
            } else {
                const message = 'No se pudo eliminar el producto del carrito';
                const icon = 'error';
                mostrarMensaje(message, icon)
            }
        })
        .catch(error => console.error(error))

}

function mostrarMensaje(message, icon) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    })
    Toast.fire({
        icon: icon,
        title: message
    })
}
let cart = '';

function grabarCarritoEnLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getCart() {
    fetch('/api/carts', {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            cart = data.idCart;
            grabarCarritoEnLocalStorage();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function leerCarrito() {
    let jsonCarrito = localStorage.getItem("cart");
    if (jsonCarrito != null) {
        cart = JSON.parse(jsonCarrito);
    } else {
        getCart();
    }
}

leerCarrito();

let botones = document.getElementsByClassName("add-to-cart");

if (botones != null) {
    for (let boton of botones) {
        boton.addEventListener("click", (e) => {
            agregarAlCarrito(e.target.id);
        })
    }
}

function agregarAlCarrito(pid) {
    const url = `/api/carts/${cart}/product/${pid}`;
    const datos = { quantity: 1 };
    const opciones = {
        method: "PUT",
        body: JSON.stringify(datos),
        headers: { "Content-Type": "application/json" },
    };

    fetch(url, opciones)
        .then(mostrarMensaje())
        .catch((error) => console.error('el error es este: ' + error));

}

function mostrarMensaje() {
    Swal.fire({
        text: `Producto agregado al carrito !!`,
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        icon: 'success',
    });
};
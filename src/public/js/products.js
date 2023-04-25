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
            SetLinkToCart();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function leerCarrito() {
    let jsonCarrito = localStorage.getItem("cart");
    if (jsonCarrito != null) {
        cart = JSON.parse(jsonCarrito);
        SetLinkToCart();
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
        .catch((error) => console.error(error));
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

function SetLinkToCart(){
    let linkToCart = document.getElementById("linkToCart");
    linkToCart.href = "/api/views/carts/" + cart;
}


const form = document.getElementById('btnCarrarSesion');

form.addEventListener('click', e => {
    cerrarSesion();
});

function cerrarSesion(){
    fetch('/auth/logout', {method: 'GET'})
    .then(location.href = '/login')
    .catch(error => console.log(error))
}

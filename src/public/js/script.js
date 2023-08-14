const cart = document.getElementById('cart');
cart.addEventListener('click', async e => {
    const idCart = await obtenerCarrito();
    console.log('voy a mostrar el carrito: ' + idCart)
    location.href = '/api/views/carts/' + idCart;
});

function leerCarrito() {
    const cart = localStorage.getItem("cart");
    if (cart != null) {
        return cart;
    } else {
        return '-1';
    }
}

function grabarCarritoEnLocalStorage(cartid) {
    localStorage.setItem("cart", JSON.stringify(cartid));
}

async function obtenerCarrito() {
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (cart != null) {
        return cart.idCart;
    } else {
        try {
            const response = await fetch("/api/carts", {
                method: "POST",
            });
            const data = await response.json();
            grabarCarritoEnLocalStorage(data);
            return data.idCart;
        } catch (error) {
            console.error("Error al obtener el carrito:", error);
        }
    }
};

async function actualizarCantidadEnIconoCarrito() {
    const idCart = await obtenerCarrito();
    const cartCount = document.getElementById('cart-count');  
    let cant = 0;  
    const url = `/api/carts/${idCart}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            data.forEach(p => {
                cant += p.quantity;
            });
            cartCount.innerHTML = cant;
           
        })
        .catch(error => console.error(error))
}

actualizarCantidadEnIconoCarrito();
const cantidad = document.getElementById('cantidad');
const stockDisponible = parseFloat(document.getElementById('stock').value);
const idProducto = document.getElementById('idProducto').value;

const btnSumar = document.getElementById('btnSumar');
const btnRestar = document.getElementById('btnRestar');
const btnAgregar = document.getElementById('btnAgregar');

actualizarCantidadEnIconoCarrito();

btnSumar.addEventListener('click', () => {
    const cantidadActual = parseFloat(cantidad.innerText);

    if ((cantidadActual + 1) <= stockDisponible) {
        cantidad.innerText = cantidadActual + 1;
    }
});

btnRestar.addEventListener('click', () => {
    const cantidadActual = parseFloat(cantidad.innerText);

    if (cantidadActual > 0) {
        cantidad.innerText = cantidadActual - 1;
    }
});

btnAgregar.addEventListener('click', async () => {
    try {
        const cantidadActual = parseFloat(document.getElementById('cantidad').innerText);
        if (cantidadActual > 0) {
            const idCart = await obtenerCarrito();
            const body = JSON.stringify({ quantity: cantidadActual });
            const url = `/api/carts/${idCart}/product/${idProducto}`;
            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            const method = 'PUT'
            fetch(url, {
                headers,
                method,
                body,
            })
                .then(response => response.json())
                .then(data => {
                    prosessResponse(data);
                    actualizarCantidadEnIconoCarrito();
                })
                .catch(error => console.error(error))
        }
    } catch (error) {
        console.error("Error al obtener el carrito:" + error);
    }
});

function prosessResponse(data) {
    if (data.message === 'Not authenticated') {
        const message = 'Primero inicia sesión';
        const icon = 'error';
        mostrarMensajeProductoAgregado(message, icon)
    } else if (data.status === 'error') {
        const message = data.message;
        const icon = 'error';
        mostrarMensajeProductoAgregado(message, icon)
    } else {
        const message = 'Producto agregado exitosamente al carrito';
        const icon = 'success';
        mostrarMensajeProductoAgregado(message, icon)
    }
}

function mostrarMensajeProductoAgregado(message, icon) {
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

function grabarCarritoEnLocalStorage(data) {
    localStorage.setItem("cart", JSON.stringify(data));
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
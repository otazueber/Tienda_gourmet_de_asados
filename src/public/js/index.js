const socket = io();

socket.on('productos', products => {
    const arrayProductos = JSON.parse(products);    
    let html = '';

    arrayProductos.forEach((producto) => {
        const { thumbnails, description, measurement, price } = producto;
        html = html + `<div class="col-12 col-lg-4 pt-5">
                            <img src=${thumbnails} alt="Fhoto">
                            <p>${description} <br> Precio por ${measurement}: ${price}</p>
                        </div> `;
        
    }
    );
    html = html + ` </div>`;

    let contenedor = document.getElementById("productos");
    contenedor.innerHTML = html;
});


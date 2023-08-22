const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");
const cartConteiner = document.getElementById("cartContainer");
let buttons = document.getElementsByClassName("del-from-cart");

let stripe = null;

const paimentForm = `
<div class="container-fluid font bground">
	<div class="row">
    <div class="d-flex justify-content-center" id="spiner"></div>
		<div class="col-12 col-lg-12 d-flex justify-content-center" id="label">
			<h1 class="py-5">Pago</h1>            
		</div>
	</div>
	<div class="row">
		<div class="col-12 col-lg-4 d-flex justify-content-center"></div>
		<div class="col-12 col-lg-4 d-flex justify-content-center">
			<form id="payment-form">
				<div id="link-authentication-element">
					<!--Stripe.js injects the Link Authentication Element-->
				</div>
				<div id="payment-element">
					<!--Stripe.js injects the Payment Element-->
				</div>
				<br>
				<button id="submit" class="boton-pagar">
					<div class="spinner hidden" id="spinner"></div>
					<span id="button-text">Pagar</span>
				</button>
				<div id="payment-message" class="hidden"></div>
			</form>
		</div>
		<div class="col-12 col-lg-4 d-flex justify-content-center"></div>
	</div>
</div><br>`;

if (buttons != null) {
  for (let button of buttons) {
    button.addEventListener("click", (e) => {
      eliminarDelCarrito(e.target.id);
    });
  }
}

function eliminarDelCarrito(pid) {
  setLoading(true);
  const cart = JSON.parse(localStorage.getItem("cart"));
  const url = `/api/carts/${cart.idCart}/products/${pid}`;
  fetch(url, { method: "DELETE" })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        setLoading(false);
        const message = "Producto eliminado";
        const icon = "success";
        showMessage(message, icon);
        sleep(2500).then(function () {
          location.reload();
        });
      } else {
        const message = "No se pudo eliminar el producto del carrito";
        const icon = "error";
        mostrarMensaje(message, icon);
      }
    })
    .catch((error) => {
      setLoading(false);
      console.error(error);
    });
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("redirect_status") === "succeeded") {
  showMessage("Muchas gracias por su compra!!!", "success");
  deleteCart();
  localStorage.removeItem("cart");
  sleep(3000).then(function () {
    location.href = "/";
  });
}

btnFinalizarCompra.addEventListener("click", (e) => {
  finalizarCompra();
});

async function finalizarCompra() {
  const cart = JSON.parse(localStorage.getItem("cart"));
  if (cart != null) {
    const url = "/payments/payment-intents?idCart=" + cart.idCart;
    let clientSecret = "";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        clientSecret = data.payload.client_secret;
        stripe = Stripe(data.stripePK);
        cartConteiner.innerHTML = paimentForm;
        const importe = document.getElementById("importe").value;
        const button_text = document.getElementById("button-text");
        button_text.innerText = "Pagar $" + importe;
        setLoading(false);
        document.querySelector("#payment-form").addEventListener("submit", handleSubmit);
        const appearance = {
          theme: "night",
        };
        elements = stripe.elements({ appearance, clientSecret });

        const linkAuthenticationElement = elements.create("linkAuthentication");
        linkAuthenticationElement.mount("#link-authentication-element");

        linkAuthenticationElement.on("change", (event) => {
          emailAddress = event.value.email;
        });

        const paymentElementOptions = {
          layout: "tabs",
        };

        const paymentElement = elements.create("payment", paymentElementOptions);
        paymentElement.mount("#payment-element");
        document.querySelector("#payment-form").addEventListener("submit", handleSubmit);
      })
      .catch((error) => console.error(error));
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  const baseURL = window.location.protocol + "//" + window.location.host;
  const cart = JSON.parse(localStorage.getItem("cart"));
  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: baseURL + "/api/views/carts/" + cart.idCart,
    },
  });
  if (error.type === "card_error" || error.type === "validation_error") {
    showMessage(error.message, "error");
  } else {
    showMessage(error.message, "error");
  }
  setLoading(false);
}

async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");

  if (!clientSecret) {
    return;
  }
  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!", "success");
      break;
    case "processing":
      showMessage("Your payment is processing.", "info");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.", "warning");
      break;
    default:
      showMessage("Something went wrong.", "error");
      break;
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

function setLoading(isLoading) {
  const spiner = document.getElementById("spiner");
  const label = document.getElementById("label");
  if (isLoading) {
    spiner.innerHTML = '<div class="loader"></div>';
    if (label) {
      label.innerHTML = '<h1 class="py-2">Pago</h1>';
      document.querySelector("#submit").disabled = true;
      document.querySelector("#spinner").classList.remove("hidden");
      document.querySelector("#button-text").classList.add("hidden");
    }
  } else {
    spiner.innerHTML = "";
    if (label) {
      label.innerHTML = '<h1 class="py-5">Pago</h1>';
      document.querySelector("#submit").disabled = false;
      document.querySelector("#spinner").classList.add("hidden");
      document.querySelector("#button-text").classList.remove("hidden");
    }
  }
}

function sleep(time) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve();
    }, time);
  });
}

function deleteCart() {
  const cart = JSON.parse(localStorage.getItem("cart"));
  const url = "/api/carts/" + cart.idCart;
  fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
}

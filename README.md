# Proyecto de Comercio Electrónico (Ecommerce) con Express y MongoDB

Este proyecto es un sistema de comercio electrónico (ecommerce) construido utilizando Node.js con Express como framework para el servidor, Handlebars para las vistas en el cliente, y MongoDB como base de datos. Proporciona funcionalidades esenciales para una plataforma de compras en línea de carnes principalmente.

## Características

- Autenticación de usuarios con JWT (JSON Web Tokens).
- Uso de MongoDB como base de datos principal.
- Encriptación de contraseñas con bcrypt.
- Envío de correos electrónicos con Nodemailer.
- Integración de pagos con Stripe.
- Documentación de API con Swagger.
- Gestión de imágenes con Multer.
- Logging con Winston.

## Requisitos Previos

- Node.js y npm deben estar instalados en tu sistema.

## Instalación

1. Clona este repositorio en tu máquina local:

   ```bash
   git clone https://github.com/otazueber/Tienda_gourmet_de_asados.git
   ```

2. Instala las dependencias utilizando npm:
   ```bash
   npm install
   ```
3. Instala nodemon:
   ```bash
   npm install -g nodemon
   ```

## Uso

1. Inicia el servidor:
   ```bash
   nodemon index.js
   ```
2. Abre tu navegador y accede a http://localhost:8080 para ver la aplicación en funcionamiento.

## Documentación de la API

La documentación de la API está disponible utilizando Swagger. Puedes acceder a ella en http://localhost:8080/api-docs/

## Autor

Otazu Eber - https://github.com/otazueber

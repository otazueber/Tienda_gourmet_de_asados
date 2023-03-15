
const express = require('express');
const cartsRouter = require('./routes/carts.router');
const productsRouter = require('./routes/products.router');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = 8080;

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => {
    res.send('<h1>Bienvenido a Not Vegan, tienda gourmet de asados</h1>')
});

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
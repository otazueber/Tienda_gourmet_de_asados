
const express = require('express');
const cartsRouter = require('./routes/carts.router');
const productsRouter = require('./routes/products.router');
const handlebars = require('express-handlebars');
const { Server } = require('socket.io')

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => {
    res.send('<h1>Bienvenido a Not Vegan, tienda gourmet de asados</h1>')
});

const port = 8080;
const httpServer = app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});

const io = new Server(httpServer);
app.set('io', io);

io.on('connection', socket => {
    console.log(`Cliente conectado, id de socket ${socket.id}`);
})

const {Router} = require('express');

const router = Router();

router.get('/', (req, res) => {
    res.send('<h1>Bienvenido a Not Vegan!!!, tienda gourmet de asados</h1>')
});  

module .exports = router
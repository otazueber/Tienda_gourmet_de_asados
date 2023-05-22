const { Router } = require('express');
const { authToken } = require('../utils/jwt.utils');

const router = Router();

router.get('/current', authToken, (req, res) => { 
    res.status(200).json(req.user);
});

module.exports = router;
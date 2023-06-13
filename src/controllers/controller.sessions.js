const { Router } = require('express');
const { authToken } = require('../utils/jwt.utils');
const UserDTO = require('../dto/user.dto');

const router = Router();

router.get('/current', authToken, (req, res) => { 
    const userDTO = new UserDTO(req.user);
    res.status(200).json(userDTO);
});

module.exports = router;
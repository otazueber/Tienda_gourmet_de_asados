const { Router } = require('express');
const Users = require('../dao/models/users.model');

const router = Router();

router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        const newUserInfo = {
            first_name,
            last_name,
            email,
            age,
            password,
        }
        const user = await Users.create(newUserInfo);

        res.status(201).json({ status: 'success', message: user });
    } catch (error) {
        console.error(error)
        if (error.code == '11000'){
            res.status(400).json({ status: 'error', error: 'Bad request' });
        }
        else {
            res.status(500).json({ status: 'error', error: 'Internal server error' });
        }
    }
});

module.exports = router;

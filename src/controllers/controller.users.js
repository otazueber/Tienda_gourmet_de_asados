const { Router } = require('express');
const passport = require('passport')

const router = Router();

router.post('/', passport.authenticate('register', { failureRedirect: '/api/users/failregister' }), async (req, res) => {
    try {
        res.status(201).json({ status: 'success', message: 'Usuario registrado' })
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal server error' })
    }
}
);

router.get('/failregister', (req, res) => {
    res.status(400).json({ status: 'error', message: 'No se pudo dar de alta el usuario' })
}
);

module.exports = router;

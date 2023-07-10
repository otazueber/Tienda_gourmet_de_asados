const { Router } = require('express');
const passport = require('passport');
const DbUserManager = require('../dao/dbUserManager');

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

router.put('/premium/:uid', async (req, res) => {
    const { uid } = req.params;
    const user = await DbUserManager.getUserById(uid);
    if (!user)
    {
        res.status(404).json({ status: 'error', message: 'Usuario no encontrado' })
    }
    else if (user.role == 'user')
    {
        DbUserManager.actualizarRol(user.email, 'premium');
        res.status(200).json({ status: 'success', message: 'Se actualizó el rol del usuario a premium' });
    } else if (user.role == 'premium')
    {
        DbUserManager.actualizarRol(user.email, 'user');
        res.status(200).json({ status: 'success', message: 'Se actualizó el rol del usuario a user' });
    }
});


module.exports = router;

const { Router } = require('express');
const passport = require('passport');

const router = Router();

router.post('/', passport.authenticate('login', { failureRedirect: '/auth/failLogin' }), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'El usuario y la contraseña no coinciden' });
        }
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role,
        }
        res.json({ status: 'success', message: 'Sesión iniciada' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: 'error', message: 'el mensaje es: ' + error.message });
    }
});

router.get('/github', passport.authenticate('github', { scope: ['user: email'] }), async (req, res) => { });

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }),
    async (req, res) => {
        req.session.user = req.user
        res.redirect('/api/views/products')
    }
);

router.get('/failLogin', (req, res) => {
    res.status(400).json({ status: 'error', message: 'El usuario y la contraseña no coinciden' })
}
);

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
        res.redirect('/login');
    })
});

module.exports = router;
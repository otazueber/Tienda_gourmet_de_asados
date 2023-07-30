const { Router } = require('express');
const passport = require('passport');
const { generateToken, generatePasswordResetToken, getEmailFromToken } = require('../utils/jwt.utils');
const MailAdapter = require('../adapters/mail.adapter');
const DbUserManager = require('../dao/dbUserManager');
const { isValidPassword } = require('../utils/cryptPassword');

const router = Router();

router.post('/', passport.authenticate('login', { failureRedirect: '/auth/failLogin' }), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'El usuario y la contraseña no coinciden' });
        }
        // req.session.user = {
        //     first_name: req.user.first_name,
        //     last_name: req.user.last_name,
        //     email: req.user.email,
        //     role: req.user.role,
        // }
        // res.json({ status: 'success', message: 'Sesión iniciada' });
        const access_token = generateToken({ email: req.user.email, role: req.user.role });
        res.cookie('authToken', access_token, { maxAge: 60000, httpOnly: true })
            .json({
                status: 'success',
                message: 'Sesión iniciada',
            });

    } catch (error) {
        req.logger.error(error.message);
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
        DbUserManager.setLastConnection(req.user.email);
        res.redirect('/login');
    })
});

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password.handlebars')
});

router.post('/mail-password', async (req, res) => {
    const { email } = req.body;
    const user = await DbUserManager.getUser(email);
    if (user) {
        const token = generatePasswordResetToken(email);
        const resetLink = `http://localhost:8080/auth/reset-password/${token}`;
        const mailOptions = {
            from: 'pruebacoder1976@gmail.com',
            to: email,
            subject: 'Restablecimiento de contraseña',
            html: `Haz clic <a href="${resetLink}">aquí</a> para restablecer tu contraseña. El enlace expirará en 1 hora.`
        };
        await MailAdapter.send(mailOptions);
    }
    else {
        req.logger.info('No se manda mail porque no existe usuario con este email');
    }
    res.redirect('/login');

});

router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const email = await getEmailFromToken(token);
    if (email) {
        res.render('reset.pasword.handlebars', { email });
    }
    else {
        res.status(400).json({ status: 'error', message: 'token inválido o inexistente' })
    }
});

router.post('/updatepassword', async (req, res) => {
    const { email, password } = req.body;
    const user = await DbUserManager.getUser(email);
    if (isValidPassword(password, user)) {
        res.status(400).json({ status: 'error', message: 'no puedes utilizar la misma contraseña, debe ser una nueva' });
    } else {
        await DbUserManager.actualizarPassword(email, password);
        res.status(200).json({ status: 'success', message: 'Se actualizó la password correctamente' });
    }
});

module.exports = router;
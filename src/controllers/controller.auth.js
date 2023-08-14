const { Router } = require('express');
const passport = require('passport');
const { generateToken, generatePasswordResetToken, getEmailFromToken } = require('../utils/jwt.utils');
const MailAdapter = require('../adapters/mail.adapter');
const DbUserManager = require('../dao/dbUserManager');
const { isValidPassword } = require('../utils/cryptPassword');
const HTTTP_STATUS_CODES = require('../commons/constants/http-status-codes.constants');

const router = Router();

router.post('/', async (req, res) => {
    try {        
        const { email, password } = req.body;
        if ((email == 'adminCoder@coder.com') & (password == 'adminCod3r123')) {
            const user = {
                id: "CODER",
                first_name: 'admin',
                last_name: 'Coder',
                email: 'adminCoder@coder.com',
                role: 'admin',
                password
            };
            req.user = user;
        } else {
            const user = await DbUserManager.getUser(email);
            if (!user) {
                req.logger.error('El usuario no existe');
                return res.status(HTTTP_STATUS_CODES.UN_AUTHORIZED).json({ status: 'error', message: 'El usuario y la contraseña no coinciden.' });
            }
            if (!isValidPassword(password, user)) {
                req.logger.error('El password no es correcto');
                return res.status(HTTTP_STATUS_CODES.UN_AUTHORIZED).json({ status: 'error', message: 'El usuario y la contraseña no coinciden.' });
            }
            req.user = user;
        }
        DbUserManager.setLastConnection(req.user.email);
        const access_token = generateToken({ email: req.user.email, role: req.user.role });
        res.cookie('authToken', access_token, { maxAge: 3600000, httpOnly: true });
        res.status(HTTTP_STATUS_CODES.OK).json({status: 'success', message: 'Sesión iniciada',});
    } catch (error) {
        req.logger.error(error.message);
        res.status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ status: 'error', message: 'Internal server error' });
    }
});

router.get('/github', passport.authenticate('github', { scope: ['user: email'] }), async (req, res) => { });

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }),
    async (req, res) => {
        res.redirect('/api/views/products')
    }
);

router.get('/failLogin', (req, res) => {
    res.status(HTTTP_STATUS_CODES.BAD_REQUEST).json({ status: 'error', message: 'El usuario y la contraseña no coinciden' });
}
);

router.get('/logout', (req, res) => {
    DbUserManager.setLastConnection(req.user.email);
    res.clearCookie('authToken');
    res.redirect('/');
});

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password.handlebars', { mostrarIconos: false, tengoUsuario: false });
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
        res.status(HTTTP_STATUS_CODES.BAD_REQUEST).json({ status: 'error', message: 'token inválido o inexistente' })
    }
});

router.post('/updatepassword', async (req, res) => {
    const { email, password } = req.body;
    const user = await DbUserManager.getUser(email);
    if (isValidPassword(password, user)) {
        res.status(HTTTP_STATUS_CODES.BAD_REQUEST).json({ status: 'error', message: 'no puedes utilizar la misma contraseña, debe ser una nueva' });
    } else {
        await DbUserManager.actualizarPassword(email, password);
        res.status(HTTTP_STATUS_CODES.OK).json({ status: 'success', message: 'Se actualizó la password correctamente' });
    }
});

module.exports = router;
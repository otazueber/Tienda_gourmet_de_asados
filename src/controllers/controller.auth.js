const { Router } = require('express');
const Users = require('../dao/models/users.model');
const { isValidPassword } = require('../utils/cryptPassword');

const router = Router();

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        if ((email == 'adminCoder@coder.com') & (password == 'adminCod3r123')){
            req.session.user = {
                first_name: 'admin',
                last_name: 'Coder',
                email: 'adminCoder@coder.com',
                role: 'admin',
            }
        }
        else{
            const errorMessage = 'El usuario y la contraseña no coinciden';
            const user = await Users.findOne({ email });
            if (!user)
            {
                return res.status(401).json({status: 'error', message: errorMessage});
            }
            if (!isValidPassword(password, user))
            {
                return res.status(401).json({status: 'error', message: errorMessage});
            }
    
            req.session.user = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
            }
        }        

        res.json({ status: 'success', message: 'Sesión iniciada'});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: 'error', message: error.message});
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) 
        {
            return res.status(500).json({ status: 'error',  message: error.message });
        }
        res.redirect('/login');
    })
});

module.exports = router;
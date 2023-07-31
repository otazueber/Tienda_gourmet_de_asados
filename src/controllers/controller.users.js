const { Router } = require('express');
const passport = require('passport');
const DbUserManager = require('../dao/dbUserManager');
const uploader = require('../utils/multer.utils');

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
    if (!user) {
        res.status(404).json({ status: 'error', message: 'Usuario no encontrado' })
    }
    else if (user.role == 'premium') {
        DbUserManager.actualizarRol(user.email, 'user');
        res.status(200).json({ status: 'success', message: 'Se actualizó el rol del usuario a user' });
    } else if (user.role == 'user') {
        if ((user.documentStatus.identification) & (user.documentStatus.proofOfAddress) & (user.documentStatus.bankStatement)) {
            DbUserManager.actualizarRol(user.email, 'premium');
            res.status(200).json({ status: 'success', message: 'Se actualizó el rol del usuario a premium' });
        } else {
            res.status(400).json({ status: 'error', message: 'No ha terminado de procesar su documentación' });
        }
    }
});

router.post('/:uid/documents', uploader.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'identification', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'bankStatement', maxCount: 1 },
]), async (req, res) => {
    const { uid } = req.params;
    // Aquí puedes acceder a los archivos subidos a través de req.files
    // Resto de la lógica
    let profileImage = null;
    let identification = null;
    let proofOfAddress = null;
    let bankStatement = null;
    if (req.files['profileImage']) {
        profileImage = req.files['profileImage'][0].destination + req.files['profileImage'][0].filename;
    }
    if (req.files['identification']) {
        identification = req.files['identification'][0].destination + req.files['identification'][0].filename;
    }
    if (req.files['proofOfAddress']) {
        proofOfAddress = req.files['proofOfAddress'][0].destination + req.files['proofOfAddress'][0].filename;
    }
    if (req.files['bankStatement']) {
        bankStatement = req.files['bankStatement'][0].destination + req.files['bankStatement'][0].filename;
    }
    const documentInfo = {
        uid,
        profileImage,
        identification,
        proofOfAddress,
        bankStatement,
    }
    await DbUserManager.actualizarDocumentos(documentInfo);
    res.status(200).json({ status: 'success', message: 'documentos guardados' });
});


module.exports = router;

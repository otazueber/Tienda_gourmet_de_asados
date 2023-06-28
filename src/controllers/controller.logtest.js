const { Router } = require('express');

const router = Router();

router.get('/', async (req, res) => {
     req.logger.debug('Mensaje de debug');
     req.logger.http('Mensaje de http');
     req.logger.info('Mensaje de info');
     req.logger.warning('Mensaje de warning');
     req.logger.error('Mensaje de error');   
     req.logger.fatal('Mensaje de fatal');
    res.status(200).json({ message: 'Logs enviados. Verifica la consola o el archivo de errores.' });
}
);

module.exports = router;

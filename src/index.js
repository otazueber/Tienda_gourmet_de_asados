const app = require('./app');
const { port } = require('./config/app.config');
const getLogger = require('./logger/factory');

app.listen(port, async () => {
    const logger = await getLogger();
    logger.info(`Server runing at port ${port}`);
});
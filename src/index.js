const app = require('./app');
const { port } = require('./config/app.config');

app.listen(port, () => {
    console.log(`Server runing al port ${port}`);
});
const generateUserErrorInfo = user => {
    return `Una o mas propiedades están incompletas o no son válidas.
    Lista de propiedades requeridas:
    first_name: debe ser string, se ha recibido: ${user.firs_name}
    last_name: debe ser string, se ha recibiro: ${user.last_name}
    email: debe ser srtring, se ha recibido: ${user.email}
    `;
}

module.exports = generateUserErrorInfo;
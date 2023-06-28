const EnumErrors = require("../handler/errors/enumErrors");

function errorHandler(error, req, res, next) {
    console.log(error.cause);
    switch (error.code) {
        case EnumErrors.INVALID_TYPES_ERROR:
            res.json({satus: 'Error', error: error.name});
            break;    
        case EnumErrors.INVALID_PARAM:
                res.json({satus: 'Error', error: error.name});
                break; 
        default:
            res.json({satus: 'Error', error: 'Unhandled error'});
            break;
    }
}

module.exports = errorHandler;
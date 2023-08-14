const EnumErrors = require("../handler/errors/enumErrors");

function errorHandler(error, req, res, next) {
    switch (error.code) {
        case EnumErrors.INVALID_TYPES_ERROR:
            res.json({status: 'error', error: error.name});
            break;    
        case EnumErrors.INVALID_PARAM:
                res.json({status: 'error', error: error.name});
                break; 
        default:
            res.json({status: 'error', error: 'Unhandled error'});
            break;
    }
}

module.exports = errorHandler;
function adminAccess(req, res, next) {
    const userRole = req.user.role;
    if ((userRole != 'admin') & (userRole != 'premium')) {
        return res.status(403).json({ status: 'error', message: 'Acceso no autorizado' })
    }
    next();
  }

  function userAccess(req, res, next) {
    const userRole = req.user.role;
    if ((userRole != 'user') & (userRole != 'premium') ){
        return res.status(403).json({ status: 'error', message: 'Acceso no autorizado' })
    }
    next();
  }

  module.exports = {
    adminAccess,
    userAccess
  }
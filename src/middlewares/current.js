const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");

function adminAccess(req, res, next) {
  const userRole = req.user.role;
  if ((userRole != "admin") & (userRole != "premium")) {
    return res
      .status(HTTTP_STATUS_CODES.FORBIDEN)
      .json({ status: "error", message: "Acceso no autorizado" });
  }
  next();
}

function userAccess(req, res, next) {
  const userRole = req.user.role;
  if ((userRole != "user") & (userRole != "premium")) {
    return res
      .status(HTTTP_STATUS_CODES.FORBIDEN)
      .json({ status: "error", message: "Acceso no autorizado" });
  }
  next();
}

module.exports = {
  adminAccess,
  userAccess,
};

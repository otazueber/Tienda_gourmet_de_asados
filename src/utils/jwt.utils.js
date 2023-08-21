const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/app.config");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");
const UserService = require("../dao/services/userService");

const userService = new UserService();

const userToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, jwtSecret, async (error, credentials) => {
      if (!error) {
        let user;
        if (credentials.email === "adminCoder@coder.com") {
          req.user = {
            first_name: "Admin",
            last_name: "Coder",
            email: credentials.email,
            role: "admin",
          };
        } else {
          user = await userService.getUser(credentials.email);
          if (user) {
            const newUserInfo = {
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              role: user.role,
            };
            req.user = newUserInfo;
          }
        }
        next();
      }
    });
  } else {
    next();
  }
};

const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(HTTTP_STATUS_CODES.UN_AUTHORIZED).json({ status: "error", message: "Not authenticated" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, jwtSecret, async (error, credentials) => {
    if (error) {
      return res.status(HTTTP_STATUS_CODES.FORBIDEN).json({ status: "error", message: "Forbiden" });
    }
    let user;
    if (credentials.email == "adminCoder@coder.com") {
      req.user = {
        first_name: "Admin",
        last_name: "Coder",
        email: credentials.email,
        role: "admin",
      };
    } else {
      user = await userService.getUser(credentials.email);
      req.user = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      };
    }
    next();
  });
};

module.exports = {
  authToken,
  userToken,
};

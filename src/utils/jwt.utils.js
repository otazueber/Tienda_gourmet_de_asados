const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/app.config');
const DbUserManager = require('../dao/dbUserManager');
const HTTTP_STATUS_CODES = require('../commons/constants/http-status-codes.constants');

const generateToken = user => {
  const token = jwt.sign(user, jwtSecret, { expiresIn: '12h' });
  return token;
}

const userToken = async (req, res, next) => {
  const authHeader = req.headers.Authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, jwtSecret, async (error, credentials) => {
      if (!error) {
        let user;
        if (credentials.email === "adminCoder@coder.com") {
          req.user = {
            first_name: "Admin",
            last_name: "Coder",
            email: credentials.email,
            role: "admin"
          };
        } else {
          user = await DbUserManager.getUser(credentials.email);
          if (user){
            const newUserInfo = {
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              role: user.role
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
}


const authToken = (req, res, next) => {
  const authHeader = req.headers.Authorization;
  if (!authHeader){
    return res.status(HTTTP_STATUS_CODES.UN_AUTHORIZED).json({ status: 'error', message: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, jwtSecret, async (error, credentials) => {
    if (error){
      return res.status(HTTTP_STATUS_CODES.FORBIDEN).json({ status: 'error', message: 'Forbiden' });
    }
    let user;
    if (credentials.email == "adminCoder@coder.com") {
      req.user = {
        first_name: "Admin",
        last_name: "Coder",
        email: credentials.email,
        role: "admin"
      }
    }
    else {
      user = await DbUserManager.getUser(credentials.email);
      req.user = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      };
    }
    next();
  })
}

const generatePasswordResetToken = (email) => {
  const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1h' });
  return token;
}

const getEmailFromToken = token => {
  let email = '';
  if (token) {
    jwt.verify(token, jwtSecret, async (error, decoded) => {
      if (!error) {
        const decodedToken = jwt.decode(token);
        if (decodedToken.exp >= Date.now() / 1000) {
          email = decoded.email;
        }
      }
    })
  }
  return email;
}


module.exports = {
  generateToken,
  authToken,
  generatePasswordResetToken,
  getEmailFromToken,
  userToken,
}

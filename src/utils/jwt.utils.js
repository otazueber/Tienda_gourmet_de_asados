const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/app.config');
const Users = require('../dao/models/users.model');

const generateToken = user => {
  const token = jwt.sign(user, jwtSecret, { expiresIn: '12h' });
  return token;
}

const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ status: 'error', message: 'Not authenticated' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, jwtSecret, async (error, credentials) => {
    if (error)
      return res.status(403).json({ status: 'error', message: 'Forbiden' });
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
      user = await Users.findOne({ email: credentials.email });

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
}

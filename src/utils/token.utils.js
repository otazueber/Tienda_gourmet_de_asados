const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/app.config");

const generateToken = (user) => {
  const token = jwt.sign(user, jwtSecret, { expiresIn: "12h" });
  return token;
};

const generateEmailToken = (email) => {
  const token = jwt.sign({ email }, jwtSecret, { expiresIn: "1h" });
  return token;
};

const getEmailFromToken = (token) => {
  let email = "";
  if (token) {
    jwt.verify(token, jwtSecret, async (error, decoded) => {
      if (!error) {
        const decodedToken = jwt.decode(token);
        if (decodedToken.exp >= Date.now() / 1000) {
          email = decoded.email;
        }
      }
    });
  }
  return email;
};

module.exports = {
  generateToken,
  generateEmailToken,
  getEmailFromToken,
};

const addAuthorizationHeader = (req, res, next) => {
  const token = req.cookies.authToken;
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
  next();
};

module.exports = addAuthorizationHeader;

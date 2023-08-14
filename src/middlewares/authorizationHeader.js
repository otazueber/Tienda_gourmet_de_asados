const addAuthorizationHeader = (req, res, next) => {
    const token = req.cookies.authToken;  
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    next();
  };
  
  module.exports = addAuthorizationHeader
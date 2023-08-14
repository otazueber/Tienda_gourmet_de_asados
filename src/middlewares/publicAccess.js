function publicAccess(req, res, next) {
  if (req.user) {
    return res.redirect('/');
  }
  next();
}

module.exports = publicAccess

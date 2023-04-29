const bcrypt = require('bcrypt');

exports.hashPassword = password => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

exports.isValidPassword = (password, user) => {
  return bcrypt.compareSync(password, user.password);
}

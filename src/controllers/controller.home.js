const { Router } = require("express");
const { authToken } = require("../utils/jwt.utils");

const router = Router();

router.get("/", authToken, (req, res) => {
  let tengoUsuario = false;
  if (req.user) tengoUsuario = true;
  res.render("home.handlebars", { tengoUsuario });
});

module.exports = router;

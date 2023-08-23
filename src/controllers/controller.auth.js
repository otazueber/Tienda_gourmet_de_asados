const { Router } = require("express");
const { getEmailFromToken } = require("../utils/token.utils");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");
const UserService = require("../dao/services/userService");
const MailService = require("../services/mail.service");

const router = Router();
const userService = new UserService();
const mailService = new MailService();

router.post("/", async (req, res) => {
  const result = await userService.loginUser(req);
  if (result.access_token) {
    res.cookie("authToken", result.access_token, { maxAge: 3600000, httpOnly: true });
  }
  res.status(result.statusCode).json(result.response);
});

router.get("/logout", (req, res) => {
  userService.setLastConnection(req.user._id);
  res.clearCookie("authToken");
  res.redirect("/");
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot-password.handlebars", {
    mostrarIconos: false,
    tengoUsuario: false,
  });
});

router.post("/mail-password", async (req, res) => {
  const token = await userService.getResetPasswordToken(req);
  const baseUrl = req.protocol + "://" + req.get("host");
  mailService.sendEmailResetPassword(req, token, baseUrl);
  res.redirect("/login");
});

router.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const email = await getEmailFromToken(token);
  if (email) {
    res.render("reset.pasword.handlebars", { email });
  } else {
    res.status(HTTTP_STATUS_CODES.BAD_REQUEST).json({ status: "error", message: "token inválido o inexistente" });
  }
});

router.post("/updatepassword", async (req, res) => {
  const result = await userService.updatePassword(req);
  res.status(result.statusCode).json(result.response);
});

router.get("/confirm-email/:token", async (req, res) => {
  const { token } = req.params;
  const email = await getEmailFromToken(token);
  if (email) {
    userService.activarCuenta(email);
    res.render("login.handlebars", { mostrarIconos: false, mostrarmensaje: true });
  } else {
    res.status(HTTTP_STATUS_CODES.BAD_REQUEST).json({ status: "error", message: "token inválido o inexistente" });
  }
});

module.exports = router;

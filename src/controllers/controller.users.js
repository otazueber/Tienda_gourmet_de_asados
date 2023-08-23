const { Router } = require("express");
const uploader = require("../utils/multer.utils");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");
const UserService = require("../dao/services/userService");
const MailService = require("../services/mail.service");

const router = Router();
const userService = new UserService();
const mailService = new MailService();

router.post("/", async (req, res) => {
  result = await userService.createUser(req.body);
  res.status(result.statusCode).json(result.response);
  const baseUrl = req.protocol + "://" + req.get("host");
  mailService.sendEmailConfirmation(result.response.userCreated, baseUrl);
});

router.put("/premium/:uid", async (req, res) => {
  const { uid } = req.params;
  const result = await userService.changeRole(uid);
  res.status(result.statusCode).json(result.response);
});

router.post(
  "/:uid/documents",
  uploader.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "identification", maxCount: 1 },
    { name: "proofOfAddress", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
  ]),
  async (req, res) => {
    const { uid } = req.params;
    const result = await userService.actualizarDocumentos(uid, req.files);
    res.status(result.statusCode).json(result.response);
  }
);

router.get("/", async (req, res) => {
  const users = await userService.getAll();
  res.status(HTTTP_STATUS_CODES.OK).json({ status: "success", message: "Usuarios obtenidos", users });
});

router.delete("/inactiveUsers", async (req, res) => {
  const result = await userService.deleteInactiveUsers();
  res.status(result.statusCode).json(result.response);
  const baseUrl = req.protocol + "://" + req.get("host");
  mailService.sendMailUsersDeleted(result.usersDeleted, baseUrl);
});

router.delete("/:email", async (req, res) => {
  const { email } = req.params;
  const result = await userService.deleteUser(req, email);
  res.status(result.statusCode).json(result.response);
  const baseUrl = req.protocol + "://" + req.get("host");
  mailService.sendMailUserDeletedByAdmin(result.email, baseUrl);
});

router.put("/:email/role/:role", async (req, res) => {
  const result = await userService.actualizarRol(req);
  res.status(result.statusCode).json(result.response);
});

module.exports = router;

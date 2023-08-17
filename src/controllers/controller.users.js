const { Router } = require("express");
const DbUserManager = require("../dao/dbUserManager");
const uploader = require("../utils/multer.utils");
const { hashPassword } = require("../utils/cryptPassword");
const { generateToken } = require("../utils/jwt.utils");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email) {
      CustomError.createError({
        name: "Error creando usuario",
        cause: generateUserErrorInfo({ first_name, last_name, email }),
        message: "Error intentando crear un usuario",
        code: EnumErrors.INVALID_TYPES_ERROR,
      });
    }
    const user = await DbUserManager.getUser(email);
    if (user) {
      req.logger.info("Ya existe el usuario");
      return res
        .status(HTTTP_STATUS_CODES.CONFLICT)
        .json({
          status: "error",
          message: "No se pudo dar de alta este usuario",
        });
    }
    const newUserInfo = {
      first_name,
      last_name,
      email,
      age,
      password: hashPassword(password),
    };
    await DbUserManager.createUser(newUserInfo);
    DbUserManager.setLastConnection(email);
    const access_token = generateToken({ email, role: "user" });
    res.cookie("authToken", access_token, { maxAge: 3600000, httpOnly: true });
    res
      .status(HTTTP_STATUS_CODES.OK)
      .json({ status: "success", message: "Usuario registrado" });
  } catch (error) {
    req.logger.error(error.message);
    res
      .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ status: "error", error: "Internal server error" });
  }
});

router.put("/premium/:uid", async (req, res) => {
  const { uid } = req.params;
  const user = await DbUserManager.getUserById(uid);
  if (!user) {
    res
      .status(HTTTP_STATUS_CODES.NOT_FOUND)
      .json({ status: "error", message: "Usuario no encontrado" });
  } else if (user.role == "premium") {
    DbUserManager.actualizarRol(user.email, "user");
    res
      .status(HTTTP_STATUS_CODES.OK)
      .json({
        status: "success",
        message: "Se actualizó el rol del usuario a user",
      });
  } else if (user.role == "user") {
    if (
      user.documentStatus.identification &
      user.documentStatus.proofOfAddress &
      user.documentStatus.bankStatement
    ) {
      DbUserManager.actualizarRol(user.email, "premium");
      res
        .status(HTTTP_STATUS_CODES.OK)
        .json({
          status: "success",
          message: "Se actualizó el rol del usuario a premium",
        });
    } else {
      res
        .status(HTTTP_STATUS_CODES.BAD_REQUEST)
        .json({
          status: "error",
          message: "No ha terminado de procesar su documentación",
        });
    }
  }
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
    // Aquí puedes acceder a los archivos subidos a través de req.files
    // Resto de la lógica
    let profileImage = null;
    let identification = null;
    let proofOfAddress = null;
    let bankStatement = null;
    if (req.files["profileImage"]) {
      profileImage =
        req.files["profileImage"][0].destination +
        req.files["profileImage"][0].filename;
    }
    if (req.files["identification"]) {
      identification =
        req.files["identification"][0].destination +
        req.files["identification"][0].filename;
    }
    if (req.files["proofOfAddress"]) {
      proofOfAddress =
        req.files["proofOfAddress"][0].destination +
        req.files["proofOfAddress"][0].filename;
    }
    if (req.files["bankStatement"]) {
      bankStatement =
        req.files["bankStatement"][0].destination +
        req.files["bankStatement"][0].filename;
    }
    const documentInfo = {
      uid,
      profileImage,
      identification,
      proofOfAddress,
      bankStatement,
    };
    await DbUserManager.actualizarDocumentos(documentInfo);
    res
      .status(HTTTP_STATUS_CODES.OK)
      .json({ status: "success", message: "documentos guardados" });
  }
);

module.exports = router;

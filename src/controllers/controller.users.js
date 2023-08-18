const { Router } = require("express");
const DbUserManager = require("../dao/dbUserManager");
const uploader = require("../utils/multer.utils");
const { hashPassword } = require("../utils/cryptPassword");
const { generateToken } = require("../utils/jwt.utils");
const HTTTP_STATUS_CODES = require("../commons/constants/http-status-codes.constants");
const UserDTO = require("../dto/user.dto");
const MailAdapter = require("../adapters/mail.adapter");

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
      return res.status(HTTTP_STATUS_CODES.CONFLICT).json({
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
    res.status(HTTTP_STATUS_CODES.OK).json({
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
      res.status(HTTTP_STATUS_CODES.OK).json({
        status: "success",
        message: "Se actualizó el rol del usuario a premium",
      });
    } else {
      res.status(HTTTP_STATUS_CODES.BAD_REQUEST).json({
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

router.get("/", async (req, res) => {
  const users = await DbUserManager.getAll();
  const usersDTO = users.map((user) => new UserDTO(user));
  res.status(HTTTP_STATUS_CODES.OK).json({ status: "success", usersDTO });
});

router.delete("/", async (req, res) => {
  const users = await DbUserManager.getInactiveUsers(2);
  const usersToDel = users.length;
  let msg = "";
  const emails = [];
  if (usersToDel === 0) {
    msg = "No hay usuario inactivos para eliminar.";
  } else if (usersToDel === 1) {
    mst = "Se eliminó satisfactoriamente un usuario inactivo.";
  } else {
    msg = `Se eliminaron ${usersToDel} usuarios inactivos.`;
  }
  const result = await DbUserManager.deleteInactiveUsers(2);
  if (result) {
    const mailOptions = {
      from: "Tienda gourmet de asados <tiendadeasados@gmail.com>",
      to: "",
      subject: "Importante: Eliminación de Cuenta por Inactividad",
      html: "",
    };
    users.forEach((user) => {
      mailOptions.to = user.email;
      mailOptions.html = getCustomizedMessage(user);
      MailAdapter.send(mailOptions);
    });
    res.status(HTTTP_STATUS_CODES.OK).json({ status: "success", message: msg });
  } else {
    res
      .status(HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
});

function getCustomizedMessage(user) {
  return `<h3>Estimado/a ${user.first_name} ${user.last_name}.</h3><br><br>

Esperamos que estés teniendo un excelente día. <br><br>
Nos ponemos en contacto contigo para informarte sobre un cambio importante relacionado con tu cuenta en nuestra Tienda Gourmet de Asados.<br>
Lamentablemente, hemos observado que tu cuenta ha permanecido inactiva durante un período extendido de tiempo. Con el objetivo de mantener nuestra plataforma segura y eficiente, hemos procedido a eliminar tu cuenta debido a esta inactividad.
Entendemos que pueden surgir ocasiones en las que no se tiene la oportunidad de interactuar con nuestra plataforma. Sin embargo, queremos recordarte que Not Vegan es un lugar vibrante donde puedes encontrar una amplia variedad de productos de alta calidad y aprovechar ofertas exclusivas.
Si deseas seguir siendo parte de nuestra comunidad y disfrutar de las ventajas que ofrecemos, te invitamos cordialmente a volver a visitarnos. Puedes crear una nueva cuenta.<br><br>

Estamos comprometidos en brindarte una experiencia excepcional de compras en línea y en satisfacer todas tus necesidades. Si tienes alguna pregunta o requieres asistencia, no dudes en contactarnos a través de tiendadeasados@gmail.com.<br><br>

Agradecemos tu comprensión y esperamos verte pronto.<br><br>

¡Saludos cordiales!<br><br>

El Equipo de Not Vegan S.A.<br>
<a href="http://localhost:8080">www.not_vegan.com.ar</a>`;
}

module.exports = router;

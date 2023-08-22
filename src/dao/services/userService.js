const userManager = require("../initializers/userInitializer");
const HTTTP_STATUS_CODES = require("../../commons/constants/http-status-codes.constants");
const { hashPassword, isValidPassword } = require("../../utils/cryptPassword");
const UserDTO = require("../../dto/user.dto");
const APP_CONST = require("../../commons/constants/appConstants");
const { generateToken, generateEmailToken } = require("../../utils/token.utils");

class UserService {
  async createUser(body) {
    try {
      const { first_name, last_name, email, age, password } = body;
      if (!first_name || !last_name || !email) {
        return {
          statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
          response: { status: "error", message: "Una o mas propiedades están incompletas" },
        };
      }
      const user = await userManager.getUser(email);
      if (user) {
        return {
          statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
          response: { status: "error", message: "No se pudo dar de alta este usuario" },
        };
      }
      const newUserInfo = {
        first_name,
        last_name,
        email,
        age,
        password: hashPassword(password),
      };
      const userCreated = await userManager.createUser(newUserInfo);
      if (userCreated) {
        userManager.setLastConnection(userCreated._id);
        return {
          statusCode: HTTTP_STATUS_CODES.CREATED,
          response: { status: "success", message: "Usuario creado", userCreated },
        };
      }
    } catch (error) {
      console.error(error);
      return {
        statusCode: HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        response: { status: "error", message: "Internal server error" },
      };
    }
  }
  async getUser(email) {
    return await userManager.getUser(email);
  }
  async getUserById(id) {
    return await userManager.getUserById(id);
  }
  async actualizarPassword(email, password) {
    const pass = hashPassword(password);
    return await userManager.actualizarPassword(email, pass);
  }
  async setLastConnection(id) {
    return await userManager.setLastConnection(id);
  }
  async actualizarRol(req) {
    const { email, role } = req.params;
    if (req.user.email === email) {
      return {
        statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
        response: { status: "error", message: "No puedes modificar tu rol de administrador" },
      };
    }
    const result = await userManager.actualizarRol(email, role);
    if (!result.acknowledged) {
      return {
        statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
        response: { status: "error", message: "No se pudo modificar el rol del usuario" },
      };
    }
    return {
      statusCode: HTTTP_STATUS_CODES.OK,
      response: { status: "success", message: "Rol modificado" },
    };
  }
  async activarCuenta(email) {
    const user = await userManager.getUser(email);
    return await userManager.activarCuenta(user._id);
  }
  async actualizarDocumentos(uid, files) {
    const user = await userManager.getUserById(uid);
    if (!user) {
      return {
        statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
        response: { status: "error", message: "No existe el usuario" },
      };
    }
    let profileImage = null;
    let identification = null;
    let proofOfAddress = null;
    let bankStatement = null;
    if (files["profileImage"]) {
      profileImage = files["profileImage"][0].destination + files["profileImage"][0].filename;
    }
    if (files["identification"]) {
      identification = files["identification"][0].destination + files["identification"][0].filename;
    }
    if (files["proofOfAddress"]) {
      proofOfAddress = files["proofOfAddress"][0].destination + files["proofOfAddress"][0].filename;
    }
    if (files["bankStatement"]) {
      bankStatement = files["bankStatement"][0].destination + files["bankStatement"][0].filename;
    }
    if (profileImage || identification || proofOfAddress || bankStatement) {
      const documents = [];
      const documentStatus = {
        bankStatement: false,
        identification: false,
        proofOfAddress: false,
      };
      if (identification) {
        documents.push({ name: "identification", reference: identification });
        documentStatus.identification = true;
      }
      if (proofOfAddress) {
        documents.push({ name: "proofOfAddress", reference: proofOfAddress });
        documentStatus.proofOfAddress = true;
      }
      if (bankStatement) {
        documents.push({ name: "bankStatement", reference: bankStatement });
        documentStatus.bankStatement = true;
      }

      const userInfo = {
        _id: uid,
        documentStatus,
        profileImage,
        documents,
      };
      const result = await userManager.actualizarDocumentos(uid, userInfo);
      if (result) {
        return {
          statusCode: HTTTP_STATUS_CODES.OK,
          response: { status: "success", message: "documentos guardados" },
        };
      }
    } else {
      return {
        statusCode: HTTTP_STATUS_CODES.OK,
        response: { status: "success", message: "No se enviaron documentos para actualizar" },
      };
    }
  }
  async getAll() {
    const users = await userManager.getAll();
    return users.map((user) => new UserDTO(user));
  }
  async deleteInactiveUsers() {
    const users = await userManager.getInactiveUsers(APP_CONST.INACTIVE_DAYS);
    const usersToDel = users.length;
    let msg = "";
    if (usersToDel === 0) {
      msg = "No hay usuario inactivos para eliminar.";
    } else if (usersToDel === 1) {
      msg = "Se eliminó satisfactoriamente un usuario inactivo.";
    } else {
      msg = `Se eliminaron ${usersToDel} usuarios inactivos.`;
    }
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - APP_CONST.INACTIVE_DAYS);
    const param = {
      last_connection: { $lt: daysAgo },
    };
    const result = await userManager.deleteInactiveUsers(param);
    if (result) {
      return {
        statusCode: HTTTP_STATUS_CODES.OK,
        response: { status: "success", message: msg },
        usersDeleted: users,
      };
    } else {
      return {
        statusCode: HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        response: { status: "error", message: "No se pudo eliminar" },
      };
    }
  }
  async deleteUser(req, email) {
    if (req.user.email === email) {
      return {
        statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
        response: { status: "error", message: "No puedes eliminar tu propia cuenta" },
      };
    }
    const result = await userManager.deleteUser(email);
    return {
      statusCode: HTTTP_STATUS_CODES.OK,
      response: { status: "success", message: "No puedes eliminar tu propia cuenta" },
      email: result.email,
    };
  }
  async changeRole(id) {
    const user = await userManager.getUserById(id);
    if (!user) {
      return {
        statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
        response: { status: "error", message: "Usuario no encontrado" },
      };
    }
    if (user.role === "premium") {
      const updatedUser = this.actualizarRol(user.email, "user");
      if (!updatedUser) {
        return {
          statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
          response: { status: "error", message: "No se pudo cambiar el rol al usuario" },
        };
      }
      return {
        statusCode: HTTTP_STATUS_CODES.OK,
        response: { status: "success", message: "Rol actualizado" },
      };
    }
    if (user.documentStatus.identification & user.documentStatus.proofOfAddress & user.documentStatus.bankStatement) {
      const updatedUser = this.actualizarRol(user.email, "premium");
      if (!updatedUser) {
        return {
          statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
          response: { status: "error", message: "No se pudo cambiar el rol al usuario" },
        };
      }
      return {
        statusCode: HTTTP_STATUS_CODES.OK,
        response: { status: "success", message: "Rol actualizado" },
      };
    } else {
      return {
        statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
        response: { status: "error", message: "No ha terminado de procesar su documentación" },
      };
    }
  }
  async loginUser(req) {
    try {
      const { email, password } = req.body;
      if ((email === "adminCoder@coder.com") & (password === "adminCod3r123")) {
        const user = {
          _id: "CODER",
          first_name: "admin",
          last_name: "Coder",
          email: "adminCoder@coder.com",
          role: "admin",
          password,
        };
        req.user = user;
      } else {
        const user = await userManager.getUser(email);
        if (!user) {
          req.logger.error("El usuario no existe");
          return {
            statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
            response: { status: "error", message: "El usuario y la contraseña no coinciden" },
          };
        }
        if (!isValidPassword(password, user)) {
          req.logger.error("El password no es correcto");
          return {
            statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
            response: { status: "error", message: "El usuario y la contraseña no coinciden" },
          };
        }
        if (!user.confirmed_email) {
          req.logger.error("No confirmó el correo.");
          return {
            statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
            response: { status: "error", message: "Debes confirmar tu correo electrónico haciendo clic en el enlace que te hemos enviado." },
          };
        }
        req.user = user;
      }
      await userManager.setLastConnection(req.user._id);
      const access_token = generateToken({
        email: req.user.email,
        role: req.user.role,
      });
      return {
        statusCode: HTTTP_STATUS_CODES.OK,
        response: { status: "success", message: "Sesión iniciada" },
        access_token,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: HTTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        response: { status: "error", message: "Internal sercer error" },
      };
    }
  }
  async getResetPasswordToken(req) {
    const { email } = req.body;
    const user = await userManager.getUser(email);
    if (user) {
      const token = generateEmailToken(email);
      return token;
    } else {
      return null;
    }
  }
  async updatePassword(req) {
    const { email, password } = req.body;
    const user = await userManager.getUser(email);
    if (isValidPassword(password, user)) {
      return {
        statusCode: HTTTP_STATUS_CODES.BAD_REQUEST,
        response: { status: "error", message: "no puedes utilizar la misma contraseña, debe ser una nueva" },
      };
    } else {
      const hashedPassroed = hashPassword(password);
      await userManager.actualizarPassword(email, hashedPassroed);
      return {
        statusCode: HTTTP_STATUS_CODES.OK,
        response: { status: "success", message: "Se actualizó la password correctamente" },
      };
    }
  }
}

module.exports = UserService;

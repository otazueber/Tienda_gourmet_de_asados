const Users = require("../models/users.model");

class DbUserManager {
  async createUser(newUserInfo) {
    return await Users.create(newUserInfo);
  }
  async getUser(email) {
    try {
      return await Users.findOne({ email });
    } catch (error) {
      console.error("Error en DbUserManager.getUser:", error);
      throw error;
    }
  }
  async getUserById(id) {
    return await Users.findById({ _id: id });
  }
  async actualizarPassword(email, pass) {
    return await Users.updateOne({ email: email }, { $set: { password: pass } });
  }
  async setLastConnection(id) {
    return await Users.updateOne({ _id: id }, { $set: { last_connection: new Date() } });
  }
  async actualizarRol(email, role) {
    return await Users.updateOne({ email: email }, { $set: { role: role } });
  }
  async activarCuenta(id) {
    return await Users.updateOne({ _id: id }, { $set: { confirmed_email: true } });
  }
  async actualizarDocumentos(uid, userInfo) {
    const documents = await Users.updateOne({ _id: uid }, { $set: { documents: userInfo.documents } });
    const status = await Users.updateOne({ _id: uid }, { $set: { documentStatus: userInfo.documentStatus } });
    const profile = await Users.updateOne({ _id: uid }, { $set: { profileImage: userInfo.profileImage } });
    return documents.acknowledged & status.acknowledged & profile.acknowledged;
  }
  async getAll() {
    return await Users.find();
  }
  async getInactiveUsers(param) {
    return await Users.find(param);
  }
  async deleteInactiveUsers(param) {
    return await Users.deleteMany(param);
  }
}

module.exports = DbUserManager;

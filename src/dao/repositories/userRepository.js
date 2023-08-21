class UserRepository {
  constructor(manager) {
    this.manager = manager;
  }
  async createUser(newUserInfo) {
    return await this.manager.createUser(newUserInfo);
  }
  async getUser(email) {
    try {
      return await this.manager.getUser(email);
    } catch (error) {
      console.error("Error en UserRepository.getUser:", error);
      throw error;
    }
  }
  async getUserById(id) {
    return await this.manager.getUserById(id);
  }
  async actualizarPassword(email, password) {
    return await this.manager.actualizarPassword(email, password);
  }
  async setLastConnection(id) {
    return await this.manager.setLastConnection(id);
  }
  async actualizarRol(email, role) {
    return await this.manager.actualizarRol(email, role);
  }
  async activarCuenta(email, confirmed_email) {
    return await this.manager.activarCuenta(email, confirmed_email);
  }
  async actualizarDocumentos(uid, userInfo) {
    return await this.manager.actualizarDocumentos(uid, userInfo);
  }
  async getAll() {
    return await this.manager.getAll();
  }
  async getInactiveUsers(days) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    const param = { last_connection: { $lt: daysAgo } };
    return this.manager.getInactiveUsers(param);
  }
  async deleteInactiveUsers(days) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    const param = {
      last_connection: { $lt: daysAgo },
    };
    const result = await this.manager.deleteInactiveUsers(param);
    return result.acknowledged;
  }
}

module.exports = UserRepository;

const Users = require('../dao/models/users.model');
const { hashPassword } = require('../utils/cryptPassword');

class DbUserManager {
    static async createUser(newUserInfo) {
        return await Users.create(newUserInfo);
    }
    static async getUser(email) {
        return await Users.findOne({ email });
    }
    static async getUserById(id) {
        return await Users.findById({ _id: id });
    }
    static async actualizarPassword(email, password) {
        try {
            const pass = hashPassword(password);
            const usuarioActualizado = await Users.findOneAndUpdate(
                { email: email },
                { password: pass },
                { new: true }
            );
            return usuarioActualizado;
        } catch (error) {
            throw error;
        }
    }
    static async setLastConnection(email) {
        try {
            const usuarioActualizado = await Users.findOneAndUpdate(
                { email: email },
                { last_connection: new Date() }
            );
            return usuarioActualizado;
        } catch (error) {
            throw error;
        }
    }
    static async actualizarRol(email, role) {
        try {
            const usuarioActualizado = await Users.findOneAndUpdate(
                { email: email },
                { role: role },
                { new: true }
            );
            return usuarioActualizado;
        } catch (error) {
            throw error;
        }
    }
    static async actualizarDocumentos(documentInfo) {
        try {
            const usuarioActualizado = await Users.findOneAndUpdate(
                {
                    _id: documentInfo.uid,
                    documentStatus: {
                        identification: documentInfo.identification !== null? true: false,
                        proofOfAddress: documentInfo.proofOfAddress !== null? true: false,
                        bankStatement: documentInfo.bankStatement !== null? true: false,
                    },
                    profileImage: documentInfo.profileImage,
                }
            );
            return usuarioActualizado;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = DbUserManager;
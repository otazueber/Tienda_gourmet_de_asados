const Users = require('../dao/models/users.model');
const { hashPassword } = require('../utils/cryptPassword');

class DbUserManager {

    static async getUser(email) {
        return await Users.findOne({ email });

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
};

module.exports = DbUserManager;
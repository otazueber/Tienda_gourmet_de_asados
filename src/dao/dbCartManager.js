const Carts = require('./models/carts.model');

class CartManager {
    constructor() { }

    async addCart() {
        const newCart = await Carts.create({ products: [] });
        if (newCart) {
            return newCart._id;
        } else {
            return null;
        }
    }

    async getCarts() {
        return await Carts.find();
    }

    async getCartById(id) {
        return await Carts.findById(id).populate('products.product');
    }

    async deleteCart(id) {
        return await Carts.deleteOne({ _id: id });
    }

    async deleteProducts(id) {
        const cartToUpdate = await this.getCartById(id);
        cartToUpdate.products = [];
        return await Carts.updateOne({ _id: id }, cartToUpdate);
    }

    async updateCart(id, product) {
        const cartToUpdate = await this.getCartById(id);
        if (cartToUpdate) {
            const productToUpdate = cartToUpdate.products.find(p => p.product._id == product.product);
            if (productToUpdate) {
                productToUpdate.quantity = productToUpdate.quantity + product.quantity;
            } else {
                cartToUpdate.products.push(product);
            }
            return await Carts.updateOne({ _id: id }, cartToUpdate);
        }
        return false;
    }

    async deleteProduct(cid, pid) {
        
        try {
            const cartToUpdate = await this.getCartById(cid);
            const index = cartToUpdate.products.findIndex(producto => producto.product._id.toString().trim() == pid.toString().trim());
            if (index != -1) {
                cartToUpdate.products.splice(index, 1);
                await Carts.updateOne({ _id: cid }, cartToUpdate);
                return true;
            } else {
                return false;
            }
        } catch (error) {

        }
    }
}

module.exports = CartManager;

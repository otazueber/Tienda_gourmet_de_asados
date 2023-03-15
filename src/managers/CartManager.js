const fs = require("fs");

class CartManager {
    constructor(path) {
        this.path = path;
        this.file = path + 'carts.json';
    }

    addCart() {
        try {
            const carts = this.getCarts();
            let nextId = 0;
            if (carts.length == 0) {
                nextId = 1;
            } else {
                nextId = carts[carts.length - 1].id + 1;
            }

            const newCart = {
                id: nextId,
                products: []
            };

            carts.push(newCart);
            this.writeCartsToFile(carts);
            return nextId;
        } catch (error) {
            console.error(error);
            return 0;
        }
    }

    getCarts() {
        try {
            return JSON.parse(fs.readFileSync(this.file, "utf-8"));
        } catch {
            return [];
        }
    }

    getCartById(id) {
        return this.getCarts().find(p => p.id == id);
    }

    deleteCart(id) {
        try {
            const updatedCarts = this.getCarts().filter((cart) => cart.id != id);
            this.writeCartsToFile(updatedCarts);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    updateCart(id, product) {
        const carts = this.getCarts();
        const cartToUpdate = carts.find((c) => c.id == id);
        if (cartToUpdate) {
            const productToUpdate = cartToUpdate.products.find(p => p.id == product.id);
            if (productToUpdate) {
                productToUpdate.quantity = productToUpdate.quantity + product.quantity;
            } else {
                cartToUpdate.products.push(product);
            }
            const updatedCarts = carts.map((cart) =>
                cart.id == id ? cartToUpdate : cart
            );
            this.writeCartsToFile(updatedCarts);
            return true;
        }
        return false;
    }

    writeCartsToFile(carts) {
        try {
            if (!fs.existsSync(this.path)) {
                fs.mkdirSync(this.path, { recursive: true });
            }
            const productsJSON = JSON.stringify(carts, null, 2);
            fs.writeFileSync(this.file, productsJSON, "utf-8");
        } catch (error) {
            console.error(`Error al grabar el archivo ${this.path}: ${error}`);
        }
    }
}

module.exports = CartManager;

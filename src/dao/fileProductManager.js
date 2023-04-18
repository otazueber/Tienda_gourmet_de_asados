const fs = require("fs");

class FileProductManager {
    constructor(path) {
        this.path = path;
        this.file = path + 'products.json';
    }

    addProduct(product) {
        const products = this.getProducts();
        let nextId = 0;
        if (products.length == 0) {
            nextId = 1;
        } else {
            nextId = products[products.length - 1].id + 1;
        }
        const { title, description, code, price, stock, category } = product;

        if (products.some(p => p.code === product.code)) {
            return [400, "El código de producto ya existe!!!"];
        }

        if (!title || !description || !code || !price || !stock || !category) {
            return [400, "Todos los campos del producto son requeridos!!!"];
        }

        const newProduct = {
            ...product,
            id: nextId,
            thumbnails: product.thumbnails === undefined ? [] : product.thumbnails,
            status: product.status === undefined ? true : product.status
        };

        products.push(newProduct);
        this.writeProductsToFile(products);
        return [200, "Producto agregado satisfactoriamente"];
    }

    getProducts() {
        try {
            const jsonProducts = JSON.parse(fs.readFileSync(this.file, "utf-8"));
            return jsonProducts;

        } catch (error) {
            console.error('Error: ' + error);
            return [];
        }
    }

    getProductById(id) {
        return this.getProducts().find(p => p.id == id);
    }

    deleteProduct(id) {
        const updatedProducts = this.getProducts().filter((product) => product.id != id);
        this.writeProductsToFile(updatedProducts);
    }

    updateProduct(id, updatedFields) {
        const products = this.getProducts();
        const productToUpdate = products.find((product) => product.id == id);
        if (productToUpdate) {
            const updatedProduct = { ...productToUpdate, ...updatedFields };
            const updatedProducts = products.map((product) =>
                product.id == id ? updatedProduct : product
            );
            this.writeProductsToFile(updatedProducts);
            return true;
        }
        return false;
    }

    writeProductsToFile(products) {
        try {
            if (!fs.existsSync(this.path)) {
                fs.mkdirSync(this.path, { recursive: true });
            }
            const productsJSON = JSON.stringify(products, null, 2);
            fs.writeFileSync(this.file, productsJSON, "utf-8");
        } catch (error) {
            console.error(`Error al grabar el archivo ${this.path}: ${error}`);
        }
    }
}

module.exports = FileProductManager;

// Para agregar un id autoincrementable a cada producto para que no sea necesario proporcionar un id manualmente 
// cada vez que se agrega un nuevo producto, uso la variable nextId que se inicializa en 1 y se incrementa cada vez que se agrega un nuevo producto. 
// Cuando se agrega un nuevo producto, se asigna el valor de nextId al campo id del producto y luego se incrementa el valor de nextId.

// Para que la variable nextId sea privada, para que no sea accesible desde fuera de la clase ProductManager, la declaré dentro del constructor de la clase con let.

const fs = require("fs");

class ProductManager {
    constructor(path) {
        let nextId = 1;
        this.path = path;
        this.file = path + 'products.json';
        this.addProduct = function (product) {
            let canAdd = true;
            const products = this.getProducts();
            if (products.some(p => p.code === product.code)) {
                console.error("El código de producto ya existe!!!");
                canAdd = false;
            }

            if (!product.title || !product.description || !product.price || !product.thumbnail || !product.code || !product.stock) {
                console.error("Todos los campos del producto son requeridos!!!");
                canAdd = false;
            }

            if (canAdd) {
                const newProduct = {
                    ...product,
                    id: nextId,
                };

                products.push(newProduct);
                this.writeProductsToFile(products);
                nextId++;
            }
        }
    }

    getProducts() {
        try {
            return JSON.parse(fs.readFileSync(this.file, "utf-8"));
        } catch (error) {
            console.error('Error: ' + error);
            return [];
        }
    }

    getProductById(id) {
        const product = this.getProducts().find(p => p.id == id);
        if (!product) {
            console.error("Producto no encontrado!!!");
        }
        return product;
    }

    deleteProduct(id) {
        const updatedProducts = this.getProducts().filter((product) => product.id !== id);
        this.writeProductsToFile(updatedProducts);
    }

    updateProduct(id, updatedFields) {
        const products = this.getProducts();
        const productToUpdate = products.find((product) => product.id === id);
        if (productToUpdate) {
            const updatedProduct = { ...productToUpdate, ...updatedFields };
            const updatedProducts = products.map((product) =>
                product.id === id ? updatedProduct : product
            );
            this.writeProductsToFile(updatedProducts);
        }
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

module.exports = ProductManager;

const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

class ProductManager {
  constructor() {
    this.path = process.cwd() + "/public/assets/json/";
    this.file = path + "products.json";
  }

  addProduct(product) {
    try {
      const products = this.internalgetProducts();
      if (products.some((p) => p.code === product.code)) {
        throw new Error("El código de producto ya existe.");
      }
      if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category) {
        throw new Error("Todos los campos del producto son requeridos!!!.");
      }
      const newProduct = {
        ...product,
        _id: uuidv4(),
        thumbnails: product.thumbnails === undefined ? "" : product.thumbnails,
        status: product.status === undefined ? true : product.status,
      };

      products.push(newProduct);
      this.internalWriteProductsToFile(products);
      return newProduct;
    } catch (error) {
      console.error("Error agregando producto", error);
      throw error;
    }
  }
  getPaginatedProducts(query, options) {
    try {
      const products = this.internalgetProducts();
      const filteredProducts = products;
      const resultProducts = [];
      if (query) {
        filteredProducts = products.filter((p) => p.category === query);
      }
      const from = options.page * options.limit - options.limit;
      const to = options.page * options.limit;
      if (filteredProducts.length >= to) {
        for (let index = from; index < to; index++) {
          resultProducts.push(filteredProducts[index]);
        }
      }
      const hasPrevPage = options.page - 1 > 0;
      const hasNextPage = options.page + 1 < Math.ceil(products.length / options.limit);
      return {
        docs: resultProducts,
        totalPages: Math.ceil(products.length / options.limit),
        prevPage: hasPrevPage ? options.page - 1 : null,
        nextPage: hasNextPage ? options.page + 1 : null,
        page: options.page,
        hasPrevPage,
        hasNextPage,
      };
    } catch (error) {
      console.error("Error obteniendo productos", error);
      throw error;
    }
  }
  getProductById(id) {
    try {
      const product = this.getProducts().find((p) => p._id === id);
      if (product) {
        return product;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error al obtener producto por ID:", error);
      throw error;
    }
  }
  deleteProduct(id) {
    try {
      const products = this.internalgetProducts();
      const originalLengthProducts = products.length;
      const updatedProducts = products.filter((p) => p._id != id);
      this.internalWriteProductsToFile(updatedProducts);
      if (products.length < originalLengthProducts) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error intentando eliminar el producto:", error);
      throw error;
    }
  }
  updateProduct(id, updatedFields) {
    try {
      const products = this.getProducts();
      const productToUpdate = products.find((p) => p._id === id);
      if (productToUpdate) {
        const updatedProduct = { ...productToUpdate, ...updatedFields };
        const updatedProducts = products.map((product) => (product.id === id ? updatedProduct : product));
        this.internalWriteProductsToFile(updatedProducts);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error actualizando el producto:", error);
      throw error;
    }
  }
  getProducts() {
    return this.internalgetProducts();
  }
  discountStock(id, quantity) {
    const products = this.internalgetProducts();
    const product = products.find((p) => p._id === id);
    product.stock -= quantity;
    const updatedProducts = products.filter((p) => p._id != id);
    updatedProducts.push(product);
    this.internalWriteProductsToFile(updatedProducts);
  }

  internalWriteProductsToFile(products) {
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
  internalgetProducts() {
    try {
      const products = JSON.parse(fs.readFileSync(this.file, "utf-8"));
      return products;
    } catch (error) {
      console.error("Error: " + error);
      throw new Error("error al obtener los productos desde el archivo");
    }
  }
}

module.exports = ProductManager;

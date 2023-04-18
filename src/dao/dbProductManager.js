const Products = require('./models/products.model');


class DbProductManager {
    constructor() { }

    async addProduct(product) {
        return await Products.create(product);
    }

    async addManyProducts(products) {
        return await Products.insertMany(products);
    }

    async getProducts(endpoint, limit, page, sort, query) {
        const internalLimit = limit || 10;
        const internalPage = page || 1;
        let products;
        if (sort) {
            const options = {
                page: internalPage,
                limit: internalLimit,
                sort: { price: sort },
            };
            products =  await Products.paginate(query? { category: query } : {}, options);
        } else {
            products =  await Products.paginate(query? { category: query } : {}, { limit: internalLimit, page: internalPage });
        }
        let prevLink;
        let nextLink;
        if ((products.page > 1)) {
            prevLink = `${endpoint}?limit=${products.limit}&page=${products.page - 1}`;
            if (sort) {
                prevLink = prevLink + `&sort=${sort}`;
            }
            if (query) {
                C = prevLink + `&query=${query}`;
            }
        }

        if ((products.page < products.totalPages)) {
            nextLink = `${endpoint}?limit=${products.limit}&page=${products.page + 1}`;
            if (sort) {
                nextLink = nextLink + `&sort=${sort}`;
            }
            if (query) {
                nextLink = nextLink + `&query=${query}`;
            }
        }
        const result = {
            status: 'success',
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: (products.hasPrevPage) ? prevLink : null,
            nextLink:  (products.hasNextPage < products.totalPages)  ? nextLink : null,
        }
        return result;
    }

    async getProductById(id) {
        return await Products.findById(id);
    }

    async deleteProduct(id) {
        await Products.deleteOne({ _id: id });
        return true;
    }

    async updateProduct(id, productInfo) {
        await Products.updateOne({ _id: id }, productInfo);
        return true;
    }
}

module.exports = DbProductManager;

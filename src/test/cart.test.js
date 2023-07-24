const chai = require('chai');
const supertest = require('supertest');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Testing Carts API Endpoints', () => {
  let testProductId;
  let testCartId;
  const testImagePath = path.join(__dirname, '..', 'public/assets/img/imgTest.jpg');   
    const fakeAdminToken = jwt.sign({ email: 'adminCoder@coder.com', role: 'admin' }, 'jwtSecret', { expiresIn: '1h' });    
    const fakeUserToken = jwt.sign({ email: 'otazueber@gmail.com', role: 'user' }, 'jwtSecret', { expiresIn: '1h' });
    const testProduct = {
      title: 'Producto de test',
      code: 'TEST123',
      status: true,
      measurement: 'unidad',
      stock: 100,
      price: 9.99,
      description: 'Descripción del producto',
      category: 'categoría del producto',
    };

  before(async () => {
    const res = await requester.post('/api/products')
      .set('Authorization', `Bearer ${fakeAdminToken}`)
      .field('title', testProduct.title)
      .field('code', testProduct.code)
      .field('status', testProduct.status)
      .field('measurement', testProduct.measurement)
      .field('stock', testProduct.stock)
      .field('price', testProduct.price)
      .field('description', testProduct.description)
      .field('category', testProduct.category)
      .attach('file', testImagePath);

    const product = res.body.message;
    testProductId = product._id;
  });

  after(async () => {
    await requester.delete(`/api/products/${testProductId}`)
      .set('Authorization', `Bearer ${fakeAdminToken}`);
  });

  it('01 - Debería crear un nuevo carrito correctamente', async () => {
    const res = await requester.post('/api/carts');
    expect(res.body).to.have.property('idCart');
    testCartId = res.body.idCart;
  });

  it('02 - Debería obtener todos los carritos', async () => {
    const res = await requester.get('/api/carts')
      .set('Authorization', `Bearer ${fakeAdminToken}`);
    expect(res.body).to.have.property('carts').to.be.an('array');
  });

  it('03 - Debería obtener el carrito por ID', async () => {
    const res = await requester.get(`/api/carts/${testCartId}`);
    expect(res.body).to.be.an('array');
  });

  it('04 - Debería agregar un producto al carrito correctamente', async () => {
    const cartProduct = {
      quantity: 2,
    };
    const res = await requester.put(`/api/carts/${testCartId}/product/${testProductId}`)
      .set('Authorization', `Bearer ${fakeUserToken}`)
      .send(cartProduct);

      expect(res.statusCode).to.equal(200);
  });

  it('05 - Debería borrar todos los productos del carrito', async () => {
    const res = await requester
      .delete(`/api/carts/${testCartId}`)
      .set('Authorization', `Bearer ${fakeUserToken}`);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body).to.have.property('message', 'Productos eliminados satisfactoriamente!!!');
  });
  
  it('06 - Debería borrar un producto del carrito', async () => {
    const cartProduct = {
        quantity: 2,
      };
    await requester.put(`/api/carts/${testCartId}/product/${testProductId}`)
        .set('Authorization', `Bearer ${fakeUserToken}`)
        .send(cartProduct);
    const res = await requester.delete(`/api/carts/${testCartId}/products/${testProductId}`)
      .set('Authorization', `Bearer ${fakeUserToken}`);

    expect(res.body).to.have.property('status', 'success');
    expect(res.body).to.have.property('message', 'Producto eliminado satisfactoriamente!!!');
  });

  it('07 - Debería hacer una compra', async () => {
    const cartProduct = {
      quantity: 2,
    };
    await requester.put(`/api/carts/${testCartId}/product/${testProductId}`)
      .set('Authorization', `Bearer ${fakeUserToken}`)
      .send(cartProduct);

    const res = await requester
      .post(`/api/carts/${testCartId}/purchase`)
      .set('Authorization', `Bearer ${fakeUserToken}`);
    
    expect(res.body).to.have.property('status', 'success');
    expect(res.body).to.have.property('message', 'compra realizada con éxito!!!');
    expect(res.body).to.have.property('ticket');
    expect(res.body.ticket).to.have.property('code');
    expect(res.body.ticket).to.have.property('purchase_datetime');
    expect(res.body.ticket).to.have.property('amount');
    expect(res.body.ticket).to.have.property('purchaser');
  });
});

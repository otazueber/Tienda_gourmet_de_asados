const chai = require("chai");
const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const path = require("path");

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe("Testing Product API Endpoints", () => {
  const testImagePath = path.join(
    __dirname,
    "..",
    "public/assets/img/imgTest.jpg"
  );
  const fakeToken = jwt.sign(
    { email: "adminCoder@coder.com", role: "admin" },
    "jwtSecret",
    { expiresIn: "1h" }
  );
  const testProduct = {
    title: "Producto de test",
    code: "TEST123",
    status: true,
    measurement: "unidad",
    stock: 100,
    price: 9.99,
    description: "Descripción del producto",
    category: "categoría del producto",
  };

  let createdProductId;

  it("01 - Debería crear un nuevo producto correctamente", async () => {
    const res = await requester
      .post("/api/products")
      .set("Authorization", `Bearer ${fakeToken}`)
      .field("title", testProduct.title)
      .field("code", testProduct.code)
      .field("status", testProduct.status)
      .field("measurement", testProduct.measurement)
      .field("stock", testProduct.stock)
      .field("price", testProduct.price)
      .field("description", testProduct.description)
      .field("category", testProduct.category)
      .attach("file", testImagePath);

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property("message");
    createdProductId = res.body.message._id;
  });

  it("02 - Debería obtener el producto por ID", async () => {
    const res = await requester.get(`/api/products/${createdProductId}`);
    expect(res.statusCode).to.equal(200);
    expect(res.body._id).to.equal(createdProductId); //64bc84b86df8e7c71de2da58
    expect(res.body.code).to.equal("TEST123");
  });

  it("03 - Debería actualizar el producto correctamente", async () => {
    const updatedProductInfo = {
      title: "Descripción actualizada",
      price: 19.99,
    };

    await requester
      .put(`/api/products/${createdProductId}`)
      .set("Authorization", `Bearer ${fakeToken}`)
      .send(updatedProductInfo);

    const res = await requester.get(`/api/products/${createdProductId}`);
    expect(res.statusCode).to.equal(200);
    expect(res.body.title).to.equal(updatedProductInfo.title);
    expect(res.body.price).to.equal(updatedProductInfo.price);
  });

  it("04 - Debería eliminar el producto correctamente", async () => {
    await requester
      .delete(`/api/products/${createdProductId}`)
      .set("Authorization", `Bearer ${fakeToken}`);

    const res = await requester.get(`/api/products/${createdProductId}`);
    expect(res.statusCode).to.equal(404);
  });
});

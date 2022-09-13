import createConnection from "../../../../database";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Create statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "User 1",
      email: "email1@test.com.br",
      password: "12345"
    });

    await request(app).post("/api/v1/users").send({
      name: "User 2",
      email: "email2@test.com.br",
      password: "123456"
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.runMigrations();
  });

  it("Should be able create a new statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "email1@test.com.br",
      password: "12345"
    });

    const { user, token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 500,
      description: "My first deposit"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(500);
    expect(response.body).toHaveProperty("id");
    expect(response.body.user_id).toBe(user.id);
  });

  it("Should be able withdraw statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "email1@test.com.br",
      password: "12345"
    });

    const { user, token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 200,
      description: "My first withdraw"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.user_id).toBe(user.id);
  });

  it("Should not be able create a new statement to user not existent", async () => {
    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 500,
      description: "My deposit error"
    }).set({
      Authorization: `Bearer 23582358`
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able withdraw insufficient funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "email1@test.com.br",
      password: "12345"
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 400,
      description: "My first withdraw"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(400);
  });
});

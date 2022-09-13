import { app } from "../../../../app";
import createConnection from "../../../../database";
import request from "supertest"
import { Connection } from "typeorm";

let connection: Connection;
let token: string;

describe("Get Balance", () => {
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

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "email1@test.com.br",
      password: "12345"
    });

    token = responseToken.body.token;

    await request(app).post("/api/v1/statements/deposit").send({
      amount: 500,
      description: "My first deposit"
    }).set({
      Authorization: `Bearer ${token}`
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able get balance", async () => {
    await request(app).post("/api/v1/statements/withdraw").send({
      amount: 300,
      description: "My first withdraw"
    }).set({
      Authorization: `Bearer ${token}`
    });

    const responseBalance = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    });

    expect(responseBalance.status).toBe(200);
    expect(responseBalance.body.balance).toBe(200);
    expect(responseBalance.body.statement.length).toBe(2);
  });

  it("Should not be able get balance to user not existent", async () => {
    const responseBalance = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer 123123`
    });

    expect(responseBalance.status).toBe(401);
  });
});

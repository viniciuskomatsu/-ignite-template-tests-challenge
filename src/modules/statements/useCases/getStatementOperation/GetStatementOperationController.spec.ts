import { app } from "../../../../app";
import createConnection from "../../../../database";
import request from "supertest"
import { Connection } from "typeorm";
import { OperationType } from "../../entities/Statement";

let connection: Connection;
let token: string;
let idStatementTest: string;

describe("Get Statement Operation", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "User 1",
      email: "email1@test.com.br",
      password: "12345"
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "email1@test.com.br",
      password: "12345"
    });

    token = responseToken.body.token;

    const responseDeposit = await request(app).post("/api/v1/statements/deposit").send({
      amount: 500,
      description: "My first deposit"
    }).set({
      Authorization: `Bearer ${token}`
    });

    idStatementTest = responseDeposit.body.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able get statement operation", async () => {
    const response = await request(app).get(`/api/v1/statements/${idStatementTest}`).send().set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.type).toBe(OperationType.DEPOSIT);
    expect(response.body.amount).toBe("500.00");
  });

  it("Should not be able get statement operation to user not existent", async () => {
    const response = await request(app).get(`/api/v1/statements/${idStatementTest}`).send().set({
      Authorization: `Bearer 12345`
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able get statement operation to statement not existent", async () => {
    const response = await request(app).get("/api/v1/statements/12345").send().set({
      Authorization: "Bearer ${token}"
    });

    expect(response.status).toBe(401);
  });
});

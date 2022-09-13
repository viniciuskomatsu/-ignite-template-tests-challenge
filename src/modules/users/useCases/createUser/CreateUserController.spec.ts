import { Connection } from "typeorm";
import { app } from "../../../../app";
import request from "supertest";
import createConnection from "../../../../database";

let connection: Connection

describe("Create User Controller", () => {
  beforeAll(async() => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User 1",
      email: "email@test.com.br",
      password: "12345"
    });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create a new user with email existent", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User 1",
      email: "email@test.com.br",
      password: "12345"
    });

    expect(response.status).toBe(400);
  });
});

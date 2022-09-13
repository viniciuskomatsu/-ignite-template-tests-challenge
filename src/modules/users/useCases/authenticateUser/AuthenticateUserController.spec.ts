import createConnection from "../../../../database";
import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection

describe("Authenticate User Controller", () => {
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
    await connection.close();
  });

  it("Should be able to authenticate an user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "email1@test.com.br",
      password: "12345"
    });

    const { user, token } = responseToken.body;

    expect(user.name).toBe("User 1");
    expect(token.length).toBeGreaterThan(8);
  });

  it("Should not be able to authenticate a none user existent", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "incorrect@test.com.br",
      password: "12345"
    });

    expect(responseToken.status).toBe(401);
  });

  it("Should not be able to authenticate with incorrect password", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "email1@test.com.br",
      password: "123456"
    });

    expect(responseToken.status).toBe(401);
  });
});

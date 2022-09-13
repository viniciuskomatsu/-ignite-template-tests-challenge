import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { response } from "express";

let connection: Connection;

describe("Show user profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get user", async () => {
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

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/profile").send().set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("User 1");
  });

  it("Should not be able to get user not existent", async () => {
    const response = await request(app).get("/api/v1/profile").send().set({
      Authorization: `Bearer 123123`
    });

    expect(response.status).toBe(401);
  });
});

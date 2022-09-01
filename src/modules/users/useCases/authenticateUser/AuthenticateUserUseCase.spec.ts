import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to authenticate an user", async () => {
    const user = {
      name: "Usuario 1",
      email: "teste@teste.com.br",
      password: "teste"
    }

    await createUserUseCase.execute(user);

    const authenticate = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(authenticate).toHaveProperty("user");
    expect(authenticate.user).toHaveProperty("id");
    expect(authenticate).toHaveProperty("token");
  });

  it("Should not be able to authenticate a none existent user", () => {
    expect(async () => {
      const user = {
        name: "Usuario 1",
        email: "teste@teste.com.br",
        password: "teste"
      }

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: "incorrect@email.com.br",
        password: "noexistent"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate with incorrect password", () => {
    expect(async () => {
      const user = {
        name: "Usuario 1",
        email: "teste@teste.com.br",
        password: "teste"
      }

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: "teste@teste.com.br",
        password: "incorrect"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});

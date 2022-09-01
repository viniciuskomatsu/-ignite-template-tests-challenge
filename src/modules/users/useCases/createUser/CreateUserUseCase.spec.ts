import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeAll(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to create a new user", async () => {
    const user = {
      name: "Usuario 1",
      email: "teste@teste.com.br",
      password: "teste"
    }

    await createUserUseCase.execute(user);

    const userReturn = await usersRepositoryInMemory.findByEmail(user.email);

    expect(userReturn!.name).toBe(user.name);
    expect(userReturn!.email).toBe(user.email);
    expect(userReturn!).toHaveProperty("id");
    expect(await compare(user.password, userReturn!.password)).toBe(true);
  });

  it("Should not be able to create a new user with e-mail exits", async () => {
    expect(async () => {
      const user1 = {
        name: "Usuario 1",
        email: "teste@teste.com.br",
        password: "teste"
      }
      const user2 = {
        name: "Usuario 2",
        email: "teste@teste.com.br",
        password: "teste"
      }

      await createUserUseCase.execute(user1);
      await createUserUseCase.execute(user2);

    }).rejects.toBeInstanceOf(CreateUserError);
  });

});

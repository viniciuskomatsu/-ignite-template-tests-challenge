import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to get user", async () => {
    const user = {
      name: "Usuario teste",
      email: "email@teste.com.br",
      password: "1234"
    }

    const userCreated = await createUserUseCase.execute(user);

    const userReturn = await showUserProfileUseCase.execute(userCreated.id!);

    expect(userReturn).toHaveProperty("id");
    expect(userReturn.id).toBe(userCreated.id);

    expect(userReturn).toHaveProperty("name");
    expect(userReturn.name).toBe(user.name);

    expect(userReturn).toHaveProperty("email");
    expect(userReturn.email).toBe(userCreated.email);
  });

  it("Should not be able to get user not existent", () => {
    expect(async () => {
      const user = {
        name: "Usuario teste",
        email: "email@teste.com.br",
        password: "1234"
      }

      const userCreated = await createUserUseCase.execute(user);

      await showUserProfileUseCase.execute("2-358po3dfkgwioer");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});

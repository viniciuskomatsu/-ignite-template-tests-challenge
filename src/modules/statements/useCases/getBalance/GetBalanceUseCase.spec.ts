import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("Should be able get balance", async () => {
    const user = {
      name: "User Test",
      email: "email@teste.com.br",
      password: "12345"
    }
    const userCreated = await inMemoryUsersRepository.create(user);

    const statement: ICreateStatementDTO = {
      user_id: userCreated.id!,
      type: OperationType.DEPOSIT,
      amount: 1000.50,
      description: "My first deposit"
    }
    const statementCreated = await inMemoryStatementsRepository.create(statement);

    const statementReturned = await getBalanceUseCase.execute({
      user_id: userCreated.id!
    });

    expect(statementReturned).toHaveProperty("statement");
    expect(statementReturned.statement.length).toBe(1);
    expect(statementReturned.balance).toBe(statement.amount);
    expect(statementReturned.statement[0].id).toBe(statementCreated.id);
  });

  it("Should not be able get balance to user not existent", () => {
    expect(async () => {
      const user = {
        name: "User Test",
        email: "email@teste.com.br",
        password: "12345"
      }
      const userCreated = await inMemoryUsersRepository.create(user);

      const statement: ICreateStatementDTO = {
        user_id: userCreated.id!,
        type: OperationType.DEPOSIT,
        amount: 1000.50,
        description: "My first deposit"
      }
      await inMemoryStatementsRepository.create(statement);

      await getBalanceUseCase.execute({user_id: "12345"});
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});

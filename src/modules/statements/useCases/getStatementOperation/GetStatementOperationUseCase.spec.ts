import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("Should be able get statement operation", async () => {
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

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: userCreated.id!,
      statement_id: statementCreated.id!
    });

    expect(statementOperation.id).toBe(statementCreated.id);
    expect(statementOperation.user_id).toBe(statementCreated.user_id);
  });

  it("Should not be able get statement operation to user not existent", () => {
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
      const statementCreated = await inMemoryStatementsRepository.create(statement);

      await getStatementOperationUseCase.execute({
        user_id: "12345",
        statement_id: statementCreated.id!
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able get statement operation to statement not existent", () => {
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
      const statementCreated = await inMemoryStatementsRepository.create(statement);

      await getStatementOperationUseCase.execute({
        user_id: userCreated.id!,
        statement_id: "12345"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});

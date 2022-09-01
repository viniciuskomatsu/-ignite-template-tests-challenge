import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("Should be able create a new statement", async () => {
    const userCreted = await inMemoryUsersRepository.create({
      name: "User 1",
      email: "email@test.com.br",
      password: "12345"
    });

    const statement: ICreateStatementDTO = {
      user_id: userCreted.id!,
      type: OperationType.DEPOSIT,
      amount: 500.00,
      description: "My first deposit"
    }

    const statementCreated = await createStatementUseCase.execute(statement);

    expect(statementCreated).toHaveProperty("id");
    expect(statementCreated.user_id).toBe(userCreted.id);
    expect(statementCreated.type).toBe(statement.type);
    expect(statementCreated.amount).toBe(statement.amount);
    expect(statementCreated.description).toBe(statement.description);
  });

  it("Should be able withdraw statement", async () => {
    const userCreted = await inMemoryUsersRepository.create({
      name: "User 1",
      email: "email@test.com.br",
      password: "12345"
    });

    const deposit: ICreateStatementDTO = {
      user_id: userCreted.id!,
      type: OperationType.DEPOSIT,
      amount: 500.00,
      description: "My first deposit"
    }

    const statementDeposit = await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id: userCreted.id!,
      type: OperationType.WITHDRAW,
      amount: 300.50,
      description: "My first withdraw"
    }

    const statementWithdraw = await createStatementUseCase.execute(withdraw);

    expect(statementWithdraw).toHaveProperty("id");
    expect(statementWithdraw.user_id).toBe(statementDeposit.user_id);
    expect(statementWithdraw.type).toBe(withdraw.type);
    expect(statementWithdraw.amount).toBe(withdraw.amount);
    expect(statementWithdraw.description).toBe(withdraw.description);
  });

  it("Should not be able create a new statement to user not existent", () => {
    expect(async () => {
      await inMemoryUsersRepository.create({
        name: "User 1",
        email: "email@test.com.br",
        password: "12345"
      });

      const statement: ICreateStatementDTO = {
        user_id: "23-582ff0430f0wer8ew",
        type: OperationType.DEPOSIT,
        amount: 500.00,
        description: "My first deposit"
      }

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able withdraw insufficient funds", () => {
    expect(async () => {
      const userCreated = await inMemoryUsersRepository.create({
        name: "User 1",
        email: "email@test.com.br",
        password: "12345"
      });

      const statement: ICreateStatementDTO = {
        user_id: userCreated.id!,
        type: OperationType.DEPOSIT,
        amount: 500.00,
        description: "My first deposit"
      }

      await createStatementUseCase.execute(statement);

      const withdraw: ICreateStatementDTO = {
        user_id: userCreated.id!,
        type: OperationType.WITHDRAW,
        amount: 800.00,
        description: "My withdraw insufficient"
      }

      await createStatementUseCase.execute(withdraw);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});

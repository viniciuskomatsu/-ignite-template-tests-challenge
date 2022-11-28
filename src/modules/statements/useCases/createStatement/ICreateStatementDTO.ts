import { OperationType } from "../../entities/Statement";

interface ICreateStatementDTO {
  user_id: string;
  description: string;
  amount: number;
  type: OperationType;
  receiver_id?: string;
}

export { ICreateStatementDTO }

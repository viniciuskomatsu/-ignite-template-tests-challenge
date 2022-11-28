import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class addColumnsSenderidReceiveridStatements1669465625212 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumns('statements', [
        new TableColumn({
          name: 'sender_id',
          type: 'uuid',
          isNullable: true
        }),
        new TableColumn({
          name: 'receiver_id',
          type: 'uuid',
          isNullable: true
        })
      ]);

      await queryRunner.createForeignKeys('statements', [
        new TableForeignKey({
          name: 'fksenderidstatements',
          columnNames: ['sender_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }),
        new TableForeignKey({
          name: 'fkreceiveridstatements',
          columnNames: ['receiver_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        })
      ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('statements', 'fkreceiveridstatements');
      await queryRunner.dropForeignKey('statements', 'fksenderidstatements');
      await queryRunner.dropColumn('statements', 'receiver_id');
      await queryRunner.dropColumn('statements', 'sender_id');
    }

}

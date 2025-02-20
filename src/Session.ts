import { Entity, PrimaryColumn, Column, BaseEntity } from "typeorm";
// セッションのエンティティ
@Entity({ name: "session" })
export class Session extends BaseEntity {
  @PrimaryColumn()
  sid!: string;  // セッションID

  @Column({ type: "jsonb" })
  sess!: any;  // セッションデータ（クラスインスタンスを保存）

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  expire!: Date;  // セッションの有効期限
}

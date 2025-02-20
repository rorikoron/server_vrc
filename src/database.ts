import "reflect-metadata";
import { DataSource } from "typeorm";
import { Session } from "./Session";
import { Pool } from "pg"

// PostgreSQLの接続設定
export const AppDataSource = new DataSource({
  type: "postgres",
  host: "db",   // Docker内のPostgreSQLに接続
  port: 5432,
  username: "user",
  password: "password",
  database: "mydatabase",
  entities: [Session],  // Sessionエンティティを使う
  synchronize: true,  // 初回起動時にDBスキーマを作成
});

// pgPoolの作成
export const pgPool = new Pool({
    user: "user",
    host: "db",
    database: "mydatabase",
    password: "password",
    port: 5432,
  });
  
// DB接続の初期化
export const startDatabase = async () => {
  await AppDataSource.initialize();
  console.log("PostgreSQL Connected!");
};

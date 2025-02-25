// load .env file
//require('dotenv').config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import apiRouter from './routes/api'
import pgSession from "connect-pg-simple";
import { pgPool, startDatabase } from "./database";
import { AppDataSource } from "./database";
import { Session } from "./Session";
import { log } from 'console';

const app = express();
const PORT = 8000;
const EXPO_PORT = 8081

const PgStore = pgSession(session);
// parse JSON
app.use(express.json());

// allow CORS and session-cookies
app.use(cors({
    origin: `http://localhost:${EXPO_PORT}`,
    credentials: true
}));


// session settings
app.use(
    session({
        store: new PgStore({
            pool: pgPool,  // TypeORMのDB接続を使用
            tableName: "session",  // sessionテーブルを使用
            ttl: 86400, // セッションの有効期限（秒単位）
            pruneSessionInterval: false, // 自動的に期限切れセッションを削除しない
        }),
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {httpOnly: true, secure: false}
    })
)

// TODO: replace with redis?
const dummyUser: { [key: string]: string } = { "username": "1234" };


app.post('/auth', (req: Request, res: Response) => {
    const { username, password } = req.body;
    log("username: ", username, ", password: ", password)
    log("correct: ", dummyUser["username"])
    log(dummyUser[username] && dummyUser[username] === password)

    // if have logged in
    if(req.session.login){
        res.status(200).json({message: "You've logged in successfully"})
        return;
    }

    // TODO: here password should decode first
    if(dummyUser[username] && dummyUser[username] === password){
        req.session.login = true
        res.status(200).json({message: "Authenticated!"})
        return;
    }

    res.status(401).json({
        error: "Invalid crendentials"
    })
})

app.get('/auth/verify', (req: Request, res: Response) => {
    if(req.session && req.session.login){
        res.status(200).json({
            message: "You've logged in"
        })
        return;
    }

    res.status(401).json({
        message: "You haven't logged in"
    })
})

app.use("/api", apiRouter);


startDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
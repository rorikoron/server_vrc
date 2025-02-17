// load .env file
//require('dotenv').config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import apiRouter from './routes/api'
import RedisClient from '../redisClient';
import { RedisStore } from 'connect-redis';
import { log } from 'console';

const app = express();
const port = 8000;
const EXPO_port = 8081

// parse JSON
app.use(express.json());

// allow CORS and session-cookies
app.use(cors({
    origin: `http://localhost:${EXPO_port}`,
    credentials: true
}));

// session settings
// should set secure to true when release(use https instead then)
const redis = RedisClient.getInstance()
app.use(session({
    store: new RedisStore({ client: redis }),
    secret: "",
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: true, secure: false}
}))

// TODO: replace with redis?
const dummyUser: { [key: string]: string } = { "username": "encrypted_password" };


app.post('/auth', (req: Request, res: Response) => {
    const { uuid, password } = req.body;

    // if have logged in
    if(req.session.login){
        res.status(200).json({message: "You've logged in successfully"})
        return;
    }

    // TODO: here password should hash first
    if(dummyUser[uuid] && dummyUser[uuid] == password){
        res.status(200).json({message: "Authenticated!"})
        req.session.login = true
        return;
    }

    res.status(401).json({
        error: "Invalid crendentials"
    })
})

app.post('/auth/verify', (req: Request, res: Response) => {
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


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
import { VRChatAPI, VRCWebSocket, EventType, FriendOnline, RequestError, requestType, TransactionType, TOTPRequired, EmailOtpRequired, CookiesExpired, FriendLocation } from 'vrc-ts';
// load .env file
require('dotenv').config();


interface TokenStoreType {
    [key: string]: string;
}
//main();
/*
async function main() {
    try {
        await api.login();
        console.log(`Logged in successfully as ${api.currentUser!.displayName}!`);


        const ws = new VRCWebSocket({
            vrchatAPI: api,
            eventsToListenTo: [EventType.All],
        });
        
        // Listening to friend online events
        ws.on(EventType.Friend_Online, (data: FriendOnline) => {
            console.log(`Friend ${data.user.displayName} is online at ${data.location}.`);
        });

    } catch (error) {
        if (error instanceof RequestError) {
            console.error(`Failed to login: ${error.message}`);
        } else {
            console.error(`An unexpected error occurred: ${error}`);
        }
    }
}
    */
import express from 'express';
const app = express();
const port = 8000;
app.use(express.json()); // Add this line to parse JSON request bodies

/**
 * 
 * @param username 
 * @returns token that newly inserted
 */
const updateTokenStore = (username: string) : string => {
    
    const fs = require('fs');
    const { v4: uuidv4 } = require('uuid');
    const tokenStorePath = './TokenStore.json';

    // Generate 32-character UUID token
    const token = uuidv4().replace(/-/g, '');

    // Read the existing token store
    let tokenStore: TokenStoreType = {};
    if (fs.existsSync(tokenStorePath)) {
        
        const fileContent = fs.readFileSync(tokenStorePath, 'utf8');
        if (fileContent) {
            tokenStore = JSON.parse(fileContent);
        }
    }

    // if already exist
    if(tokenStore[token]) return tokenStore[token];

    // Store new token
    tokenStore[token] = username;
    fs.writeFileSync(tokenStorePath, JSON.stringify(tokenStore, null, 2));

    return token;
}
const fetchUsername = (token: string) : string => {
    const fs = require('fs');
    const tokenStorePath = './TokenStore.json';
    if (fs.existsSync(tokenStorePath)) {
        const fileContent = fs.readFileSync(tokenStorePath, 'utf8');
        
        if (fileContent) {
            const tokenStore = JSON.parse(fileContent);
            return tokenStore[token]
        }
    }

    return ''
}
const isTokenValid = (username: string, token: string): boolean => {
    // return falsy
    if(!username || !token) return false;

    // TODO: here should check for username?
    // username : foo || 1=1 can pass this?
    return fetchUsername(token) === username;
}

const fetchCookie = (username: string) => {
    const cookiePath = './cookies.json';
    const fs = require('fs')

    if (fs.existsSync(cookiePath)) {
        const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'))
        return cookies[username];
    }

    return [];
};


const authVRC = async (req: express.Request, res: express.Response, options?: ConstructorParameters<typeof VRChatAPI>[0]) => {
    // check auth exist
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send('Authorization header missing');
        return;
    }

    // parse basic auth
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // get auth token
    try {
        const apiOptions = { username, password, userAgent: 'VRC_socket/1.0.2', useCookies: true, cookiePath: './cookies.json', ...options };
        const api = new VRChatAPI(apiOptions);
        await api.login();
        const token = updateTokenStore(username);

        res.json({
            status: '200',
            token: token
        })
    } catch (e) {
        if (e instanceof EmailOtpRequired) {
            res.json({
                status: '400',
                message: 'Requires EmailOTP code, Re-post with code'
            });
        } else if (e instanceof TOTPRequired) {
            res.json({
                status: '400',
                message: 'Requires TOTP code, Re-send with code'
            })
        } else {
            res.json({
                status: '500',
                message: 'invalid username/password'
            })
        }
    }
};
// accessing via http://localhost:8000/api/auth
app.get('/api/auth', async (req: express.Request, res: express.Response) => {
    try{
        authVRC(req, res);
    }catch(e){

    }
});
app.post('/api/auth/eotp', async (req: express.Request, res: express.Response) => {
    const code : number = req.body?.code;
    try{
        authVRC(req, res, {EmailOTPCode: code.toString()});
    }catch(e){

    }
})

app.get('/api/ws', async (req: express.Request, res: express.Response) => {
    const { token } = req.body
    const username = fetchUsername(token)
    console.log(username)
    console.log("Valid?: ", isTokenValid(username, token));
    if(!isTokenValid(username, token)){
        res.send({
            status: '401',
            message: 'invalid token or incorrect username'
        })
        return;
    }

    const cookie = fetchCookie(username)[0];

    try{
        const api = new VRChatAPI({TwoFactorAuthSecret: cookie?.twoFactorAuth, userAgent: 'VRC_socket/1.0.2', useCookies: true, cookiePath: './cookies.json'});
        await api.login()

        const ws = new VRCWebSocket({
            vrchatAPI: api,
            eventsToListenTo: [EventType.All],
            customURL: 'wss://vrc_socket_rorikoron_test'
        });

        ws.on(EventType.Friend_Online, (data: FriendLocation) => {
            console.log(`Friend ${data.user.displayName} is exist at ${data.location}.`);
        });

        ws.close()

    }catch(e){
        if(e instanceof CookiesExpired){
            res.send({
                status: '400',
                message: 'Cookies have expired. Please Login again.'
            })
        }
    }

    
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
import { Request, Response, Router } from "express";
import { authenticateAPI } from "../middlewares/authAPI";
import { VRChatAPI, TOTPRequired, EmailOtpRequired } from 'vrc-ts';
import vrcRouter from './vrc'

const router = Router();

// check if API has authenticated
router.use(authenticateAPI);

/**
 * @param options options for instanciating vrchat api.
 */
const authVRC = async (req: Request, res: Response, options?: ConstructorParameters<typeof VRChatAPI>[0]) => {
    const { username, password } = req.body

    // verify vrchat api.
    // storing verified api with session store(using redis)
    try {
        const apiOptions = { username, password, userAgent: 'VRC_socket/1.0.2', useCookies: true, cookiePath: './cookies.json', ...options };
        const api = new VRChatAPI(apiOptions);
        await api.login();

        req.session.verifiedAPI = api;
        res.status(200).json({
            message: "Logged in and saved session succesfully"
        })
    } catch (e) {
        if (e instanceof EmailOtpRequired) {
            res.status(200).json({
                status: 'eotp',
                message: 'Requires EmailOTP code, Re-send with the code'
            });
        } else if (e instanceof TOTPRequired) {
            res.status(200).json({
                status: 'totp',
                message: 'Requires TOTP code, Re-send with the code'
            })
        } else {
            res.status(500).json({
                message: 'invalid username/password'
            })
        }
    }
};

// accessing via http://localhost:8000/api/auth
router.get('/auth', async (req: Request, res: Response) => {
    try{
        authVRC(req, res);
    }catch(e){

    }
});
router.post('/auth/eotp', async (req: Request, res: Response) => {
    const code : number = req.body?.code;
    try{
        authVRC(req, res, {EmailOTPCode: code.toString()});
    }catch(e){

    }
})

router.use('/vrc', vrcRouter)

export default router;

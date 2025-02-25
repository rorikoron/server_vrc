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
            res.status(401).json({
                mfaType: 'eotp',
                message: 'Requires EmailOTP code, Re-send with the code'
            });
        } else if (e instanceof TOTPRequired) {
            res.status(401).json({
                mfaType: 'totp',
                message: 'Requires TOTP code, Re-send with the code'
            })
        } else {
            res.status(403).json({
                message: 'invalid username/password'
            })
        }
    }
};

// accessing via http://localhost:8000/api/auth
router.post('/auth', async (req: Request, res: Response) => {
    const { eotp, totp } = req.body;
    const option = eotp ? { EmailOTPCode: eotp } : totp ? { TOTPCode: totp } : {}; 

    try{
        authVRC(req, res, option);
    }catch(e){

    }
});

router.post('/auth/verify', async (req: Request, res: Response) => {
    try{
        if(req.session && req.session.verifiedAPI){
            res.status(200).json({
                message: 'API has verified'
            })
            return;
        }

        res.status(401).json({
            message: 'API has not verified'
        })
    }catch(e){
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
})

router.use('/vrc', vrcRouter)

export default router;

import { NextFunction, Request, Response } from "express";

export const authenticateVRC = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.session || !req.session.verifiedAPI){
        res.status(401).json({
            message: "Invalid credential. Auth with VRC first"
        })
        return;
    }

    // check if api can use
    // TODO: should this be applied?
    // should be considered (because it is similar to re-instanciate vrchat api once and once)
    if(!(await req.session.verifiedAPI.authApi.verifyAuthToken()).ok){
        req.session.verifiedAPI = null
        res.status(401).json({
            message: "Session expired! Please authenticate VRChat again."
        })
        return;
    }

    next();
}

export default authenticateVRC;
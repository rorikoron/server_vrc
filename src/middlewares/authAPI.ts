import { NextFunction, Request, Response } from "express";

export const authenticateAPI = (req: Request, res: Response, next: NextFunction) => {
    if(!req.session || !req.session.login){
        res.status(401).json({
            message: "Invalid Crendentials. Please authenticate first."
        })
        return;
    }
    next();
}
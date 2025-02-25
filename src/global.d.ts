import "express-session"
import { VRChatAPI } from "vrc-ts"

declare module "express-session" {
    interface SessionData {
        login: boolean,
        verifiedAPI: VRChatAPI | null
    }
}
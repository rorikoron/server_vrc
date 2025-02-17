import express from "express";
import authenticateVRC from '../middlewares/authVRC'
import { CookiesExpired, EventType, FriendLocation, VRCWebSocket } from "vrc-ts";
const router = express.Router();

// check if VRChat API has authenticated
router.use(authenticateVRC)

router.get('/ws', async (req: express.Request, res: express.Response) => {
    const api = req.session.verifiedAPI;

    try{
        
        const ws = new VRCWebSocket({
            vrchatAPI: api ?? undefined,
            eventsToListenTo: [EventType.All],
            customURL: 'wss://vrc_socket_rorikoron_proxy'
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

//fetch friend list
router.get('/friendlist', async (req: express.Request, res: express.Response) => {
    const api = req.session.verifiedAPI;
    const { n, offset } = req.body

    try{
        const list = await api!.friendApi.listFriends({n: n ?? 50, offset: offset ?? 0});

        res.status(200).json({
            data: list
        })
    }catch(e){
        if(e instanceof CookiesExpired){
            res.status(400).json({
                message: 'Cookies have expired. Please Login again.'
            })
        }
    }
})

export default router;
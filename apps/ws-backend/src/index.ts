import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client"



const wss = new WebSocketServer({ port: 8080 });


interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {  
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !(decoded as JwtPayload).userId) {
        return null;
    }
    return (decoded as JwtPayload).userId;
    } catch(e) {
        return null;
    }
    return null;
}

wss.on('connection', function connection(ws, request) {
    console.log("new connection")
});
wss.on('connection', function connection(ws, request) {
    const url = request.url;

    if(!url) {
        return;
    }
    
    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);
    
    if(userId == null) {
        ws.close();
        return;
    }

    users.push({
        userId, 
        rooms: [],
        ws
    })

    ws.on('message', async function connection(data) {
        let parsedData;
        if (typeof data !== "string") {
            parsedData =JSON.parse(data.toString());

        } else {
            parsedData = JSON.parse(data);
        }

        if(parsedData.type === "join_room") {
            const user = users.find(x => x.ws === ws);
            user?.rooms.push(parsedData.roomId);
        }

        if(parsedData.type === "leave_room") {
            const user = users.find(x => x.ws === ws);
            if(!user) {
                return;
            }
            user.rooms = user.rooms.filter(x => x !== parsedData.roomId);
        }

        if(parsedData.type === "chat") {
            const roomId = Number(parsedData.roomId);
            const message = parsedData.message;

            console.log("roomId", roomId);       // ✅ check if roomId is coming
            console.log("message", message);

            await prismaClient.chat.create({
                data: {
                    roomId,
                    message,
                    userId
                }
            })

            users.forEach(user => {
                if(user.rooms.includes(String(roomId))) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })
        }
    });
});
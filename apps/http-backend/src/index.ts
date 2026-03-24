import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common";
import { prismaClient } from "@repo/db/client";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors())


app.post("/signup", async (req, res) => {
    //db call
    const parsedData = CreateUserSchema.safeParse(req.body);
    if( !parsedData.success) {
        res.json({
            message: "Incorrect Credentials"
        })
        return;
    }

    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                //To do hash the password
                password: parsedData.data.password,
                photo: "",
                name: parsedData.data.name
            }
        })
    
        res.json({
            userId: user.id
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
    
})

app.post("/signin", async (req, res) => {

    const parsedData = SigninSchema.safeParse(req.body);
    if( !parsedData.success) {
        res.json({
            message: "Incorrect Credentials"
        })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    })

    if (!user) {
        res.status(403).json({
            message: "Not Authorized"
        })
        return;
    }

    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET);

    res.json({
        token
    })
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
  
    if (!parsedData.success) {
      res.json({
        message: "Incorrect Credentials"
      });
      return;
    }
  
    if (!req.userId) {
      res.status(403).json({
        message: "Unauthorized"
      });
      return;
    }
  
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
          data: {
            slug: parsedData.data.name,
            adminId: userId
          }
        });
      
        res.json({
          roomId: room.id
        });
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        });
    }
});

app.get("/chat/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);
    const message = await prismaClient.chat.findMany({
        where: {
            roomId: roomId,
        },
        orderBy: {
            id: "desc"
        },
        take: 50
    });

    res.json({
        message
    })
})


app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    res.json({
        room
    })
})
app.listen(3001);

//completed the backend now moving on to the front end time stamp of the vid 02:07:28 
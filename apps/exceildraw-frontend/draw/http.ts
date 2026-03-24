import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string ) {
    const res = await axios.get(`${HTTP_BACKEND}/chat/${roomId}`);
    const messages = res.data.message;
    console.log("messages from db", messages);
  
    const shapes = messages.map((x: {message: string}) => {
      const messageData = JSON.parse(x.message)
      console.log("messageData", messageData);
      return messageData.shape;
    })
  
    return shapes;
  }
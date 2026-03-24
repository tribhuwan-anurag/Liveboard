import { HTTP_BACKEND } from "@/config";
import axios from "axios";


type Shape = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
  type: "pencil",
  startX:  number,
  startY: number, 
  endX: number,
  endY: number
}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext("2d");

    let existingShapes: Shape[] = await getExistingShapes(roomId);
    if (!ctx) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if(message.type == "chat"){
        const parsedShape = JSON.parse(message.message)
        existingShapes.push(parsedShape.shape)
        clearCanvas(existingShapes, canvas, ctx)
      }
    }


    clearCanvas(existingShapes, canvas, ctx)
    let clicked = false;
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      clicked = true;
      startX = e.clientX;
      startY = e.clientY;
    };
    

    const handleMouseUp = (e: MouseEvent) => {
      clicked = false;
      const width = e.clientX - startX;
      const height = e.clientY - startY;
  
      //@ts-ignore
      const selectedTool = window.selectedTool;
      let shape: Shape | null = null; // ✅ use let
  
      if (selectedTool === "rect") {
          shape = { // ✅ assign to outer shape
              type: "rect",
              x: startX,
              y: startY,
              height,
              width
          };
      } else if (selectedTool === "circle") { // ✅ fixed typo
          const radius = Math.max(width, height) / 2;
          shape = { // ✅ assign to outer shape
              type: "circle",
              radius,
              centerX: startX + radius,
              centerY: startY + radius,
          };
      }
  
      if (!shape) return;
  
      existingShapes.push(shape); // ✅ push only once
  
      socket.send(JSON.stringify({
          type: "chat",
          roomId,
          message: JSON.stringify({ shape })
      }));
  };
    const handleMouseMove = (e: MouseEvent) => {
      if (clicked) {
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        clearCanvas(existingShapes, canvas, ctx);

        ctx.fillStyle = "black";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        //@ts-ignore
        const selectedTool = window.selectedTool;
        if (selectedTool === "rect"){
           ctx.strokeRect(startX, startY, width, height);
        } else if(selectedTool === "circle") {
          const centerX = startX + width / 2;
          const centerY = startY + height / 2;
          const radius = Math.max(width, height) / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.closePath();
        }
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // fix 1: actually fill the background

    existingShapes.map((shape) => {
        if(shape.type === "rect") {
            ctx.strokeStyle = "white"; // fix 2: rgba(255,255,255,255) is invalid, alpha must be 0-1
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height); 
        } else if (shape.type === "circle") {
          ctx.beginPath();
          ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.closePath();
        }
    })
}

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
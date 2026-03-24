import { getExistingShapes } from ".";
import { Tool } from "@/components/Canvas";

type Shapes = {
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
    points: { x: number, y: number }[]
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shapes[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private pencilPoints: { x: number, y: number }[] = [];
    private handleMouseDown!: (e: MouseEvent) => void;
    private handleMouseUp!: (e: MouseEvent) => void;
    private handleMouseMove!: (e: MouseEvent) => void;

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    setTool(tool: "circle" | "pencil" | "rect") {
        this.selectedTool = tool;
        this.clearCanvas();
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if(message.type == "chat"){
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.map((shape) => {
            if(shape.type === "rect") {
                this.ctx.strokeStyle = "white";
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height); 
            } else if (shape.type === "circle") {
                this.ctx.strokeStyle = "white";
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "pencil") { // ✅ added pencil
                this.drawPencil(shape.points);
            }
        })
    }

    drawPencil(points: { x: number, y: number }[]) { // ✅ added drawPencil
        this.ctx.beginPath();
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;
        points.forEach((point, index) => {
            if (index === 0) this.ctx.moveTo(point.x, point.y);
            else this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.stroke();
        this.ctx.closePath();
    }

    initMouseHandlers() {
        this.handleMouseDown = (e: MouseEvent) => {
            this.clicked = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.pencilPoints = [{ x: e.clientX, y: e.clientY }];
        };

        this.handleMouseUp = (e: MouseEvent) => {
            this.clicked = false;
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;

            const selectedTool = this.selectedTool;
            let shape: Shapes | null = null;

            if (selectedTool === "rect") {
                shape = {
                    type: "rect",
                    x: this.startX,
                    y: this.startY,
                    height,
                    width
                };
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                shape = {
                    type: "circle",
                    radius,
                    centerX: this.startX + width / 2,
                    centerY: this.startY + height / 2,
                }; // ✅ correctly closed
            } else if (selectedTool === "pencil") { // ✅ correctly outside circle block
                shape = {
                    type: "pencil",
                    points: this.pencilPoints
                };
            }

            if (!shape) return;

            this.existingShapes.push(shape);

            this.socket.send(JSON.stringify({
                type: "chat",
                roomId: this.roomId,
                message: JSON.stringify({ shape })
            }));
        };

        this.handleMouseMove = (e: MouseEvent) => {
            if (this.clicked) {
                const width = e.clientX - this.startX;
                const height = e.clientY - this.startY;
                this.clearCanvas();

                this.ctx.fillStyle = "black";
                this.ctx.strokeStyle = "white";
                this.ctx.lineWidth = 2;

                const selectedTool = this.selectedTool;
                if (selectedTool === "rect") {
                    this.ctx.strokeRect(this.startX, this.startY, width, height);
                } else if (selectedTool === "circle") {
                    const centerX = this.startX + width / 2;
                    const centerY = this.startY + height / 2;
                    const radius = Math.max(width, height) / 2;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                } else if (selectedTool === "pencil") { // ✅ added pencil
                    this.pencilPoints.push({ x: e.clientX, y: e.clientY });
                    this.clearCanvas();
                    this.drawPencil(this.pencilPoints);
                }
            }
        };

        this.canvas.addEventListener("mousedown", this.handleMouseDown);
        this.canvas.addEventListener("mouseup", this.handleMouseUp);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.handleMouseDown);
        this.canvas.removeEventListener("mouseup", this.handleMouseUp);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    }
}
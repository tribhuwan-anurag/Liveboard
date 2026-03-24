"use client";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontal } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "circle" | "rect" | "pencil";

export function Canvas({
    roomId,
    socket
}: {
    roomId: string; // ✅ close the type here
    socket: WebSocket
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>()
    const [selectedTool, setSelectedTool] = useState<Tool>("circle")

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool])

    useEffect(() => {
        if (!canvasRef.current) return;        
        const g =new Game(canvasRef.current, roomId, socket);
        g.setTool(selectedTool);
        setGame(g);

        return () => {
            g.destroy(); // ✅ cleanup old game on re-render
        };
    }, [roomId, socket]);

    return <div style={{
        height: "100vh",
        overflow: "hidden",
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
       <TopBar setSelectedTool={setSelectedTool} selectedTool={selectedTool}/>
    </div>
}

function TopBar ({selectedTool, setSelectedTool} : {
    selectedTool : Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return <div style={{
        position: "fixed",
        top: 10,
        left: 10
    }}>
        <div className="flex gap-4">
            <IconButton 
                onClick={() => {
                setSelectedTool("pencil")
                }} 
                activated={selectedTool === "pencil"} 
                icon={<Pencil />}></IconButton>
            <IconButton 
                onClick={() => {
                setSelectedTool("rect")
                }} 
                activated={selectedTool === "rect"} 
                icon={<RectangleHorizontal />}></IconButton>
            <IconButton 
                onClick={() => {
                setSelectedTool("circle")
                }} 
                activated={selectedTool === "circle"} 
                icon={<Circle />}>
            </IconButton>
        </div>


    </div> 
}
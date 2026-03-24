"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOTA3NmZlOC00MzhjLTQ3NzgtYmFiNi1kMDFlMzhjNDAyNjMiLCJpYXQiOjE3NzQyMjc1OTZ9.MsfIttwuBPLNHbgMR8bwoPhnSCDVmgOzTv6gF8RqFnI`);

        ws.onopen = () => {
          console.log("ws opened");
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }));
        };
        ws.onerror = (e) => console.log("ws error", e);
        ws.onclose = (e) => console.log("ws closed", e.code, e.reason);
        

        // ❌ remove the cleanup - don't close socket
        // return () => ws.close(); 

    }, []);

    if (!socket) {
        return <div>Connecting to server ...</div>;
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} />
        </div>
    );
}
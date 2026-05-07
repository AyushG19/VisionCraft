"use client";

import { useRef } from "react";
import { env } from "../../config";
import { SendPropsType } from "../types";
import { useError, useSocketContext } from "@repo/hooks";
import { ServerSocketData, ServerSocketDataType } from "@repo/common";

export function useCanvasSocket(
  onMessage: (event: ServerSocketDataType) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const { setInRoom } = useSocketContext();
  const { setError } = useError();

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000;

  const send = (
    type: SendPropsType["type"],
    payload: SendPropsType["payload"],
  ): void => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready, message not sent:", type);
      return;
    }

    const message = JSON.stringify({ type, payload });
    wsRef.current.send(message);
  };

  const disconnect = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket reference not found");
      return;
    }
    try {
      wsRef.current.send(JSON.stringify({ type: "LEAVE_ROOM" }));
    } catch (error: any) {
      setError({ code: "VALIDATION_ERROR", message: error?.message });
    }
  };

  const connect = (roomId: string, slug: string, token: string) => {
    const wsUrl = `${env.WS_BACKEND_URL}?roomId=${encodeURIComponent(roomId)}&slug=${slug}&token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✓ WebSocket connected");
      reconnectAttemptsRef.current = 0;
      // Join the room
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
        }),
      );
      setInRoom(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const validatedData = ServerSocketData.safeParse(data);

      if (validatedData.success) {
        onMessage(validatedData.data);
      } else {
        setError({
          code: "VALIDATION_ERROR",
          message: "Invalid Data type from socket.",
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError({
        code: "NETWORK_ERROR",
        message: "Error in Websocket,RETRY",
      });
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      wsRef.current = null;
      setInRoom(false);

      // Attempt reconnection if not a clean close
      if (
        !event.wasClean &&
        reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
      ) {
        reconnectAttemptsRef.current++;
        console.log(
          `Reconnecting... (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`,
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          connect(roomId, slug, token);
        }, RECONNECT_DELAY);
      }
    };
  };

  // useEffect(() => {
  //   if (!roomId || !slug || !token) {
  //     // console.error(
  //     //   "Cannot connect: missing token, roomId or slug",
  //     //   roomId,
  //     //   slug,
  //     //   token,
  //     // );
  //     return;
  //   }

  //   // Cleanup
  //   return () => {
  //     if (reconnectTimeoutRef.current) {
  //       clearTimeout(reconnectTimeoutRef.current);
  //     }

  //     if (wsRef.current) {
  //       // Send leave message before closing
  //       if (wsRef.current.readyState === WebSocket.OPEN) {
  //         wsRef.current.send(
  //           JSON.stringify({
  //             type: "LEAVE_ROOM",
  //           }),
  //         );
  //       }
  //       wsRef.current.close(1000, "Component unmounting");
  //     }
  //   };
  // }, [roomId, slug, token]);

  return { send, disconnect, connect };
}

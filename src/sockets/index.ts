import { Server, Socket } from 'socket.io';
import * as http from "http";
import { logger } from './logger';

export let io: Server | null = null;
export let counter = 0;

export const clients = new Map<string, Socket[]>();

export const socketio = async (server: http.Server) => {
  try {
    // Socket communication
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: false
      },
      pingInterval: 10000,
      pingTimeout: 2000
    });

    io.on("connection", (socket) => {
      console.log(" --> ADD SOCKET", counter);
      counter++;
      io && io.emit("connectionUpdated", counter);
      socket.on("disconnect", () => {
        console.log(" --> REMOVE SOCKET", counter);
        counter--;
        io && io.emit("connectionUpdated", counter);
      });
      socket.on("message", (message) => {
        const { action, subs } = JSON.parse(message);

        if (action === 'SubAdd') {
          subs.forEach((symbol) => {
            console.log(`Subscribing to ${symbol}`);
            if (!clients.has(symbol)) {
              clients.set(symbol, []);
            }
            clients.get(symbol).push(socket);
          });
        }

        if (action === 'SubRemove') {
          subs.forEach((symbol) => {
            console.log(`Unsubscribing from ${symbol}`);
            if (clients.has(symbol)) {
              const clientList = clients.get(symbol);
              const index = clientList.indexOf(socket);
              if (index !== -1) {
                clientList.splice(index, 1);
              }
              if (clientList.length === 0) {
                clients.delete(symbol);
              }
            }
          });
        }
      })
      socket.on("close", () => {
        console.log('Client disconnected');
        // Remove the client from all subscriptions
        clients.forEach((clientList, symbol) => {
            const index = clientList.indexOf(socket);
            if (index !== -1) {
                clientList.splice(index, 1);
                if (clientList.length === 0) {
                    clients.delete(symbol);
                }
            }
        });
      })
    });

    logger.info('  Socket server is running');
  } catch (err) {
    logger.error('  Socket server run failed');
    console.error(err);
  }
};

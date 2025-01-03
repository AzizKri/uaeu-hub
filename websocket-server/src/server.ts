import { WebSocketServer } from 'ws';
import { addClient, removeClient } from './clients';
import { handleIncomingMessage } from './messageHandler';
import { getUserIdFromDatabase, validateSignature } from './util';
require('dotenv').config();

const PORT = process.env.PORT || 8000;
const SECRET_KEY = process.env.WS_SECRET_KEY as string;
const wss = new WebSocketServer({ port: Number(PORT) });

console.log(`WebSocket server started on port ${PORT}`)

wss.on('connection', async (ws, req) => {
    console.log('Incoming connection')
    const urlParams = new URL('http://localhost:8000' + req.url!).searchParams;
    const uuid = urlParams.get("uuid");
    const signature = urlParams.get("signature");
    const timestamp = urlParams.get("timestamp");
    const nonce = urlParams.get("nonce");

    try {
        // Send URL to Signature validation
        if (!uuid || !signature || !timestamp || !nonce || !await validateSignature(uuid, timestamp, nonce, signature, SECRET_KEY)) {
            ws.close();
            console.log('Invalid signature');
            return;
        }

        // Connection valid, get user ID from Backend
        console.log('Client connected')
        const userId = await getUserIdFromDatabase(uuid);
        if (!userId) {
            ws.close();
            console.log('Websocket entry not found on DB');
            return;
        }

        // Add the client to the clients map
        const clientId = addClient(ws, userId);

        // Handle messages from the client
        ws.on('message', (message: any) => {
            console.log(`Received message from client ${clientId}: ${message}`)
            handleIncomingMessage(clientId, message.toString());
        })

        // Handle client disconnection
        ws.on('close', () => {
            console.log(`Client ${clientId} disconnected`)
            removeClient(clientId);
        })
    } catch (e) {
        console.error(e);
        ws.close();
    }
})


import express from 'express';
import WebSocket from 'ws';
import { addClient, getClientByUserId, removeClient } from './clients';
import { handleIncomingMessage } from './messageHandler';
import { getUserIdFromDatabase, validateSignature } from './util';
import bodyParser from 'body-parser';

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const SECRET_KEY = process.env.WS_SECRET_KEY as string;

app.use(bodyParser.json());

const wss = new WebSocket.Server({ noServer: true });

app.post('/notify', (req, res) => {
    console.log('Incoming notification request');
    const { action, senderId, receiverId, entityId, entityType, message } = req.body;

    if (!action || !receiverId) {
        console.log('Missing required fields');
        res.status(400).send('Missing required fields');
        return;
    }

    console.log(`Sending notification to client ${receiverId}`);
    const ws = getClientByUserId(receiverId);
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('Client is connected');
        ws.send(
            JSON.stringify({
                type: 'notification',
                payload: { message, senderId, entityId, entityType, action }
            })
        );
        res.status(200).send('Notification sent');
        return;
    } else {
        console.warn(`Client ${receiverId} is not connected`);
        res.status(404).send('Client not connected');
        return;
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

wss.on('connection', async (ws, req) => {
    console.log('Incoming connection');
    const urlParams = new URL('http://localhost:8000' + req.url!).searchParams;
    const uuid = urlParams.get('uuid');
    const signature = urlParams.get('signature');
    const timestamp = urlParams.get('timestamp');
    const nonce = urlParams.get('nonce');

    try {
        // Send URL to Signature validation
        if (!uuid || !signature || !timestamp || !nonce || !await validateSignature(uuid, timestamp, nonce, signature, SECRET_KEY)) {
            ws.close();
            console.log('Invalid signature');
            return;
        }

        // Connection valid, get user ID from Backend
        console.log('Client connected');
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
            console.log(`Received message from client ${clientId}: ${message}`);
            handleIncomingMessage(clientId, message.toString());
        });

        // Handle client disconnection
        ws.on('close', () => {
            console.log(`Client ${clientId} disconnected`);
            removeClient(clientId);
        });
    } catch (e) {
        console.error(e);
        ws.close();
    }
});


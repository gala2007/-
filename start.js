
const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { writeFileSync } = require('fs');
const path = require('path');
const P = require('pino');

// Load environment variables
require('dotenv').config();

// Authentication setup
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

const startBot = () => {
    const sock = makeWASocket({
        logger: P({ level: 'info' }),
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('creds.update', saveState);

    // Listening for messages
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        
        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];

        console.log(`Received message type: ${type} from: ${from}`);

        // Example: Replying to text messages
        if (type === 'conversation') {
            const text = msg.message.conversation;
            if (text.toLowerCase() === 'hi') {
                await sock.sendMessage(from, { text: 'Hello from ╰‿╯ＧＡＬＡＸ╰‿╯ Bot!' });
            }
        }

        // Media download example
        if (type === 'imageMessage') {
            const buffer = await sock.downloadMediaMessage(msg);
            const filePath = path.join(__dirname, 'downloads', `${Date.now()}.jpg`);
            writeFileSync(filePath, buffer);
            console.log(`Media downloaded to ${filePath}`);
        }
    });
};

startBot();

const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");

const app = express();

// Serve static files (Three.js client)
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static('public'));
// Serve Monaco Editor correctly
app.use('/monaco', express.static(path.join(__dirname, 'node_modules', 'monaco-editor', 'min'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));


// Load SSL Certificate from Let's Encrypt
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/yeetcode.live/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/yeetcode.live/fullchain.pem"),
};

const server = https.createServer(options, app);
const PORT = 443;

server.listen(PORT, () => {
  console.log(`🚀 HTTPS Server running at https://yeetcode.live`);
});


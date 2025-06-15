const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${pathname}`);
    
    if (pathname.endsWith('.html')) {
        if (pathname === '/index.html') {
            serveIndexPage(res);
        } else {
            serve404Page(res);
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - This server only serves HTML files. Try /index.html');
    }
});

function serveIndexPage(res) {
    const filePath = path.join(__dirname, 'public', 'index.html');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading index.html:', err.message);
            serve404Page(res);
            return;
        }
        
        res.writeHead(200, { 
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    });
}

function serve404Page(res) {
    const notFoundPath = path.join(__dirname, 'public', '404.html');
    
    fs.readFile(notFoundPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error loading 404.html:', err.message);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - Page Not Found (and 404.html is missing!)');
            return;
        }
        
        res.writeHead(404, { 
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    });
}

server.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Visit: http://localhost:${PORT}/index.html`);
    console.log('Press Ctrl+C to stop the server');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try a different port.`);
    } else {
        console.error('Server error:', err.message);
    }
});
const http = require('http');
const url = require('url');
const ItemController = require('./controllers/itemController');

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;

    console.log(`${new Date().toLocaleTimeString()} - ${method} ${pathname}`);

    if (method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    if (pathname === '/api/items') {
        if (method === 'POST') {
            await ItemController.createItem(req, res);
        } else if (method === 'GET') {
            await ItemController.getAllItems(req, res);
        } else {
            sendMethodNotAllowed(res, method, pathname);
        }
    } 
    else if (pathname.startsWith('/api/items/')) {
        const pathParts = pathname.split('/');
        const itemId = pathParts[3];
        
        if (!itemId || itemId.trim() === '') {
            sendBadRequest(res, 'Item ID is required');
            return;
        }
        
        if (method === 'GET') {
            await ItemController.getOneItem(req, res, itemId);
        } else if (method === 'PUT') {
            await ItemController.updateItem(req, res, itemId);
        } else if (method === 'DELETE') {
            await ItemController.deleteItem(req, res, itemId);
        } else {
            sendMethodNotAllowed(res, method, pathname);
        }
    } 
    else if (pathname === '/') {
        sendApiInfo(res);
    }
    else {
        sendNotFound(res, pathname);
    }
});

function sendApiInfo(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: true,
        message: 'Inventory Management API',
        version: '1.0.0',
        endpoints: {
            'POST /api/items': 'Create a new item',
            'GET /api/items': 'Get all items',
            'GET /api/items/:id': 'Get item by ID',
            'PUT /api/items/:id': 'Update item by ID',
            'DELETE /api/items/:id': 'Delete item by ID'
        },
        data: null
    }, null, 2));
}

function sendNotFound(res, pathname) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: false,
        message: 'API endpoint not found',
        errors: [`The endpoint '${pathname}' does not exist`],
        data: null
    }, null, 2));
}

function sendMethodNotAllowed(res, method, pathname) {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: false,
        message: 'Method not allowed',
        errors: [`${method} method is not supported for ${pathname}`],
        data: null
    }, null, 2));
}

function sendBadRequest(res, message) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: false,
        message: 'Bad request',
        errors: [message],
        data: null
    }, null, 2));
}

server.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log('API Endpoints:');
    console.log('  GET    /                     - API information');
    console.log('  POST   /api/items            - Create new item');
    console.log('  GET    /api/items            - Get all items');
    console.log('  GET    /api/items/:id        - Get item by ID');
    console.log('  PUT    /api/items/:id        - Update item by ID');
    console.log('  DELETE /api/items/:id        - Delete item by ID');
    console.log('Press Ctrl+C to stop the server');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop other servers or change PORT.`);
    } else {
        console.error('Server error:', err.message);
    }
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed successfully');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed successfully');
        process.exit(0);
    });
});
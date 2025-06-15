const Item = require('../models/item');
const FileHelper = require('../utils/fileHelper');

class ItemController {
    
    static async createItem(req, res) {
        try {
            const itemData = await ItemController.parseRequestBody(req);
            
            const validationErrors = Item.validate(itemData);
            if (validationErrors.length > 0) {
                return ItemController.sendResponse(res, 400, {
                    success: false,
                    message: 'Item validation failed',
                    errors: validationErrors,
                    data: null
                });
            }

            const existingItems = await FileHelper.readItems();
            const newItem = new Item(itemData.name, itemData.price, itemData.size);
            existingItems.push(newItem);
            await FileHelper.writeItems(existingItems);

            ItemController.sendResponse(res, 201, {
                success: true,
                message: 'Item created successfully',
                errors: null,
                data: newItem.toJSON()
            });

        } catch (error) {
            ItemController.handleServerError(res, error);
        }
    }

    static async getAllItems(req, res) {
        try {
            const items = await FileHelper.readItems();
            
            ItemController.sendResponse(res, 200, {
                success: true,
                message: `Retrieved ${items.length} items successfully`,
                errors: null,
                data: items
            });

        } catch (error) {
            ItemController.handleServerError(res, error);
        }
    }

    static async getOneItem(req, res, itemId) {
        try {
            const items = await FileHelper.readItems();
            const foundItem = items.find(item => item.id === itemId);

            if (!foundItem) {
                return ItemController.sendResponse(res, 404, {
                    success: false,
                    message: 'Item not found',
                    errors: [`No item found with ID: ${itemId}`],
                    data: null
                });
            }

            ItemController.sendResponse(res, 200, {
                success: true,
                message: 'Item retrieved successfully',
                errors: null,
                data: foundItem
            });

        } catch (error) {
            ItemController.handleServerError(res, error);
        }
    }

    static async updateItem(req, res, itemId) {
        try {
            const updateData = await ItemController.parseRequestBody(req);
            
            const validationErrors = Item.validate(updateData);
            if (validationErrors.length > 0) {
                return ItemController.sendResponse(res, 400, {
                    success: false,
                    message: 'Update validation failed',
                    errors: validationErrors,
                    data: null
                });
            }

            const items = await FileHelper.readItems();
            const itemIndex = items.findIndex(item => item.id === itemId);

            if (itemIndex === -1) {
                return ItemController.sendResponse(res, 404, {
                    success: false,
                    message: 'Item not found',
                    errors: [`No item found with ID: ${itemId}`],
                    data: null
                });
            }

            const item = items[itemIndex];
            item.name = updateData.name.trim();
            item.price = parseFloat(updateData.price);
            item.size = updateData.size.toLowerCase().trim();
            item.updatedAt = new Date().toISOString();

            await FileHelper.writeItems(items);

            ItemController.sendResponse(res, 200, {
                success: true,
                message: 'Item updated successfully',
                errors: null,
                data: item
            });

        } catch (error) {
            ItemController.handleServerError(res, error);
        }
    }

    static async deleteItem(req, res, itemId) {
        try {
            const items = await FileHelper.readItems();
            const itemIndex = items.findIndex(item => item.id === itemId);

            if (itemIndex === -1) {
                return ItemController.sendResponse(res, 404, {
                    success: false,
                    message: 'Item not found',
                    errors: [`No item found with ID: ${itemId}`],
                    data: null
                });
            }

            const deletedItem = items.splice(itemIndex, 1)[0];
            await FileHelper.writeItems(items);

            ItemController.sendResponse(res, 200, {
                success: true,
                message: 'Item deleted successfully',
                errors: null,
                data: deletedItem
            });

        } catch (error) {
            ItemController.handleServerError(res, error);
        }
    }

    static parseRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    if (body.trim() === '') {
                        reject(new Error('Request body is empty'));
                        return;
                    }
                    const parsed = JSON.parse(body);
                    resolve(parsed);
                } catch (error) {
                    reject(new Error('Invalid JSON in request body'));
                }
            });
            
            req.on('error', (error) => {
                reject(error);
            });
        });
    }

    static sendResponse(res, statusCode, responseData) {
        res.writeHead(statusCode, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end(JSON.stringify(responseData, null, 2));
    }

    static handleServerError(res, error) {
        console.error('Internal Server Error:', error);
        ItemController.sendResponse(res, 500, {
            success: false,
            message: 'Internal server error',
            errors: [error.message],
            data: null
        });
    }
}

module.exports = ItemController;
class Item {
    constructor(name, price, size, id = null) {
        this.id = id || this.generateId();
        this.name = name.trim();
        this.price = parseFloat(price);
        this.size = size.toLowerCase().trim();
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    // Generate a unique ID for each item
    generateId() {
        const timestamp = Date.now().toString();
        const randomPart = Math.random().toString(36).substr(2, 5);
        return `item_${timestamp}_${randomPart}`;
    }

    // Update this item's data
    update(name, price, size) {
        this.name = name.trim();
        this.price = parseFloat(price);
        this.size = size.toLowerCase().trim();
        this.updatedAt = new Date().toISOString();
    }

    // Check if size is valid (s, m, or l only)
    static isValidSize(size) {
        const validSizes = ['s', 'm', 'l'];
        return validSizes.includes(size.toLowerCase().trim());
    }

    // Validate item data before creating/updating
    static validate(itemData) {
        const errors = [];

        // Validate name
        if (!itemData.name || typeof itemData.name !== 'string') {
            errors.push('Name is required and must be a string');
        } else if (itemData.name.trim().length === 0) {
            errors.push('Name cannot be empty or just whitespace');
        } else if (itemData.name.trim().length > 100) {
            errors.push('Name must be 100 characters or less');
        }

        // Validate price
        if (itemData.price === undefined || itemData.price === null) {
            errors.push('Price is required');
        } else if (typeof itemData.price !== 'number') {
            errors.push('Price must be a number');
        } else if (itemData.price <= 0) {
            errors.push('Price must be greater than 0');
        } else if (itemData.price > 999999.99) {
            errors.push('Price must be less than $1,000,000');
        }

        // Validate size
        if (!itemData.size || typeof itemData.size !== 'string') {
            errors.push('Size is required and must be a string');
        } else if (!this.isValidSize(itemData.size)) {
            errors.push('Size must be "s" (small), "m" (medium), or "l" (large)');
        }

        return errors;
    }

    // Convert item to a clean object for JSON response
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
            size: this.size,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Item;
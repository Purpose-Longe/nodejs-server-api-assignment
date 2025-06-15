const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/items.json');

class FileHelper {
    static async readItems() {
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8');
            const items = JSON.parse(data);
            return items;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    static async writeItems(items) {
        try {
            const jsonData = JSON.stringify(items, null, 2);
            await fs.writeFile(DATA_FILE, jsonData, 'utf8');
        } catch (error) {
            throw error;
        }
    }

    static async fileExists() {
        try {
            await fs.access(DATA_FILE);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = FileHelper;
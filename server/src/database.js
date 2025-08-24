const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'app.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

class Database {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const createApiKeysTable = `
                CREATE TABLE IF NOT EXISTS api_keys (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    username TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    signature TEXT NOT NULL,
                    environment TEXT NOT NULL DEFAULT 'sandbox',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.run(createApiKeysTable, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('API keys table created or already exists');
                    resolve();
                }
            });
        });
    }

    async saveApiKey(name, username, password, signature, environment = 'sandbox') {
        return new Promise(async (resolve, reject) => {
            try {
                // Hash the password for security
                const passwordHash = await bcrypt.hash(password, 10);
                
                const sql = `
                    INSERT INTO api_keys (name, username, password_hash, signature, environment)
                    VALUES (?, ?, ?, ?, ?)
                `;
                
                this.db.run(sql, [name, username, passwordHash, signature, environment], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, name, username, signature, environment });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async getApiKeys() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, name, username, signature, environment, created_at, updated_at
                FROM api_keys
                ORDER BY created_at DESC
            `;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getApiKeyById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, name, username, password_hash, signature, environment, created_at, updated_at
                FROM api_keys
                WHERE id = ?
            `;
            
            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getDecryptedApiKey(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const apiKey = await this.getApiKeyById(id);
                if (!apiKey) {
                    resolve(null);
                    return;
                }

                // For this implementation, we'll return the key info without the actual password
                // The password hash will be used for verification, not decryption
                resolve({
                    id: apiKey.id,
                    name: apiKey.name,
                    username: apiKey.username,
                    signature: apiKey.signature,
                    environment: apiKey.environment,
                    // Note: We don't return the actual password for security
                    // The calling code should use verifyApiKeyPassword if needed
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async verifyApiKeyPassword(id, password) {
        return new Promise(async (resolve, reject) => {
            try {
                const apiKey = await this.getApiKeyById(id);
                if (!apiKey) {
                    resolve(false);
                    return;
                }

                const isValid = await bcrypt.compare(password, apiKey.password_hash);
                if (isValid) {
                    resolve({
                        username: apiKey.username,
                        password: password, // Return the original password for API calls
                        signature: apiKey.signature,
                        environment: apiKey.environment
                    });
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async updateApiKey(id, name, username, password, signature, environment) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql, params;
                
                if (password) {
                    // Update with new password
                    const passwordHash = await bcrypt.hash(password, 10);
                    sql = `
                        UPDATE api_keys 
                        SET name = ?, username = ?, password_hash = ?, signature = ?, environment = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `;
                    params = [name, username, passwordHash, signature, environment, id];
                } else {
                    // Update without changing password
                    sql = `
                        UPDATE api_keys 
                        SET name = ?, username = ?, signature = ?, environment = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `;
                    params = [name, username, signature, environment, id];
                }
                
                this.db.run(sql, params, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, name, username, signature, environment, changes: this.changes });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async deleteApiKey(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM api_keys WHERE id = ?`;
            
            this.db.run(sql, [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ deleted: this.changes > 0, changes: this.changes });
                }
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

// Create singleton instance
const database = new Database();

module.exports = database;
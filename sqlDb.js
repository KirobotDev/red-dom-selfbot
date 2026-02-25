const mysql = require('mysql2/promise');
const chalk = require('chalk');
const { getDbConfig } = require('./config/dbConfig');

class SQLDatabase {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.columnCache = new Set();
    }

    async connect() {
        try {
            const dbConfig = getDbConfig();
            
            if (!dbConfig || !dbConfig.host) {
                console.error(chalk.red('❌ dbConfig pas encore chargé'));
                return false;
            }
            
            this.connection = await mysql.createConnection(dbConfig);
            this.isConnected = true; 
            
            await this.loadColumnCache();
            return true;
            
        } catch (error) {
            console.error(chalk.red('❌ Erreur connexion SQL:'), error.message);
            return false;
        }
    }

    async loadColumnCache() {
        try {
            const [rows] = await this.connection.execute('DESCRIBE user_settings');
            this.columnCache = new Set(rows.map(row => row.Field)); 
        } catch (error) {
            console.error(chalk.red('❌ Erreur chargement cache colonnes:'), error.message);
        }
    }

    async ensureColumnExists(columnName) {
        if (this.columnCache.has(columnName)) {
            return true;
        }

        try {
            let columnType = 'VARCHAR(255)';
            
            if (columnName === 'created_at' || columnName === 'updated_at') {
                columnType = 'DATETIME DEFAULT CURRENT_TIMESTAMP';
            } else if (columnName.includes('time') || columnName.includes('timestamp')) {
                columnType = 'BIGINT';
            } else if (columnName === 'auto_delete' || columnName.includes('mute') || 
                       columnName.includes('deaf') || columnName.includes('webcam') || 
                       columnName.includes('stream') || columnName === 'noaddgrp' ||
                       columnName === 'rpconoff' || columnName === 'voicestream' ||
                       columnName === 'clear' || columnName === 'voicewebcam' ||
                       columnName === 'voicemute' || columnName === 'voicedeaf') {
                columnType = 'BOOLEAN DEFAULT FALSE';
            } else if (columnName === 'prefix') {
                columnType = 'VARCHAR(100) DEFAULT "&"';
            } else if (columnName === 'langue') {
                columnType = 'VARCHAR(10) DEFAULT "fr"';
            } else if (columnName === 'status') {
                columnType = 'VARCHAR(50) DEFAULT "dnd"';
            } else if (columnName === 'time' || columnName === 'clearDelay') {
                columnType = 'INT DEFAULT 60000';
            } else if (columnName.includes('party')) {
                columnType = 'INT DEFAULT 1';
            } else if (columnName === 'spotifyonoff') {
                columnType = 'VARCHAR(10) DEFAULT "off"';
            } else if (columnName === 'afk') {
                     columnType = 'TINYINT(1) DEFAULT 0';
            } else if (columnName === 'afkmessage') {
                     columnType = 'VARCHAR(500) NULL';
            } else if (columnName === 'afkwebhook') {
                     columnType = 'VARCHAR(500) NULL';
            } else if (columnName === 'noaddgrptext' || columnName === 'webhooklogs' ||
                       columnName === 'voiceconnect' || columnName === 'rpcsmallimagetext' ||
                       columnName === 'buttontext2' || columnName === 'buttonlink2' ||
                       columnName === 'streaming' || columnName === 'spotifyendtimestamp' ||
                       columnName === 'spotifysongid' || columnName === 'spotifyalbumid' ||
                       columnName === 'spotifystates' || columnName === 'twitch' ||
                       columnName === 'rpctitle' || columnName === 'rpcdetails' ||
                       columnName === 'rpcstate' || columnName === 'rpctype' ||
                       columnName === 'rpclargeimage' || columnName === 'rpclargeimagetext' ||
                       columnName === 'rpcsmallimage' || columnName === 'appid' ||
                       columnName === 'buttontext1' || columnName === 'buttonlink1' ||
                       columnName === 'rpctime' || columnName === 'spotifylargeimage' ||
                       columnName === 'spotifysmallimage' || columnName === 'spotifysongname' ||
                       columnName === 'spotifyartists' || columnName === 'spotifyalbumname' ||
                       columnName === 'botname' || columnName === 'rpcplatform' ||
                       columnName === 'theme' || columnName === 'emoji' ||
                       columnName === 'spotifyalbum' || columnName === 'spotifydetails' ||
                       columnName === 'aboutme' || columnName === 'hype' ||
                       columnName === 'rpcemoji' || columnName === 'rpctextstatus') {
                columnType = 'VARCHAR(500) NULL';
            }

            const query = `ALTER TABLE user_settings ADD COLUMN \`${columnName}\` ${columnType}`;
            await this.connection.execute(query);
            
            this.columnCache.add(columnName);
            return true;
            
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                this.columnCache.add(columnName);
                return true;
            }
            console.error(chalk.red(`❌ Erreur ajout colonne ${columnName}:`), error.message);
            return false;
        }
    }

    async ensureConnection() {
        if (!this.isConnected || !this.connection) {
            await this.connect();
        }
        return this.isConnected;
    }

    async getUserData(userId) {
        try {
            const connected = await this.ensureConnection();
            if (!connected) return { user_id: userId };
            
            const [rows] = await this.connection.execute(
                'SELECT * FROM user_settings WHERE user_id = ?',
                [userId]
            );

            if (rows.length > 0) {
                return rows[0];
            } else {
                await this.connection.execute(
                    'INSERT INTO user_settings (user_id) VALUES (?)',
                    [userId]
                );
                return { user_id: userId };
            }
        } catch (error) {
            console.error(chalk.red('❌ Erreur getUserData:'), error.message);
            return { user_id: userId };
        }
    }

    async updateUserData(userId, data) {
    let validFields;
    
    try {
        const connected = await this.ensureConnection();
        if (!connected) return;

        for (const field of Object.keys(data)) {
            if (field !== 'user_id' && !this.columnCache.has(field)) { 
                await this.ensureColumnExists(field);
            }
        }

        validFields = Object.keys(data).filter(key => 
            key !== 'user_id' && 
            key !== 'created_at' && 
            key !== 'updated_at'
        );
        
        if (validFields.length === 0) return;

        const values = [];
        const setClauses = [];

        for (const field of validFields) {
            const value = data[field];
            
            if (field === 'rolemenus' || field === 'multi' || field === 'rainbowrole') { 
                setClauses.push(`\`${field}\` = ?`);
                if (typeof value === 'object' && value !== null) {
                    values.push(JSON.stringify(value));
                } else {
                    values.push(JSON.stringify({}));
                }
            } else if (field === 'afk') { 
                setClauses.push(`\`${field}\` = ?`);
                if (typeof value === 'boolean') {
                    values.push(value ? 1 : 0);
                } else if (value === 1 || value === '1' || value === true) {
                    values.push(1);
                } else {
                    values.push(0);
                }
            } else if (field === 'spotifyartistids') {
                setClauses.push(`\`${field}\` = ?`);
                if (Array.isArray(value)) {
                    values.push(JSON.stringify(value));
                } else {
                    values.push(JSON.stringify([]));
                }
            } else if (typeof value === 'boolean') {
                setClauses.push(`\`${field}\` = ?`);
                values.push(value ? 1 : 0);
            } else if (value === null || value === undefined) {
                setClauses.push(`\`${field}\` = NULL`);
            } else if (typeof value === 'number') {
                setClauses.push(`\`${field}\` = ?`);
                values.push(value);
            } else if (typeof value === 'string') {
                setClauses.push(`\`${field}\` = ?`);
                values.push(value.trim());
            } else {
                setClauses.push(`\`${field}\` = ?`);
                values.push(String(value));
            }
        }

        if (setClauses.length === 0) return;

        values.push(userId);
        const setClause = setClauses.join(', ');
        
        await this.connection.execute(
            `UPDATE user_settings SET ${setClause} WHERE user_id = ?`,
            values
        );

    } catch (error) {
        console.error(chalk.red('❌ Erreur updateUserData:'), error.message);
        
        if (validFields) {
            console.error('Champs problématiques:', validFields);
        }
        
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            await this.loadColumnCache();
        }
    }
}

    async setUserData(userId, data) {
        try {
            const connected = await this.ensureConnection();
            if (!connected) return;

            for (const field of Object.keys(data)) {
                if (field !== 'user_id' && !this.columnCache.has(field)) {
                    await this.ensureColumnExists(field);
                }
            }

            const [rows] = await this.connection.execute(
                'SELECT user_id FROM user_settings WHERE user_id = ?',
                [userId]
            );

            if (rows.length > 0) {
                const updateData = { ...data };
                delete updateData.created_at;
                delete updateData.updated_at;
                await this.updateUserData(userId, updateData);
} else {
    const fields = ['user_id'];
    const placeholders = ['?'];
    const values = [userId];

    for (const [field, value] of Object.entries(data)) {
        if (field !== 'user_id' && field !== 'created_at' && field !== 'updated_at') {
            fields.push(`\`${field}\``);
            placeholders.push('?');
            
            if (field === 'rolemenus' || field === 'multi' || field === 'rainbowrole') {
                values.push(typeof value === 'object' && value !== null ? JSON.stringify(value) : JSON.stringify({}));
            } else if (field === 'afk') { 
                if (typeof value === 'boolean') {
                    values.push(value ? 1 : 0);
                } else if (value === 1 || value === '1' || value === true) {
                    values.push(1);
                } else {
                    values.push(0);
                }
            } else if (field === 'spotifyartistids') {
                values.push(Array.isArray(value) ? JSON.stringify(value) : JSON.stringify([]));
            } else if (typeof value === 'boolean') {
                values.push(value ? 1 : 0);
            } else {
                values.push(value);
            }
        }
    }

                await this.connection.execute(
                    `INSERT INTO user_settings (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
                    values
                );
            }
        } catch (error) {
            console.error(chalk.red('❌ Erreur setUserData:'), error.message);
        }
    }

    async getAllUserData() {
        try {
            const connected = await this.ensureConnection();
            if (!connected) return {};
            
            const [rows] = await this.connection.execute('SELECT * FROM user_settings');
            const result = {};
            
            rows.forEach(row => {
                result[row.user_id] = row;
            });
            
            return result;
        } catch (error) {
            console.error(chalk.red('❌ Erreur getAllUserData:'), error.message);
            return {};
        }
    }
}

module.exports = new SQLDatabase();
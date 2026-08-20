const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'starq.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let dbInstance = null;
let SQL = null;

// Helper to convert sql.js result format to array of objects
function formatResults(results) {
    if (!results || results.length === 0) return [];
    const { columns, values } = results[0];
    return values.map(row => {
        const obj = {};
        columns.forEach((col, index) => {
            obj[col] = row[index];
        });
        return obj;
    });
}

function saveDb() {
    if (!dbInstance) return;
    try {
        const data = dbInstance.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    } catch (err) {
        console.error('Failed to save SQLite file:', err);
    }
}

async function getDb() {
    if (dbInstance) return dbInstance;

    if (!SQL) {
        SQL = await initSqlJs();
    }

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        dbInstance = new SQL.Database(fileBuffer);
    } else {
        dbInstance = new SQL.Database();
        if (fs.existsSync(SCHEMA_PATH)) {
            const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
            dbInstance.exec(schema);
            saveDb();
        }
    }

    return dbInstance;
}

// Execute SELECT query returning array of objects
async function query(sql, params = []) {
    const db = await getDb();
    try {
        const stmt = db.prepare(sql);
        if (params && params.length > 0) {
            stmt.bind(params);
        }
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    } catch (error) {
        console.error('SQL query error:', sql, params, error);
        throw error;
    }
}

// Execute SELECT query returning single object
async function get(sql, params = []) {
    const rows = await query(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

// Execute INSERT, UPDATE, DELETE query
async function run(sql, params = []) {
    const db = await getDb();
    try {
        db.run(sql, params);
        saveDb();
        return { success: true };
    } catch (error) {
        console.error('SQL run error:', sql, params, error);
        throw error;
    }
}

// Execute batch SQL strings
async function exec(sql) {
    const db = await getDb();
    try {
        db.exec(sql);
        saveDb();
        return { success: true };
    } catch (error) {
        console.error('SQL exec error:', error);
        throw error;
    }
}

module.exports = {
    getDb,
    query,
    get,
    run,
    exec,
    saveDb
};

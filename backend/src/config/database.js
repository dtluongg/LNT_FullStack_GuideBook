const mysql = require('mysql2/promise');
require('dotenv').config();

// create config object from environment variables (.env)
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,  
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool(dbConfig);

// test the connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully.');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

const executeQuery = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('❌ Database query error:', error);
        throw error;
    }
};

testConnection();

// export a function to get the connection pool
module.exports = {
    pool,
    executeQuery,
    testConnection
};
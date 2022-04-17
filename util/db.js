require("dotenv").config();
const mysql = require("mysql2/promise")

let _db;

async function connect() {
    const host = process.env.NODE_ENV === "production" 
    try {
        const connection = await mysql.createConnection({
            "host" : process.env.DB_HOST,
            "port" : 3306,
            "user" : process.env.DB_USERNAME,
            "password" : process.env.DB_PASSWORD,
            "database" : process.env.DB_DATABASE
        });
        _db = connection;
    } catch (err) {
        console.log(err);
    }
}   

function initDb() {
    connect();
}

function getDb() {
    return _db;
}

module.exports = {
    initDb,
    getDb
}
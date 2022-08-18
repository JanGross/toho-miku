require("dotenv").config();
const fs = require("fs");
const db  = require("../models/index");


function getDb() {
    return db;
}


//function to sync all database models
async function syncDb() {
    return await db.sequelize.sync();

}


module.exports = {
    name: "DbUtils",
    getDb,
    syncDb
}
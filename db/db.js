const mysql = require("mysql2");
const config = require("../config/config.js");

const db = mysql.createConnection(config.db);

db.connect((err) => {
    if (err) {
        console.error("MySQL 연결 실패:", err.message);
    } else {
        console.log("MySQL 연결 성공");
    }
});

module.exports = db;
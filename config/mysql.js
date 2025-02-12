var mysql = require("mysql2");

var db_info = {
    host: "localhost",
    port: "3306",
    user: "root", // 제 로컬 mysql 정보라 각자 맞게 설정해주시면 되겠습니다
    password: "su1234", // 위와 동일
    database: "jogakzipdb"
}

var db = mysql.createConnection(db_info);
db.connect((err) => {
    if (err) {
        console.error("MySQL 연결 실패:", err.message);
    } else {
        console.log("MySQL 연결 성공");
    }
});

module.exports = db;

const express = require('express');
const db = require('./config/mysql');

const app = express();
const port = process.env.PORT || 3000;

// 기본 라우트
app.get('/', (req, res) => {
    res.render('index');
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

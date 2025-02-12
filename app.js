const express = require('express');
const cors = require('cors'); // CORS 모듈 추가
const groupRoutes = require('./routes/groupRoutes');

const app = express();

app.use(express.json());

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT'], 
    allowedHeaders: ['Content-Type'] 
}));


app.use('/groups', groupRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});

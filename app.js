const express = require("express");
const cors = require("cors"); // CORS 모듈 추가
const groupRoutes = require("./routes/groupRoutes");
const postRoutes = require("./routes/postRoutes"); // ** 게시글 라우트트 추가 **

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use("/groups", groupRoutes);
app.use("/posts", postRoutes); // ** 게시글 라우트 추가 **

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});

const express = require("express");
const cors = require("cors"); // CORS 모듈 추가
const groupRoutes = require("./routes/groupRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes"); // 댓글 라우트 추가

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use("api/groups", groupRoutes); // 수정: "/groups" → "/api/groups"
app.use("api/posts", postRoutes); // 수정: "/posts" → "/api/posts"
app.use("api/comments", commentRoutes); // 수정 : "/comments" → "/api/comments"

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});

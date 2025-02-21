// const express = require("express");

// const {
//   createComment,
//   getCommentsByPostId,
//   updateComment,
//   deleteComment,
// } = require("../controllers/commentController");

// const router = express.Router();

// // 댓글

// // 1. 등록
// router.post("/posts/:postId/comments", createComment);

// // 2. 목록 조회
// router.get("/posts/:postId/comments", getCommentsByPostId);

// // 3. 수정
// router.put("/comments/:commentId", updateComment);

// // 4. 삭제
// router.delete("/comments/:commentId", deleteComment);

// module.exports = router;

const express = require("express");
const {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router();

// 댓글 등록
router.post("/:postId/comments", createComment);

// 댓글 목록 조회
router.get("/:postId/comments", getCommentsByPostId);

// 댓글 수정
router.put("/:commentId", updateComment); ///************************ 기존 "/comments/:commentId" → "/:commentId" 변경

// 댓글 삭제
router.delete("/:commentId", deleteComment); ///************************ 기존 "/comments/:commentId" → "/:commentId" 변경

module.exports = router;

const express = require("express");

const {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router();

// 댓글

// 1. 등록
router.post("/posts/:postId/comments", createComment);

// 2. 목록 조회
router.get("/posts/:postId/comments", getCommentsByPostId);

// 3. 수정
router.put("/comments/:commentId", updateComment);

// 4. 삭제
router.delete("/comments/:commentId", deleteComment);

module.exports = router;

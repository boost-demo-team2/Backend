const express = require("express");
const {
  createPost,
  getPublicPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const router = express.Router();

// 1. 게시글 등록
router.post("/groups/:groupId/posts", createPost);

// 2. (한 그룹에 대한 전체) 게시글 목록 조회 (공개 게시글 전체)
router.get("/groups/:groupId/posts", getPublicPosts);

// 3. 게시글 상세 정보 조회 (게시글 하나)
router.get("/:postId", getPostById);

// 4. 게시글 수정
router.put("/:postId", updatePost);

// 5. 게시글 삭제
router.delete("/:postId", deletePost);

// 아래 기능 미완성+++++++++++++++++++++++++++++++++++++++++++++++

// 6. verfy-password
// 7. like
// 8. is-public

module.exports = router;

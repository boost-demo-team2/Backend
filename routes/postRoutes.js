const express = require("express");
const {
  createPost,
  getPublicPosts,
  getPostDetail,
  updatePost,
  deletePost,
  verifyPostPassword,
  likePost,
  checkPostPublicStatus,
} = require("../controllers/postController");

const router = express.Router();

// 게시글

// 1. 등록
router.post("/groups/:groupId/posts", createPost);

// 2. 전체 목록 조회 (한 그룹 내에서 게시글)
router.get("/groups/:groupId/posts", getPublicPosts);

// 3. 상세 정보 조회 (게시글 하나)
router.get("/:postId", getPostDetail);

// 4. 수정
router.put("/:postId", updatePost);

// 5. 삭제
router.delete("/:postId", deletePost);

// 기능 업데이트+++++++++++++++++++++++++++++++++++++++++++++++

// 6. 비밀번호 확인
router.post("/:postId/verify-password", verifyPostPassword);

// 7. 공감 수 증가
router.post("/:postId/like", likePost);

// 8. 공개 여부 확인
router.get("/:postId/is-public", checkPostPublicStatus);

module.exports = router;

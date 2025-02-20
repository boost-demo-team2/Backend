const express = require("express");
const {
  createGroup,
  getGroupByPublicStatus,
  checkGroupAccess,
  updateGroup,
  deleteGroup,
} = require("../controllers/groupController");
const router = express.Router();

// 기본 그룹 목록 조회
router.get("/", (req, res) => {
  res.send("그룹 목록 조회 성공");
});

// 그룹 생성
router.post("/", createGroup);

// 그룹 공개 여부 확인
router.get("/:groupId/public", getGroupByPublicStatus);

// 그룹 접근 권한 확인
router.post("/:groupId/access", checkGroupAccess);

// 그룹 수정
router.put("/", updateGroup);

// 그룹 삭제
router.delete("/", deleteGroup);

module.exports = router;

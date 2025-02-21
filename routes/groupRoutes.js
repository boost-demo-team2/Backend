const express = require("express");
const {
  createGroup,
  getGroupList,
  updateGroup,
  deleteGroup,
  getGroupDetail,
  checkGroupAccess,
  likeGroup,
  getGroupPublicStatus,

} = require("../controllers/groupController");

const router = express.Router();

// 1. 그룹 등록
router.post("/", createGroup);

// 2. 그룹 목록 조회
router.get("/", getGroupList);

// 3. 그룹 수정
router.put("/:groupId", updateGroup);

// 4. 그룹 삭제 
router.delete("/:groupId", deleteGroup);

// 5. 그룹 상세 정보 조회
router.get("/:groupId", getGroupDetail);

// 6. 그룹 조회 권한 확인
router.post("/:groupId/verify-password", checkGroupAccess);

// 7. 그룹 공감하기
router.post("/:groupId/like", likeGroup);

// 8. 그룹 공개 여부 확인
router.get("/:groupId/is-public", getGroupPublicStatus);

module.exports = router;
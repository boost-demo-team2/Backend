// const express = require("express");
// const {
//   createGroup,
//   getGroupByPublicStatus,
//   checkGroupAccess,
//   updateGroup,
//   deleteGroup,
// } = require("../controllers/groupController");
// const router = express.Router();

// // 기본 그룹 목록 조회
// router.get("/", (req, res) => {
//   res.send("그룹 목록 조회 성공");
// });

// // 그룹 생성
// router.post("/", createGroup);

// // 그룹 공개 여부 확인
// router.get("/:groupId/public", getGroupByPublicStatus);

// // 그룹 접근 권한 확인
// router.post("/:groupId/access", checkGroupAccess);

// // 그룹 수정  (/:groupId 안되어 있어 추가했습니다)
// router.put("/:groupId", updateGroup);

// // 그룹 삭제 (/:groupId 안되어 있어 추가했습니다다)
// router.delete("/:groupId", deleteGroup);

// module.exports = router;

const express = require("express");
const {
  createGroup,
  getGroupByPublicStatus,
  checkGroupAccess,
  updateGroup,
  deleteGroup,
} = require("../controllers/groupController");

const router = express.Router();

// 그룹 목록 조회
router.get("/", getGroupByPublicStatus);

// 그룹 생성
router.post("/", createGroup);

// 그룹 상세 정보 조회
router.get("/:groupId", getGroupByPublicStatus); ///************************ 추가된 엔드포인트

// 그룹 수정
router.put("/:groupId", updateGroup); ///************************ 기존 "/"에서 "/:groupId"로 변경

// 그룹 삭제
router.delete("/:groupId", deleteGroup); ///************************ 기존 "/"에서 "/:groupId"로 변경

// 그룹 접근 권한 확인
router.post("/:groupId/verify-password", checkGroupAccess);

// 그룹 공감하기 -> 없음. 필요  //////////////////
router.post("/:groupId/like", checkGroupAccess);

// 그룹 공개 여부 확인
router.get("/:groupId/is-public", getGroupByPublicStatus);

module.exports = router;

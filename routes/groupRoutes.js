const express = require('express');
const { createGroup, getPublicGroups, updateGroup, deleteGroup } = require('../controllers/groupController');
const router = express.Router();

// 그룹 생성
router.post('/', createGroup);

// 공개 그룹 조회
router.get('/public', getPublicGroups);

// 그룹 수정
router.put('/', updateGroup);

// 그룹 삭제
router.delete('/', deleteGroup);

module.exports = router;
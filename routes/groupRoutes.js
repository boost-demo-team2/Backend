const express = require('express');
const { createGroup, getPublicGroups, updateGroup } = require('../controllers/groupController');
const router = express.Router();

// 그룹 생성
router.post('/', createGroup);

// 공개 그룹 조회
router.get('/public', getPublicGroups);

// 그룹 수정
router.put('/', updateGroup);

module.exports = router;
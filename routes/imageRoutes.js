const express = require("express");
const { upload, uploadImage } = require("../controllers/imageController");

const router = express.Router();

// 이미지 업로드 API (POST /api/image)
router.post("/", upload.single("image"), uploadImage);

module.exports = router;

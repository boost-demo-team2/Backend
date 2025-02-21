const multer = require("multer");
const path = require("path");

// multer 설정 (메모리 저장 방식)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 이미지 업로드 컨트롤러
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ message: "No image uploaded" });
    }

    console.log("업로드된 파일 정보 확인용:", req.file);

    // 업로드된 파일의 URL 생성 (원래 파일명 그대로 유지됨)
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버 오류 발생", error: error.message });
  }
};

// `upload`와 `uploadImage`를 올바르게 export
module.exports = { upload, uploadImage };

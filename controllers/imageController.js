const path = require("path");
const multer = require("multer");

//  파일명 유지하도록 `storage` 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 업로드 폴더 지정
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // 기존 파일명을 그대로 사용
  },
});

//  업로드 제한 (파일 사이즈 & MIME 타입 검사)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 최대 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .png, .gif formats allowed!"));
    }
  },
});

// 이미지 업로드 컨트롤러
const uploadImage = (req, res) => {
  try {
    if (!req.file) {
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

module.exports = { upload, uploadImage };

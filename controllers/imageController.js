// const multer = require("multer");
// const path = require("path");

// // multer 설정 (메모리 저장 방식)
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // 이미지 업로드 컨트롤러
// const uploadImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       console.error("❌ No file uploaded");
//       return res.status(400).json({ message: "No image uploaded" });
//     }

//     console.log("업로드된 파일 정보 확인용:", req.file);

//     // 업로드된 파일의 URL 생성 (원래 파일명 그대로 유지됨)
//     const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;

//     return res.status(200).json({ imageUrl });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "서버 오류 발생", error: error.message });
//   }
// };

// // `upload`와 `uploadImage`를 올바르게 export
// module.exports = { upload, uploadImage };

const multer = require("multer");
const path = require("path");

// multer 설정 (디스크 저장 방식 ✅)
const storage = multer.diskStorage({
  destination: "uploads/", // ✅ 업로드된 파일을 저장할 디렉토리 지정
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
    // ✅ 파일명을 현재 타임스탬프 + 원래 확장자로 저장 (ex: 1708602400000.png)
  },
});

const upload = multer({ storage });

// 이미지 업로드 컨트롤러
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      // 파일이 업로드되지 않았을 때 처리
      console.error("❌ No file uploaded");
      return res.status(400).json({ message: "No image uploaded" });
    }

    console.log("업로드된 파일 정보 확인:", req.file); // 업로드된 파일 확인 로그

    // ✅ diskStorage 방식을 사용하므로 실제 파일이 저장됨
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    console.log("✅ 저장된 이미지 URL:", imageUrl);

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

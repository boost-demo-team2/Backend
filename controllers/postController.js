const db = require("../db/db");
const bcrypt = require("bcrypt");

// 게시글
// 1. 등록
const createPost = async (req, res) => {
  try {
    const {
      nickname,
      title,
      image,
      content,
      tags,
      location,
      moment,
      isPublic,
      password,
    } = req.body;

    const { groupId } = req.params;

    // 필수 입력값 체크
    if (
      !groupId ||
      !nickname ||
      !title ||
      !content ||
      !moment ||
      typeof isPublic !== "boolean" ||
      !password
    ) {
      return res.status(400).json({
        message:
          "groupId, nickname, title, content, moment, isPublic, password는 필수 입력값입니다.",
      });
    }

    //비밀번호 길이 6자 이상 체크
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
    }

    //비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 게시글 추가 + result (<-실행 결과 저장 )
    const sql = `INSERT INTO posts (groupId, nickname, title, image, content, tags, location, moment, isPublic, password, createdAt) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    // (?, ?, ~ )에 들어갈 값 <- values
    const values = [
      groupId,
      nickname,
      title,
      image || null,
      content,
      tags || null,
      location || null,
      moment,
      isPublic,
      hashedPassword,
    ];
    const [result] = await db.promise().execute(sql, values);

    if (!result || !result.insertId) {
      throw new Error("게시글 등록에 실패했습니다.");
    }

    return res.status(201).json({
      message: "게시글이 성공적으로 등록되었습니다.",
      postId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

// 2. "전체" 목록 조회 (한 그룹 내 게시글 전체)
const getPublicPosts = async (req, res) => {
  try {
    const { groupId } = req.params;

    // 그룹 ID가 숫자인지 검증
    if (!groupId || isNaN(groupId)) {
      return res.status(400).json({ message: "올바른 groupId가 필요합니다." });
    }

    // SQL 쿼리: 특정 그룹에 해당하는 공개된 게시글만 가져오기
    const sql = `
      SELECT postId, groupId, nickname, title, image, tags, location, moment, isPublic, likesCount, commentsCount, createdAt
      FROM posts
      WHERE groupId = ? AND isPublic = true
      ORDER BY createdAt DESC
    `;

    console.log(`🔍 DEBUG: getPublicPosts 실행됨 - groupId: ${groupId}`);

    const [rows] = await db.promise().execute(sql, [groupId]);

    console.log(`🔍 DEBUG: 조회된 게시글 개수: ${rows.length}`);

    if (rows.length === 0) {
      return res
        .status(200)
        .json({ message: "해당 그룹에 공개 게시글이 없습니다.", data: [] });
    }

    return res
      .status(200)
      .json({ message: "공개 게시글 조회에 성공했습니다.", data: rows });
  } catch (error) {
    console.error("❌ getPublicPosts 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "서버 오류 발생", error: error.message });
  }
};

// 3. 상세 정보 조회 (게시글 하나)
const getPostDetail = async (req, res) => {
  try {
    const { postId } = req.params;

    //특정 게시글 조회
    const sql = `SELECT * FROM posts WHERE postId = ?`;
    const [rows] = await db.promise().execute(sql, [postId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 게시글을 찾을 수 없습니다." });
    }

    return res.status(200).json({ message: "게시글 조회 성공", data: rows[0] });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

// 4. 수정
const updatePost = async (req, res) => {
  try {
    //수정할 게시글 가져오기 from req.body
    const { postId } = req.params;
    const { password, title, content, tags, location, moment, isPublic } =
      req.body;

    // 필수 입력값 체크
    if (!postId || !password) {
      return res
        .status(400)
        .json({ message: "postId와 password는 필수 입력값입니다." });
    }

    // 해시된 비밀번호 불러오기 from MySQL  (-> [post])
    // [
    //   { "password": "$2b$10$abcdefg12345hashedpassword" }
    // ]
    const [post] = await db
      .promise()
      .execute("SELECT password FROM posts WHERE postId = ?", [postId]);
    if (post.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 게시글을 찾을 수 없습니다." });
    }

    // 비교: 사용자가 입력한 비밀번호 VS 해시된 비밀번호 (true, false로 반환)
    const isMatch = await bcrypt.compare(password, post[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 틀립니다." });
    }

    //게시글 수정 (변경) : 빈 배열로 초기화 + push
    let updateFields = [];
    let values = [];

    if (title) updateFields.push("title = ?"), values.push(title);
    if (content) updateFields.push("content = ?"), values.push(content);
    if (tags) updateFields.push("tags = ?"), values.push(tags);
    if (location) updateFields.push("location = ?"), values.push(location);
    if (moment) updateFields.push("moment = ?"), values.push(moment);
    if (isPublic !== undefined)
      updateFields.push("isPublic = ?"), values.push(isPublic);

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "수정할 내용이 없습니다." });
    }

    updateFields.push("updatedAt = NOW()");
    values.push(postId);

    //수정(변경)사항 합쳐서(join) -> MySql db에 저장
    const sql = `UPDATE posts SET ${updateFields.join(", ")} WHERE postId = ?`;
    await db.promise().execute(sql, values);

    return res
      .status(200)
      .json({ message: "게시글이 성공적으로 수정되었습니다. " });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

// 5. 삭제
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { password } = req.body;

    // 필수 입력값 체크
    if (!postId || !password) {
      return res
        .status(400)
        .json({ message: "postId와 password는 필수 입력값입니다." });
    }

    // 게시글 비밀번호 확인을 위해 조회(불러오기)
    const [postRows] = await db
      .promise()
      .execute("SELECT password FROM posts WHERE postId = ?", [postId]);

    if (!postRows || postRows.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 게시글을 찾을 수 없습니다. " });
    }

    // 비교: 입력된 비밀번호(password) VS 저장된 비밀번호(postRows[0].password)
    const isMatch = await bcrypt.compare(password, postRows[0].password);
    if (!isMatch) {
      return res.status(403).json({ message: "비밀번호가 틀렸습니다." });
    }

    // 게시글 삭제 실행
    await db.promise().execute("DELETE FROM posts WHERE postId = ?", [postId]);

    return res
      .status(200)
      .json({ message: "게시글이 성공적으로 삭제되었습니다. " });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버 오류 발생", error: error.message });
  }
};

// 6. 비밀번호 확인
const verifyPostPassword = async (req, res) => {
  try {
    const { postId } = req.params;
    const { password } = req.body;

    // 필수 입력값 체크
    if (!postId || !password) {
      return res
        .status(400)
        .json({ message: "postId와 password는 필수 입력값입니다." });
    }

    // MySql database에서 게시글 비밀번호 조회
    const [postRows] = await db
      .promise()
      .execute("SELECT password FROM posts WHERE postId = ?", [postId]);

    if (!postRows || postRows.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 게시글을 찾을 수 없습니다." });
    }

    // 비교: 입력된 비밀번호 vs 저장된 비밀번호
    const isMatch = await bcrypt.compare(password, postRows[0].password);
    if (!isMatch) {
      return res
        .status(403)
        .json({ message: "비밀번호가 틀렸습니다. 다시 확인해주세요. " });
    }

    return res.status(200).json({ message: "비밀번호가 확인되었습니다! " });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

// 7. 공감 수 증가
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "postId는 필수 입력값입니다." });
    }

    // 공감 수 + 1
    const sql = `UPDATE posts SET likesCount = likesCount + 1 WHERE postId = ?`;
    await db.promise().execute(sql, [postId]);

    return res.status(200).json({ message: "공감 수 + 1" });
  } catch (error) {
    console.errror(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

// 8. 게시글 공개 여부 ( isPublic : true 공개 or false 비공개)
const checkPostPublicStatus = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "postId는 필수 입력값입니다." });
    }

    // postId에 해당하는 isPublic 값 가져온 후 -> postRows에 저장
    const sql = "SELECT isPublic FROM posts WHERE postId = ?";
    const [postRows] = await db.promise().execute(sql, [postId]);

    // 데이터가 없는 경우
    if (!postRows || postRows.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 게시글을 찾을 수 없습니다. " });
    }

    return res.status(200).json({ message: "공개 추억 게시글입니다. " });
  } catch (error) {
    console.errror(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

module.exports = {
  // 게시글
  createPost, // 1. 등록
  getPublicPosts, // 2. 전체 목록 조회 (게시글 전체)
  getPostDetail, // 3. 상세 정보 조회 (게시글 하나)
  updatePost, // 4. 수정
  deletePost, // 5. 삭제
  verifyPostPassword, // 6. 비밀번호 확인인
  likePost, // 7. 공감 수 증가가
  checkPostPublicStatus, // 8. 게시글 공개 여부 : 공개 /비공개
};

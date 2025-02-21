const db = require("../db/db");
const bcrypt = require("bcrypt");

// 댓글
// 1. 등록
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { nickname, content, password } = req.body;
  

    // 필수 입력값 체크 content not null로 설정!
    if (!postId || !nickname || !content || !password) {
      return res.status(400).json({
        message: "postId, nickname, content, password는 필수 입력값입니다.",
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
            INSERT INTO \`comments\` (postId, nickname, content, password, createdAt) 
            VALUES (?, ?, ?, ?, NOW())`;

    const values = [postId, nickname, content, hashedPassword];

    const [result] = await db.promise().execute(sql, values);

    return res.status(201).json({
      message: "댓글이 성공적으로 등록되었습니다.",
      commentId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

// 2. 목록 조회
const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log("Received postId:", postId); // 디버깅 로그

    const sql = `
        SELECT commentId, nickname, content, createdAt
        FROM comments
        WHERE postId = ?
        ORDER BY createdAt ASC`;

    const [comments] = await db.promise().execute(sql, [postId]);

    return res.status(200).json({
      message: "댓글 목록 조회 성공",
      data: comments,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

// 3. 수정
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { password, content } = req.body;

    if (!commentId || !password || !content) {
      return res.status(400).json({
        message: "commentId, password, content는 필수 입력값입니다.",
      });
    }

    // 비밀번호 확인
    const [rows] = await db
      .promise()
      .execute("SELECT password FROM comments WHERE commentId = ?", [
        commentId,
      ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "해당 댓글을 찾을 수 없습니다." });
    }

    // 비교: 입력된 비밀번호 vs 저장된 비밀번호
    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }

    // 댓글 수정 (업데이트트)
    const sql = `UPDATE comments SET content = ?, updatedAt = NOW() WHERE commentId = ?`;
    await db.promise().execute(sql, [content, commentId]);

    return res
      .status(200)
      .json({ message: "댓글이 성공적으로 수정되었습니다." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

// 4. 댓글 삭제
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { password } = req.body;

    if (!commentId || !password) {
      return res.status(400).json({
        message: "commentId, password는 필수 입력값입니다.",
      });
    }

    // 비밀번호 확인
    const [rows] = await db
      .promise()
      .execute("SELECT password FROM comments WHERE commentId = ?", [
        commentId,
      ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "해당 댓글을 찾을 수 없습니다." });
    }

    // 비교: 입력된 비밀번호 vs 저장된 비밀번호
    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }

    await db
      .promise()
      .execute("DELETE FROM comments WHERE commentId = ?", [commentId]);

    return res
      .status(200)
      .json({ message: "댓글이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

module.exports = {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
};

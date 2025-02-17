const db = require("../db/db");
const bcrypt = require("bcrypt");

// 1. 게시글 등록
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

// 2. (한 그룹에 대한 전체) 게시글 목록 조회 (공개 게시글 전체)
const getPublicPosts = async (req, res) => {
  try {
    // 특정 그룹의 게시글만 가져올 수 있도록 groupId 찾기
    const { groupId } = req.params;

    // 공개 게시글만 조회
    let sql = ` SELECT postId, groupId, nickname, title, image, tags, location, moment, isPublic, likesCount, commentsCount, createdAt
                    FROM posts
                    WHERE isPublic = true`;

    // groupId를 가지고 특정 그룹 게시글만 조회
    let values = [];
    if (groupId) {
      sql += ` AND groupId = ?`;
      values.push(groupId);
    }

    //최신순 정렬
    sql += ` ORDER BY createdAt DESC`;

    const [rows] = await db.promise().execute(sql, values);

    return res
      .status(200)
      .json({ message: "공개 게시글 조회에 성공했습니다.", data: rows });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "서버(server) 오류 발생", error: error.message });
  }
};

// 3. 게시글 상세 정보 조회 (게시글 하나)
const getPostById = async (req, res) => {
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

// 4. 게시글 수정
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

// 5. 게시글 삭제
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

module.exports = {
  createPost,
  getPublicPosts,
  getPostById,
  updatePost,
  deletePost,
};

const db = require("../db/db");
const bcrypt = require("bcrypt");

// 그룹
// 1. 그룹 생성 함수
const createGroup = async (req, res) => {
  try {
    const { groupName, password, image, isPublic, description } = req.body;

    // 필수 입력값 확인
    if (!groupName || !password || typeof isPublic !== "boolean") {
      return res.status(400).json({
        message: "groupName, password, isPublic(boolean)은 필수 입력값입니다.",
      });
    }

    // 비밀번호 길이 체크
    if (password.length < 6) {
      return res.status(400).json({
        message: "비밀번호는 최소 6자 이상이어야 합니다.",
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 그룹 데이터 저장
    const sql = `
      INSERT INTO \`groups\` (groupName, password, image, isPublic, description, createdAt) 
      VALUES (?, ?, ?, ?, ?, NOW())`;

    const values = [groupName, hashedPassword, image || null, isPublic, description || null];

    const [result] = await db.promise().execute(sql, values);

    if (!result || !result.insertId) {
      throw new Error("그룹 생성에 실패했습니다.");
    }

    const groupId = result.insertId;

    // 생성된 그룹 데이터 조회 (응답 순서 조정)
    const [newGroup] = await db.promise().execute(
      `SELECT groupId AS id, 
              groupName AS name, 
              description AS introduction, 
              image AS imageUrl, 
              isPublic, 
              0 AS likeCount, 
              0 AS postCount, 
              JSON_ARRAY() AS badges, 
              createdAt 
       FROM \`groups\` WHERE groupId = ?`, 
      [groupId]
    );

    // 응답 순서를 JSON 형태로 맞춤
    const formattedResponse = {
      id: newGroup[0].id,
      name: newGroup[0].name,
      introduction: newGroup[0].introduction, // `description` → `introduction`
      imageUrl: newGroup[0].imageUrl,
      isPublic: newGroup[0].isPublic, // `isPublic` 누락 방지
      likeCount: newGroup[0].likeCount,
      postCount: newGroup[0].postCount,
      badges: newGroup[0].badges, // `badges` 추가
      createdAt: newGroup[0].createdAt
    };

    return res.status(201).json(formattedResponse);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};

// 2. 그룹 목록 조회
const getGroupList = async (req, res) => {
  try {
    let { sortBy, keyword, isPublic } = req.query;

    // `isPublic`을 boolean에서 MySQL 값(1/0)으로 변환
    let isPublicValue = null;
    if (isPublic === "true") isPublicValue = 1;
    if (isPublic === "false") isPublicValue = 0;

    // 정렬 기준 설정
    let orderByClause = "createdAt DESC";
    switch (sortBy) {
      case "mostPosted":
        orderByClause = "postCount DESC";
        break;
      case "mostLiked":
        orderByClause = "likesCount DESC";
        break;
      case "mostBadge":
        orderByClause = "badgeCount DESC";
        break;
      case "latest":
      default:
        orderByClause = "createdAt DESC";
        break;
    }

    // 검색 조건 설정
    let whereClause = "WHERE 1=1";
    let values = [];

    if (isPublicValue !== null) {
      whereClause += " AND isPublic = ?";
      values.push(isPublicValue);
    }

    if (keyword) {
      whereClause += " AND groupName LIKE ?";
      values.push(`%${keyword}%`);
    }

    const sql = `
      SELECT 
        groupId AS id, 
        groupName AS name, 
        image AS imageUrl, 
        isPublic, 
        likesCount AS likeCount, 
        badgeCount, 
        postCount, 
        createdAt, 
        description AS introduction
      FROM \`groups\`
      ${whereClause}
      ORDER BY ${orderByClause}`;

    // MySQL 실행
    const [groups] = await db.promise().execute(sql, values);

    return res.status(200).json({
      totalItemCount: groups.length,
      data: groups,
    });

  } catch (error) {
    console.error("SQL 실행 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};

// 3. 그룹 수정
const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;  // `req.body.groupId` → `req.params.groupId`로 수정
    const { password, groupName, image, description, isPublic } = req.body;

    // 필수 입력값 확인
    if (!groupId || !password) {
      return res.status(400).json({ message: "groupId와 password는 필수 입력값입니다." });
    }

    // 그룹 정보 조회 (비밀번호 확인을 위해)
    const [groupRows] = await db.promise().execute(
      "SELECT * FROM `groups` WHERE groupId = ?",
      [groupId]
    );

    if (!groupRows || groupRows.length === 0) {
      return res.status(404).json({ message: "해당 그룹을 찾을 수 없습니다." });
    }

    const group = groupRows[0];

    // 입력된 비밀번호와 저장된 비밀번호 비교
    const isMatch = await bcrypt.compare(password, group.password);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 틀립니다." });
    }

    // 변경할 필드 준비
    let updateFields = [];
    let values = [];

    if (groupName) {
      updateFields.push("groupName = ?");
      values.push(groupName);
    }
    if (image) {
      updateFields.push("image = ?");
      values.push(image);
    }
    if (description) {
      updateFields.push("description = ?");
      values.push(description);
    }
    if (isPublic !== undefined && isPublic !== null) {
      updateFields.push("isPublic = ?");
      values.push(isPublic);
    }

    // 업데이트할 값이 있으면 쿼리 실행
    if (updateFields.length > 0) {
      updateFields.push("updatedAt = NOW()");
      values.push(groupId);

      const sql = `UPDATE \`groups\` SET ${updateFields.join(", ")} WHERE groupId = ?`;
      await db.promise().execute(sql, values);
    }

    // 수정된 그룹 정보를 다시 조회
    const [updatedGroupRows] = await db.promise().execute(
      "SELECT groupId AS id, groupName AS name, image AS imageUrl, isPublic, likesCount, postCount, createdAt, description FROM `groups` WHERE groupId = ?",
      [groupId]
    );

    if (!updatedGroupRows || updatedGroupRows.length === 0) {
      return res.status(500).json({ message: "그룹 정보를 다시 불러올 수 없습니다." });
    }

    const updatedGroup = updatedGroupRows[0];

    // 응답 객체 구성
    return res.status(200).json({
      id: updatedGroup.id,
      name: updatedGroup.name,
      imageUrl: updatedGroup.imageUrl,
      isPublic: updatedGroup.isPublic,
      likeCount: updatedGroup.likesCount || 0,
      postCount: updatedGroup.postCount || 0,
      createdAt: updatedGroup.createdAt,
      introduction: updatedGroup.description,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};


// 4. 그룹 삭제
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params; // URL 경로에서 groupId 가져오기
    const { password } = req.body;

    // 필수 입력값 확인
    if (!groupId || !password) {
      return res.status(400).json({
        message: "잘못된 요청입니다. groupId와 password는 필수 입력값입니다.",
      });
    }

    // 그룹 정보 조회 (비밀번호 확인을 위해)
    const [groupRows] = await db
      .promise()
      .execute("SELECT password FROM `groups` WHERE groupId = ?", [groupId]);

    if (!groupRows || groupRows.length === 0) {
      return res.status(404).json({ message: "존재하지 않는 그룹입니다." });
    }

    // 입력된 비밀번호와 저장된 비밀번호 비교
    const isMatch = await bcrypt.compare(password, groupRows[0].password);
    if (!isMatch) {
      return res.status(403).json({ message: "비밀번호가 틀렸습니다." });
    }

    // 그룹 삭제 쿼리 실행
    await db.promise().execute("DELETE FROM `groups` WHERE groupId = ?", [groupId]);
    
    return res.status(200).json({ message: "그룹 삭제 성공" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};

// 5. 그룹 상세 정보 조회
const getGroupDetail = async (req, res) => {
  try {
    const { groupId } = req.params; // URL에서 groupId 가져오기

    // `groupId`가 숫자가 맞는지 확인
    if (!groupId || isNaN(Number(groupId))) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    const numericGroupId = Number(groupId); // 문자열을 숫자로 변환

    // 그룹 정보 조회
    const [groupRows] = await db.promise().execute(
      "SELECT groupId AS id, groupName AS name, image AS imageUrl, isPublic, likesCount AS likeCount, postCount, createdAt, description AS introduction FROM `groups` WHERE groupId = ?",
      [numericGroupId]
    );

    if (!groupRows || groupRows.length === 0) {
      return res.status(404).json({ message: "해당 그룹을 찾을 수 없습니다." });
    }

    const group = groupRows[0];

    // 응답 객체 구성
    return res.status(200).json({
      id: group.id,
      name: group.name,
      imageUrl: group.imageUrl,
      isPublic: group.isPublic,
      likeCount: group.likeCount || 0,
      badges: ["badge1", "badge2"], // 기본값
      postCount: group.postCount || 0,
      createdAt: group.createdAt,
      introduction: group.introduction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};

// 6. 그룹 조회 권한 확인
const checkGroupAccess = async (req, res) => {
  try {
    const { groupId } = req.params; // URL에서 groupId 가져오기
    const { password } = req.body;

    // 필수 입력값 확인
    if (!groupId || isNaN(Number(groupId)) || !password) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    const numericGroupId = Number(groupId); // `groupId`를 숫자로 변환

    // 그룹 정보 조회 (비밀번호 확인을 위해)
    const [groupRows] = await db.promise().execute(
      "SELECT password FROM `groups` WHERE groupId = ?",
      [numericGroupId]
    );

    if (!groupRows || groupRows.length === 0) {
      return res.status(404).json({ message: "해당 그룹을 찾을 수 없습니다." });
    }

    const storedPassword = groupRows[0].password;

    // 비밀번호 검증
    const isMatch = await bcrypt.compare(password, storedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다" });
    }

    // 비밀번호가 맞으면 성공 응답 반환
    return res.status(200).json({ message: "비밀번호가 확인되었습니다" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};

// 7. 그룹 공감하기
const likeGroup = async (req, res) => {
  try {
    const { groupId } = req.params; // URL에서 groupId 가져오기

    // `groupId`가 숫자가 맞는지 확인
    if (!groupId || isNaN(Number(groupId))) {
      return res.status(400).json({ message: "잘못된 요청입니다. groupId는 필수 입력값이며 숫자여야 합니다." });
    }

    const numericGroupId = Number(groupId); // `groupId`를 숫자로 변환

    // 그룹 존재 여부 확인
    const [groupRows] = await db.promise().execute(
      "SELECT likesCount FROM `groups` WHERE groupId = ?",
      [numericGroupId]
    );

    if (!groupRows || groupRows.length === 0) {
      return res.status(404).json({ message: "해당 그룹을 찾을 수 없습니다." });
    }

    // 공감 수 +1 (`groups` 테이블을 백틱으로 감싸기)
    const sql = `UPDATE \`groups\` SET likesCount = likesCount + 1 WHERE groupId = ?`;
    await db.promise().execute(sql, [numericGroupId]);

    return res.status(200).json({ message: "그룹 공감 수가 증가되었습니다." });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};

// 8. 그룹 공개 여부 확인
const getGroupPublicStatus = async (req, res) => {
  try {
    const { groupId } = req.params; //  URL에서 groupId 가져오기

    //  `groupId`가 숫자가 맞는지 확인
    if (!groupId || isNaN(Number(groupId))) {
      return res.status(400).json({ message: "잘못된 요청입니다" });
    }

    const numericGroupId = Number(groupId); // `groupId`를 숫자로 변환

    //  그룹 정보 조회 (isPublic 여부 확인)
    const [groupRows] = await db.promise().execute(
      "SELECT groupId AS id, isPublic FROM `groups` WHERE groupId = ?",
      [numericGroupId]
    );

    //  그룹이 존재하지 않을 경우
    if (!groupRows || groupRows.length === 0) {
      return res.status(404).json({ message: "해당 그룹을 찾을 수 없습니다." });
    }

    const group = groupRows[0];

    //  응답 객체 구성
    return res.status(200).json({
      id: group.id,
      isPublic: group.isPublic,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};

module.exports = {
  createGroup,
  getGroupList,
  updateGroup,
  deleteGroup,
  getGroupDetail,
  checkGroupAccess,
  likeGroup,
  getGroupPublicStatus
};

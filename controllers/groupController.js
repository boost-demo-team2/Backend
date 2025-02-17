const db = require('../db/db'); 
const bcrypt = require('bcrypt'); 

// 그룹 생성 함수
const createGroup = async (req, res) => {
    try {
        const { groupName, image, description, isPublic, password } = req.body;

        // 필수 필드 확인
        if (!groupName || typeof isPublic !== "boolean" || !password) {
            return res.status(400).json({ message: "groupName, isPublic(boolean), password는 필수 입력값입니다." });
        }

        // 비밀번호 길이 체크
        if (password.length < 6) {
            return res.status(400).json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO \`groups\` (groupName, image, description, isPublic, password, createdAt) 
            VALUES (?, ?, ?, ?, ?, NOW())`;

        const values = [groupName, image || null, description || null, isPublic, hashedPassword];

        const [rows] = await db.promise().execute(sql, values);

        if (!rows || !rows.insertId) {
            throw new Error("Insert operation failed.");
        }

        return res.status(201).json({ message: "그룹이 성공적으로 생성되었습니다.", groupId: rows.insertId });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 그룹 공개 여부 확인 함수
const getGroupByPublicStatus = async (req, res) => {
    try {
        const { groupId } = req.params;

        // 필수 입력값 확인
        if (!groupId) {
            return res.status(400).json({ message: "groupId는 필수 입력값입니다." }); 
        }

        const sql = "SELECT groupId, isPublic FROM `groups` WHERE groupId = ?";
        const [groupRows] = await db.promise().execute(sql, [groupId]);

        if (!groupRows || groupRows.length === 0) {
            return res.status(404).json({ message: "해당 그룹을 찾을 수 없습니다." });
        }

        const isPublic = groupRows[0].isPublic === 1;

        // 공개 그룹이면 바로 그룹 목록 조회 결과 반환
        if (isPublic) {
            const sqlPublic = "SELECT * FROM `groups` WHERE isPublic = true";
            const [groups] = await db.promise().execute(sqlPublic);
            return res.status(200).json({ message: "공개 그룹 조회 성공", data: groups });
        }

        // 비공개 그룹이면 비밀번호 확인 필요 메시지 반환
        return res.status(200).json({
            message: "비공개 그룹입니다. 접근하려면 비밀번호를 입력하세요.",
            isPublic: false
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 비공개 그룹 조회 함수
const checkGroupAccess = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { password } = req.body;

        if (!groupId || !password) {
            return res.status(400).json({ message: "groupId와 password는 필수 입력값입니다." });
        }

        // 그룹 비밀번호 조회(권한 확인)
        const sql = "SELECT password FROM `groups` WHERE groupId = ? AND isPublic = false";
        const [groupRows] = await db.promise().execute(sql, [groupId]);

        if (!groupRows || groupRows.length === 0) {
            return res.status(404).json({message: "해당 비공개 그룹을 찾을 수 없습니다."});
        }

        // 비밀번호 검증
        const isMatch = await bcrypt.compare(password, groupRows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: "비밀번호가 틀렸습니다."});
        }

        // 비밀번호가 맞으면 목록 조회
        const sqlGroups = "SELECT * FROM `groups` WHERE groupId = ?";
        const [groups] = await db.promise().execute(sqlGroups, [groupId]);

        return res.status(200).json({ message: "비밀번호 확인 완료. 그룹 정보 조회 성공", data: groups });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message});
    }
};

// 그룹 수정 함수
const updateGroup = async (req, res) => {
    try {
        const { groupId, password, groupName, image, description, isPublic } = req.body;

        // 필수 입력값 확인
        if (!groupId || !password) {
            return res.status(400).json({ message: "groupId와 password는 필수 입력값입니다." });
        }

        // 그룹 정보 조회 (비밀번호 확인을 위해)
        const [groupRows] = await db.promise().execute("SELECT password FROM \`groups\` WHERE groupId = ?", [groupId]);
        
        if (!groupRows || groupRows.length === 0) {
            return res.status(404).json({ message: "해당 그룹을 찾을 수 없습니다." });
        }

        // 입력된 비밀번호와 저장된 비밀번호 비교
        const isMatch = await bcrypt.compare(password, groupRows[0].password);
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

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "수정할 내용이 없습니다." });
        }

        updateFields.push("updatedAt = NOW()");

        values.push(groupId);
        const sql = `UPDATE \`groups\` SET ${updateFields.join(", ")} WHERE groupId = ?`;

        await db.promise().execute(sql, values);

        return res.status(200).json({ message: "그룹 정보가 성공적으로 수정되었습니다." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 그룹 삭제 함수
const deleteGroup = async (req, res) => {
    try {
        const { groupId, password } = req.body;

        // 필수 입력값 확인
        if (!groupId || !password) {
            return res.status(400).json({ message: "잘못된 요청입니다. groupId와 password는 필수 입력값입니다."});
        }

        // 그룹 정보 조회 (비밀번호 확인을 위해)
        const [groupRows] = await db.promise().execute("SELECT password FROM `groups` WHERE groupId = ?", [groupId]);
    
        if (!groupRows || groupRows.length === 0) {
            return res.status(404).json({ message: "존재하지 않습니다"});
        }

        // 입력된 비밀번호와 저장된 비밀번호 비교
        const isMatch = await bcrypt.compare(password, groupRows[0].password);
        if (!isMatch) {
            return res.status(403).json({ message: "비밀번호가 틀렸습니다" });
        }

        // 그룹 삭제 쿼리 실행
        await db.promise().execute("DELETE FROM `groups` WHERE groupId = ?", [groupId]);
        return res.status(200).json({ message: "그룹 삭제 성공" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
}

module.exports = { createGroup, getGroupByPublicStatus, checkGroupAccess, getGroupsList, updateGroup, deleteGroup };

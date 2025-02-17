# 데이터베이스 생성
create database jogakzipDB;

# 데이터베이스 사용하기
use jogakzipDB;

DROP TABLE IF EXISTS groups;

CREATE TABLE groups (
	groupId	INT	UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	groupName VARCHAR(100) NOT NULL,
	image VARCHAR(255),
	description	TEXT,
    isPublic BOOLEAN NOT NULL DEFAULT 1,
	password VARCHAR(255),
	postCount INT UNSIGNED DEFAULT 0,
	badgeCount INT UNSIGNED DEFAULT 0,
	likesCount INT UNSIGNED	DEFAULT 0,
	dDay DATE,
	createdAt TIMESTAMP	NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt TIMESTAMP
);

DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
	postId	INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	groupId	INT	UNSIGNED NOT NULL,
	nickname VARCHAR(100) NOT NULL,
	title VARCHAR(255) NOT NULL,
	image VARCHAR(255),
	content	TEXT NOT NULL,
	tags VARCHAR(255),
	location VARCHAR(100),
	moment DATE,
	isPublic BOOLEAN NOT NULL DEFAULT 1,
	password VARCHAR(255),
	likesCount INT UNSIGNED DEFAULT 0,
	commentsCount INT UNSIGNED DEFAULT 0,
	createdAt TIMESTAMP	DEFAULT CURRENT_TIMESTAMP,
	updatedAt TIMESTAMP	DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (groupId) REFERENCES groups(groupId) ON DELETE CASCADE
);

DROP TABLE IF EXISTS badges;

CREATE TABLE badges (
	badgeId	INT	UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	groupId	INT	UNSIGNED NOT NULL,
	badgeType ENUM('MEMORY_20K', 'YEAR_1', 'LIKES_10000') NOT NULL,
	awardedAt TIMESTAMP	NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (groupId) REFERENCES groups(groupId) ON DELETE CASCADE
);

DROP TABLE IF EXISTS comments;

CREATE TABLE comments (
	commentId INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	postId	INT UNSIGNED NOT NULL,
	nickname VARCHAR(100) NOT NULL,
	content	TEXT,
	password VARCHAR(255),
	createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updatedAt TIMESTAMP	DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(postId) ON DELETE CASCADE
);

ALTER TABLE posts ADD CONSTRAINT PK_POSTS PRIMARY KEY (
	postId
);

ALTER TABLE groups ADD CONSTRAINT PK_GROUPS PRIMARY KEY (
	groupId
);

ALTER TABLE badges ADD CONSTRAINT PK_BADGES PRIMARY KEY (
	badgeId
);

ALTER TABLE comments ADD CONSTRAINT PK_COMMENTS PRIMARY KEY (
	commentId
);

ALTER TABLE posts ADD CONSTRAINT FK_groups_TO_posts_1 FOREIGN KEY (
	groupId
)
REFERENCES groups (
	groupId
);

ALTER TABLE badges ADD CONSTRAINT FK_groups_TO_badges_1 FOREIGN KEY (
	groupId
)
REFERENCES groups (
	groupId
);

ALTER TABLE comments ADD CONSTRAINT FK_posts_TO_comments_1 FOREIGN KEY (
	postId2
)
REFERENCES posts (
	postId
);

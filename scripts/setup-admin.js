/**
 * 초기 관리자 설정 스크립트
 * 
 * 사용법:
 * node scripts/setup-admin.js <username> <password>
 * 
 * 예시:
 * node scripts/setup-admin.js admin mypassword123
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function ensureUsersFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
  }
}

function setupAdmin(username, password) {
  ensureUsersFile();

  let users = [];
  if (fs.existsSync(usersFilePath)) {
    users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
  }

  // 기존 사용자 확인
  const existingUserIndex = users.findIndex(u => u.username === username);

  if (existingUserIndex !== -1) {
    // 기존 사용자를 관리자로 설정
    users[existingUserIndex].password = hashPassword(password);
    users[existingUserIndex].isAdmin = true;
    console.log(`✅ 기존 사용자 "${username}"을(를) 관리자로 설정했습니다.`);
  } else {
    // 새 관리자 생성
    const newAdmin = {
      id: Date.now().toString(),
      username,
      email: null,
      password: hashPassword(password),
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };
    users.push(newAdmin);
    console.log(`✅ 새 관리자 "${username}"을(를) 생성했습니다.`);
  }

  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  console.log(`\n📝 관리자 정보:`);
  console.log(`   사용자명: ${username}`);
  console.log(`   비밀번호: ${password}`);
  console.log(`\n💡 이제 http://localhost:3000/login 에서 로그인할 수 있습니다.`);
}

// 명령줄 인자 확인
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ 사용법: node scripts/setup-admin.js <username> <password>');
  console.error('예시: node scripts/setup-admin.js admin mypassword123');
  process.exit(1);
}

const [username, password] = args;

if (password.length < 6) {
  console.error('❌ 비밀번호는 최소 6자 이상이어야 합니다.');
  process.exit(1);
}

setupAdmin(username, password);


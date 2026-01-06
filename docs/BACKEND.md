# 백엔드 관리 가이드

이 문서는 책 리뷰 사이트의 백엔드 구조와 관리 방법을 설명합니다.

## 📁 백엔드 구조

이 프로젝트는 **Next.js API Routes**를 사용하여 백엔드를 구현합니다. 별도의 백엔드 서버 없이 Next.js 서버 내에서 API를 제공합니다.

### 디렉토리 구조

```
app/api/
├── auth/                    # 인증 관련 API
│   ├── login/route.ts      # 로그인
│   ├── register/route.ts   # 회원가입
│   ├── logout/route.ts     # 로그아웃
│   ├── me/route.ts         # 현재 사용자 정보
│   └── admin/route.ts      # 사용자 관리 (관리자용)
├── books/                   # 책 관련 API
│   ├── route.ts            # 책 목록 (GET), 책 추가 (POST)
│   └── [id]/
│       ├── route.ts        # 책 조회 (GET), 수정 (PUT), 삭제 (DELETE)
│       └── comments/
│           └── route.ts    # 댓글 조회 (GET), 댓글 추가 (POST)
```

### 데이터 저장소

데이터는 `data/` 폴더의 JSON 파일로 저장됩니다:

```
data/
├── books.json      # 책 정보
├── comments.json   # 댓글 정보
├── users.json      # 사용자 정보
└── sessions.json   # 세션 정보
```

## 🔌 API 엔드포인트 목록

### 인증 API

#### POST `/api/auth/register`
회원가입

**요청 본문:**
```json
{
  "username": "string (필수)",
  "email": "string (선택)",
  "password": "string (필수, 최소 6자)"
}
```

**응답:**
```json
{
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

#### POST `/api/auth/login`
로그인

**요청 본문:**
```json
{
  "username": "string",
  "password": "string"
}
```

**응답:**
- 쿠키에 `session_token` 저장
- 본문: 사용자 정보 (비밀번호 제외)

#### POST `/api/auth/logout`
로그아웃

**응답:**
```json
{
  "message": "로그아웃되었습니다."
}
```

#### GET `/api/auth/me`
현재 로그인한 사용자 정보 조회

**응답:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "isAdmin": boolean
  }
}
```

#### GET `/api/auth/admin`
사용자 목록 조회 (관리자만)

**응답:**
```json
{
  "users": [
    {
      "id": "string",
      "username": "string",
      "email": "string | null",
      "isAdmin": boolean,
      "createdAt": "string"
    }
  ]
}
```

#### PUT `/api/auth/admin`
사용자 관리자 권한 설정/해제 (관리자만)

**요청 본문:**
```json
{
  "userId": "string",
  "isAdmin": boolean
}
```

### 책 API

#### GET `/api/books`
모든 책 목록 조회

**응답:**
```json
[
  {
    "id": "string",
    "title": "string",
    "author": "string",
    "coverImage": "string",
    "rating": number,
    "review": "string",
    "publishedDate": "string | null",
    "genre": "string | null",
    "createdAt": "string"
  }
]
```

#### POST `/api/books`
새 책 추가 (관리자만)

**요청 본문:**
```json
{
  "title": "string (필수)",
  "author": "string (필수)",
  "coverImage": "string (필수, URL)",
  "rating": number (필수, 1-5),
  "review": "string (필수)",
  "publishedDate": "string (선택, YYYY-MM-DD)",
  "genre": "string (선택)"
}
```

#### GET `/api/books/[id]`
특정 책 정보 조회

**응답:**
```json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "coverImage": "string",
  "rating": number,
  "review": "string",
  "publishedDate": "string | null",
  "genre": "string | null",
  "createdAt": "string",
  "updatedAt": "string | null"
}
```

#### PUT `/api/books/[id]`
책 정보 수정 (관리자만)

**요청 본문:** (POST와 동일)

#### DELETE `/api/books/[id]`
책 삭제 (관리자만)

### 댓글 API

#### GET `/api/books/[id]/comments`
특정 책의 댓글 목록 조회

**응답:**
```json
[
  {
    "id": "string",
    "author": "string",
    "content": "string",
    "createdAt": "string"
  }
]
```

#### POST `/api/books/[id]/comments`
댓글 추가

**요청 본문:**
```json
{
  "author": "string (필수)",
  "content": "string (필수)"
}
```

## 🛠️ 백엔드 관리 방법

### 1. 로컬 개발 환경

개발 서버 실행:
```bash
npm run dev
```

API는 `http://localhost:3000/api/...` 경로로 접근 가능합니다.

### 2. 데이터 백업

데이터는 `data/` 폴더에 JSON 파일로 저장되므로, 정기적으로 백업하는 것을 권장합니다:

```bash
# 데이터 폴더 전체 백업
cp -r data/ data-backup-$(date +%Y%m%d)/
```

Windows:
```powershell
Copy-Item -Path data -Destination "data-backup-$(Get-Date -Format 'yyyyMMdd')" -Recurse
```

### 3. 데이터 직접 수정

필요시 JSON 파일을 직접 편집할 수 있습니다. 하지만 데이터 형식에 주의하세요.

**books.json 예시:**
```json
[
  {
    "id": "1234567890",
    "title": "책 제목",
    "author": "저자명",
    "coverImage": "https://example.com/image.jpg",
    "rating": 5,
    "review": "리뷰 내용...",
    "publishedDate": "2024-01-01",
    "genre": "소설",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 4. 초기 관리자 계정 설정

```bash
node scripts/setup-admin.js <사용자명> <비밀번호>
```

예시:
```bash
node scripts/setup-admin.js admin mypassword123
```

### 5. 에러 로그 확인

서버 콘솔에서 에러 메시지를 확인할 수 있습니다. 각 API 라우트에서 `console.error`로 에러를 로깅합니다.

## 🔒 보안 고려사항

### 현재 구현

- ✅ 비밀번호 해싱 (SHA-256)
- ✅ 세션 기반 인증 (쿠키)
- ✅ 관리자 권한 체크

### 프로덕션 권장사항

1. **비밀번호 해싱**: `bcrypt` 사용 권장
2. **세션 관리**: Redis 또는 데이터베이스 사용
3. **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용
4. **환경 변수**: 민감한 정보는 `.env` 파일로 관리
5. **데이터베이스**: JSON 파일 대신 PostgreSQL, MongoDB 등 사용

## 📊 데이터베이스 마이그레이션 (향후)

프로덕션 환경에서는 JSON 파일 대신 데이터베이스를 사용하는 것을 권장합니다:

### 옵션 1: PostgreSQL + Prisma
- 관계형 데이터베이스
- 타입 안정성
- 마이그레이션 지원

### 옵션 2: MongoDB + Mongoose
- NoSQL 데이터베이스
- 유연한 스키마
- JSON과 유사한 구조

### 옵션 3: Supabase
- PostgreSQL 기반
- 인증 기능 내장
- 무료 티어 제공

## 🚀 배포 시 주의사항

### AWS 배포 시

1. **데이터 영속성**: JSON 파일은 서버 재시작 시 유지되지만, 인스턴스가 삭제되면 데이터가 사라집니다.
2. **파일 시스템 권한**: `data/` 폴더에 쓰기 권한이 필요합니다.
3. **백업 전략**: 정기적으로 데이터를 S3 등에 백업하는 것을 권장합니다.

### 권장 아키텍처

```
[클라이언트] 
    ↓
[Next.js 서버 (API Routes)]
    ↓
[데이터베이스]
```

## 📝 API 테스트

### curl 예시

```bash
# 책 목록 조회
curl http://localhost:3000/api/books

# 책 추가 (관리자 로그인 후)
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=YOUR_TOKEN" \
  -d '{
    "title": "테스트 책",
    "author": "테스트 저자",
    "coverImage": "https://example.com/image.jpg",
    "rating": 5,
    "review": "테스트 리뷰"
  }'
```

### Postman/Thunder Client

VS Code의 Thunder Client 확장을 사용하여 API를 테스트할 수 있습니다.

## 🔧 문제 해결

### 데이터 파일이 생성되지 않음

API를 처음 호출하면 자동으로 생성됩니다. 또는 수동으로 생성:

```bash
mkdir -p data
echo "[]" > data/books.json
echo "[]" > data/comments.json
echo "{}" > data/sessions.json
echo "[]" > data/users.json
```

### 권한 오류 (파일 쓰기 실패)

파일 시스템 권한을 확인하세요:
- Windows: 폴더 속성에서 쓰기 권한 확인
- Linux/Mac: `chmod 755 data/` 실행

### 세션이 유지되지 않음

쿠키 설정을 확인하세요. 개발 환경에서는 `httpOnly: true`만으로 충분하지만, 프로덕션에서는 `secure: true`도 필요합니다.


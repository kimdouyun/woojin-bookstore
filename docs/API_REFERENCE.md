# API 참조 문서

이 문서는 모든 API 엔드포인트의 상세한 사용법을 제공합니다.

## 기본 정보

- **Base URL**: `http://localhost:3000/api` (개발 환경)
- **Content-Type**: `application/json`
- **인증**: 세션 쿠키 (`session_token`)

## 공통 응답 형식

### 성공 응답
```json
{
  "data": {...},
  "message": "string"
}
```

### 에러 응답
```json
{
  "error": "에러 메시지"
}
```

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 필요
- `403`: 권한 없음
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 오류

---

## 인증 API

### POST /api/auth/register

회원가입을 수행합니다.

**요청:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**요구사항:**
- `username`: 필수, 문자열
- `email`: 선택, 이메일 형식
- `password`: 필수, 최소 6자

**응답:**
```json
{
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": "1234567890",
    "username": "john_doe"
  }
}
```

**에러:**
- `400`: 사용자명 중복, 비밀번호 길이 부족

---

### POST /api/auth/login

로그인을 수행하고 세션 토큰을 설정합니다.

**요청:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**응답:**
- 쿠키에 `session_token` 자동 설정
- 본문:
```json
{
  "message": "로그인 성공",
  "user": {
    "id": "1234567890",
    "username": "john_doe",
    "isAdmin": false
  }
}
```

**에러:**
- `401`: 사용자명 또는 비밀번호 오류

---

### POST /api/auth/logout

로그아웃을 수행하고 세션을 종료합니다.

**요청:**
```http
POST /api/auth/logout
Cookie: session_token=YOUR_TOKEN
```

**응답:**
```json
{
  "message": "로그아웃되었습니다."
}
```

---

### GET /api/auth/me

현재 로그인한 사용자 정보를 조회합니다.

**요청:**
```http
GET /api/auth/me
Cookie: session_token=YOUR_TOKEN
```

**응답:**
```json
{
  "user": {
    "id": "1234567890",
    "username": "john_doe",
    "isAdmin": false
  }
}
```

**에러:**
- `401`: 로그인되지 않음

---

### GET /api/auth/admin

모든 사용자 목록을 조회합니다. (관리자만)

**요청:**
```http
GET /api/auth/admin
Cookie: session_token=ADMIN_TOKEN
```

**응답:**
```json
{
  "users": [
    {
      "id": "1234567890",
      "username": "john_doe",
      "email": "john@example.com",
      "isAdmin": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**에러:**
- `401`: 로그인되지 않음
- `403`: 관리자 권한 없음

---

### PUT /api/auth/admin

사용자의 관리자 권한을 설정하거나 해제합니다. (관리자만)

**요청:**
```http
PUT /api/auth/admin
Content-Type: application/json
Cookie: session_token=ADMIN_TOKEN

{
  "userId": "1234567890",
  "isAdmin": true
}
```

**응답:**
```json
{
  "message": "관리자 권한이 업데이트되었습니다.",
  "user": {
    "id": "1234567890",
    "username": "john_doe",
    "isAdmin": true
  }
}
```

**에러:**
- `400`: 잘못된 요청
- `401`: 로그인되지 않음
- `403`: 관리자 권한 없음
- `404`: 사용자를 찾을 수 없음

---

## 책 API

### GET /api/books

모든 책 목록을 조회합니다.

**요청:**
```http
GET /api/books
```

**응답:**
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

---

### POST /api/books

새 책을 추가합니다. (관리자만)

**요청:**
```http
POST /api/books
Content-Type: application/json
Cookie: session_token=ADMIN_TOKEN

{
  "title": "책 제목",
  "author": "저자명",
  "coverImage": "https://example.com/image.jpg",
  "rating": 5,
  "review": "리뷰 내용...",
  "publishedDate": "2024-01-01",
  "genre": "소설"
}
```

**요구사항:**
- `title`: 필수
- `author`: 필수
- `coverImage`: 필수, 유효한 URL
- `rating`: 필수, 1-5 사이의 숫자
- `review`: 필수
- `publishedDate`: 선택, YYYY-MM-DD 형식
- `genre`: 선택

**응답:**
```json
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
```

**에러:**
- `400`: 필수 필드 누락
- `401`: 로그인되지 않음
- `403`: 관리자 권한 없음

---

### GET /api/books/[id]

특정 책의 정보를 조회합니다.

**요청:**
```http
GET /api/books/1234567890
```

**응답:**
```json
{
  "id": "1234567890",
  "title": "책 제목",
  "author": "저자명",
  "coverImage": "https://example.com/image.jpg",
  "rating": 5,
  "review": "리뷰 내용...",
  "publishedDate": "2024-01-01",
  "genre": "소설",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**에러:**
- `404`: 책을 찾을 수 없음

---

### PUT /api/books/[id]

책 정보를 수정합니다. (관리자만)

**요청:**
```http
PUT /api/books/1234567890
Content-Type: application/json
Cookie: session_token=ADMIN_TOKEN

{
  "title": "수정된 책 제목",
  "author": "저자명",
  "coverImage": "https://example.com/new-image.jpg",
  "rating": 4,
  "review": "수정된 리뷰 내용...",
  "publishedDate": "2024-01-01",
  "genre": "에세이"
}
```

**응답:**
- 업데이트된 책 정보 (GET과 동일 형식)

**에러:**
- `400`: 필수 필드 누락
- `401`: 로그인되지 않음
- `403`: 관리자 권한 없음
- `404`: 책을 찾을 수 없음

---

### DELETE /api/books/[id]

책을 삭제합니다. (관리자만)

**요청:**
```http
DELETE /api/books/1234567890
Cookie: session_token=ADMIN_TOKEN
```

**응답:**
```json
{
  "message": "책이 삭제되었습니다."
}
```

**에러:**
- `401`: 로그인되지 않음
- `403`: 관리자 권한 없음
- `404`: 책을 찾을 수 없음

---

## 댓글 API

### GET /api/books/[id]/comments

특정 책의 댓글 목록을 조회합니다.

**요청:**
```http
GET /api/books/1234567890/comments
```

**응답:**
```json
[
  {
    "id": "9876543210",
    "author": "댓글 작성자",
    "content": "댓글 내용...",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

**정렬:** 최신순 (createdAt 내림차순)

---

### POST /api/books/[id]/comments

댓글을 추가합니다.

**요청:**
```http
POST /api/books/1234567890/comments
Content-Type: application/json

{
  "author": "댓글 작성자",
  "content": "댓글 내용..."
}
```

**요구사항:**
- `author`: 필수
- `content`: 필수

**응답:**
```json
{
  "id": "9876543210",
  "author": "댓글 작성자",
  "content": "댓글 내용...",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

**에러:**
- `400`: 필수 필드 누락

---

## 테스트 예시

### JavaScript/TypeScript (fetch)

```typescript
// 책 목록 조회
const response = await fetch('http://localhost:3000/api/books');
const books = await response.json();

// 로그인
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'mypassword123'
  }),
  credentials: 'include' // 쿠키 포함
});
const user = await loginResponse.json();

// 책 추가 (로그인 후)
const bookResponse = await fetch('http://localhost:3000/api/books', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    title: '테스트 책',
    author: '테스트 저자',
    coverImage: 'https://example.com/image.jpg',
    rating: 5,
    review: '테스트 리뷰'
  })
});
const newBook = await bookResponse.json();
```

### cURL

```bash
# 책 목록 조회
curl http://localhost:3000/api/books

# 로그인
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"admin","password":"mypassword123"}'

# 책 추가 (쿠키 사용)
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title":"테스트 책",
    "author":"테스트 저자",
    "coverImage":"https://example.com/image.jpg",
    "rating":5,
    "review":"테스트 리뷰"
  }'
```


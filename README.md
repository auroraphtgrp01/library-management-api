# Hệ thống Quản lý Thư viện

Dự án quản lý thư viện được xây dựng với NestJS và Prisma (SQLite).

## Cài đặt

```bash
# Cài đặt dependencies
yarn install

# Generate Prisma Client
npx prisma generate

# Chạy migrations
npx prisma migrate dev

# Chạy ứng dụng
yarn start:dev
```

## Super Admin Account

Khi ứng dụng khởi động lần đầu, hệ thống sẽ tự động tạo một super admin account mặc định:

- **Username**: `admin`
- **Email**: `admin@library.com`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Branch**: Tự động tạo "Chi nhánh Trung tâm" nếu chưa có

⚠️ **LƯU Ý**: Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!

Nếu đã có admin trong hệ thống, hệ thống sẽ bỏ qua việc tạo mới.

## Cấu trúc Database

### Models

- **Branch**: Chi nhánh thư viện
  - id: UUID
  - name: Tên chi nhánh
  
- **User**: Người dùng hệ thống
  - id: UUID
  - username: Tên đăng nhập (unique)
  - email: Email (unique)
  - password: Mật khẩu
  - role: ADMIN | STAFF | MANAGER | READER
  - branchId: ID chi nhánh

- **Book**: Sách
  - id: UUID
  - title: Tên sách
  - author: Tác giả
  - genre: Thể loại
  - description: Mô tả
  - branchId: ID chi nhánh

- **Borrow**: Lượt mượn sách
  - id: UUID
  - userId: ID người mượn
  - bookId: ID sách
  - branchId: ID chi nhánh
  - borrowDate: Ngày mượn
  - returnDate: Ngày trả
  - status: BORROWED | RETURNED

## Phân quyền

### ADMIN
- Toàn quyền trên tất cả các chi nhánh
- CRUD tất cả các resource

### MANAGER
- Toàn quyền trên chi nhánh của mình
- CRUD tất cả các resource (trừ tạo user mới)
- Có quyền đọc danh sách user

### STAFF
- Quyền trên chi nhánh của mình
- Tạo bạn đọc mới (chỉ được tạo role READER)
- Quản lý lượt mượn sách

### READER
- Chỉ có quyền đọc (xem sách, lượt mượn)

## API Endpoints

### Authentication

#### Register (Đăng ký)
- `POST /auth/register` - Đăng ký tài khoản mới (role READER)
  - Body: `{ username: string, email: string, password: string, branchId: string }`
  - Response: `{ user: {...}, access_token: string }`

#### Login (Đăng nhập)
- `POST /auth/login` - Đăng nhập
  - Body: `{ email: string, password: string }`
  - Response: `{ user: {...}, access_token: string }`

#### Sử dụng JWT Token

Tất cả các API yêu cầu header:
```
Authorization: Bearer <access_token>
```

Token được trả về từ `/auth/register` hoặc `/auth/login`.

### Branches

- `GET /branches` - Lấy danh sách chi nhánh (có pagination)
  - Query params: `page`, `limit`
  - Roles: ADMIN, MANAGER, STAFF, READER

- `GET /branches/:id` - Lấy chi tiết chi nhánh
  - Roles: ADMIN, MANAGER, STAFF, READER

- `POST /branches` - Tạo chi nhánh mới
  - Body: `{ name: string }`
  - Roles: ADMIN, MANAGER

- `PATCH /branches/:id` - Cập nhật chi nhánh
  - Body: `{ name?: string }`
  - Roles: ADMIN, MANAGER

- `DELETE /branches/:id` - Xóa chi nhánh
  - Roles: ADMIN

### Users

- `GET /users` - Lấy danh sách user (có pagination)
  - Query params: `page`, `limit`
  - Roles: ADMIN, MANAGER, STAFF
  - Manager/Staff chỉ xem được user trong branch của mình

- `GET /users/:id` - Lấy chi tiết user
  - Roles: ADMIN, MANAGER, STAFF
  - Manager/Staff chỉ xem được user trong branch của mình

- `POST /users` - Tạo user mới
  - Body: `{ username: string, email: string, password: string, role?: UserRole, branchId: string }`
  - Roles: ADMIN, STAFF
  - Staff chỉ được tạo user với role READER

- `PATCH /users/:id` - Cập nhật user
  - Body: `{ username?: string, email?: string, password?: string, role?: UserRole, branchId?: string }`
  - Roles: ADMIN, MANAGER, STAFF
  - Staff không được thay đổi role

- `DELETE /users/:id` - Xóa user
  - Roles: ADMIN, MANAGER

### Books

- `GET /books` - Lấy danh sách sách (có pagination)
  - Query params: `page`, `limit`
  - Roles: ADMIN, MANAGER, STAFF, READER
  - Manager/Staff chỉ xem được sách trong branch của mình

- `GET /books/:id` - Lấy chi tiết sách
  - Roles: ADMIN, MANAGER, STAFF, READER
  - Manager/Staff chỉ xem được sách trong branch của mình

- `POST /books` - Tạo sách mới
  - Body: `{ title: string, author: string, genre: string, description?: string, branchId: string }`
  - Roles: ADMIN, MANAGER

- `PATCH /books/:id` - Cập nhật sách
  - Body: `{ title?: string, author?: string, genre?: string, description?: string, branchId?: string }`
  - Roles: ADMIN, MANAGER

- `DELETE /books/:id` - Xóa sách
  - Roles: ADMIN, MANAGER

### Borrows

- `GET /borrows` - Lấy danh sách lượt mượn (có pagination)
  - Query params: `page`, `limit`
  - Roles: ADMIN, MANAGER, STAFF, READER
  - Manager/Staff chỉ xem được lượt mượn trong branch của mình

- `GET /borrows/:id` - Lấy chi tiết lượt mượn
  - Roles: ADMIN, MANAGER, STAFF, READER
  - Manager/Staff chỉ xem được lượt mượn trong branch của mình

- `POST /borrows` - Tạo lượt mượn mới
  - Body: `{ userId: string, bookId: string, branchId: string }`
  - Roles: ADMIN, MANAGER, STAFF

- `PATCH /borrows/:id` - Cập nhật lượt mượn (trả sách)
  - Body: `{ returnDate?: Date, status?: BorrowStatus }`
  - Roles: ADMIN, MANAGER, STAFF
  - Nếu status = RETURNED, returnDate sẽ tự động được set

- `DELETE /borrows/:id` - Xóa lượt mượn
  - Roles: ADMIN, MANAGER

## Pagination

Tất cả các API GET danh sách đều hỗ trợ pagination:

```
GET /books?page=1&limit=10
```

Response:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

## Ví dụ sử dụng

### 1. Đăng ký tài khoản mới
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "reader1",
    "email": "reader1@example.com",
    "password": "password123",
    "branchId": "<branch-id>"
  }'
```

Response:
```json
{
  "user": {
    "id": "...",
    "username": "reader1",
    "email": "reader1@example.com",
    "role": "READER",
    "branchId": "..."
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Đăng nhập
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "reader1@example.com",
    "password": "password123"
  }'
```

### 3. Tạo chi nhánh (cần token ADMIN hoặc MANAGER)
```bash
curl -X POST http://localhost:3000/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"name": "Chi nhánh Hà Nội"}'
```

### 4. Tạo user (Staff - cần token STAFF hoặc ADMIN)
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "username": "reader2",
    "email": "reader2@example.com",
    "password": "password123",
    "branchId": "<branch-id>"
  }'
```

### 5. Tạo sách (cần token ADMIN hoặc MANAGER)
```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "title": "Sách hay",
    "author": "Tác giả A",
    "genre": "Tiểu thuyết",
    "description": "Mô tả sách",
    "branchId": "<branch-id>"
  }'
```

### 6. Tạo lượt mượn (cần token ADMIN, MANAGER hoặc STAFF)
```bash
curl -X POST http://localhost:3000/borrows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "userId": "<user-id>",
    "bookId": "<book-id>",
    "branchId": "<branch-id>"
  }'
```

### 7. Trả sách (cần token ADMIN, MANAGER hoặc STAFF)
```bash
curl -X PATCH http://localhost:3000/borrows/<borrow-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "status": "RETURNED"
  }'
```

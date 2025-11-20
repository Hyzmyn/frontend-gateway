# API REFERENCE - Microservice Architecture

Tài liệu tham khảo API cho hệ thống Microservice.

---

## ⭐ PHẦN 1 — AUTH SERVICE

### 1. Đăng nhập Admin
```
POST /auth/login
Body:
{
  "identifier": "admin",
  "password": "Pass@123"
}
```
→ Nhận về: accessToken, role = Admin

### 2. Đăng ký User (Admin tạo)
```
POST /auth/register
Header: Authorization: Bearer {{adminToken}}
Body:
{
  "username":"examiner1",
  "email":"ex1@mail.com",
  "fullName":"Examiner One",
  "password":"Pass@123",
  "role":"Examiner"
}
```

### 3. Quên mật khẩu
```
POST /auth/forgot-password
{
  "email":"user@mail.com"
}
```

### 4. Reset mật khẩu
```
POST /auth/reset-password
{
  "email":"user@mail.com",
  "token":"<token>",
  "newPassword":"New@123"
}
```

### 5. Đổi mật khẩu (người dùng đã đăng nhập)
```
POST /auth/change-password
Authorization: Bearer {{anyToken}}
{
  "currentPassword":"Old@123",
  "newPassword":"New@123"
}
```

### 6. Phân quyền User (Admin)
```
PATCH /auth/users/{id}/role
{
  "role":"Manager"
}
```

### 7. Khoá/Mở User
```
PATCH /auth/users/{id}/status
{
  "isActive": true
}
```

### 8. Xem thông tin người dùng
```
GET /auth/me
Authorization: Bearer {{token}}
```

---

## ⭐ PHẦN 2 — STUDENT AUTH

### 1. Student Login
```
POST /auth/student/login
{
  "identifier":"S001",
  "password":"Pass@123"
}
```

### 2. Refresh Token
```
POST /auth/student/refresh
{
  "refreshToken":"<token>"
}
```

### 3. Logout
```
POST /auth/student/logout
{
  "refreshToken":"<token>"
}
```

### 4. Get profile
```
GET /auth/student/me
```

### 5. Student dashboard
```
GET /auth/student/dashboard
```

---

## ⭐ PHẦN 3 — SUBJECTS SERVICE

### 1. Danh sách môn (không cần token)
```
GET /subjects?isActive=true
```

### 2. Chi tiết môn
```
GET /subjects/{id}
```

### 3. Audit Log môn
```
GET /subjects/{id}/auditlog
Authorization: Bearer {{adminOrManager}}
```

### 4. Tạo môn học
```
POST /subjects
Authorization: Bearer {{adminOrManager}}
{
  "code":"CS101",
  "name":"Cơ sở lập trình",
  "description":"Môn nền tảng"
}
```

### 5. Cập nhật môn
```
PUT /subjects/{id}
Authorization: Bearer {{adminOrManager}}
{
  "name":"Lập trình C#",
  "description":"Updated",
  "isActive": true
}
```

### 6. Xoá môn
```
DELETE /subjects/{id}
Authorization: Bearer {{adminOrManager}}
```

### 7. Archive môn
```
PATCH /subjects/{id}/archive
Authorization: Bearer {{adminOrManager}}
```

---

## ⭐ PHẦN 4 — SEMESTERS SERVICE

### 1. Danh sách học kỳ
```
GET /semesters
```

### 2. Chi tiết học kỳ
```
GET /semesters/{id}
```

### 3. Timeline
```
GET /semesters/{id}/timeline
```

### 4. Tạo học kỳ
```
POST /semesters
Authorization: Bearer {{adminOrManager}}
{
  "code":"SPRING2025",
  "name":"Spring 2025",
  "startDate":"2025-02-01",
  "endDate":"2025-06-01"
}
```

### 5. Cập nhật học kỳ
```
PUT /semesters/{id}
Authorization: Bearer {{adminOrManager}}
```

### 6. Khoá kỳ thi
```
POST /semesters/{id}/lock
Authorization: Bearer {{adminOrManager}}
```

### 7. Xoá học kỳ (Admin)
```
DELETE /semesters/{id}
Authorization: Bearer {{admin}}
```

---

## ⭐ PHẦN 5 — EXAMS SERVICE

### 1. Danh sách kỳ thi
```
GET /exams
```

### 2. Chi tiết kỳ thi
```
GET /exams/{id}
```

### 3. Tạo kỳ thi
```
POST /exams
Authorization: Bearer {{adminOrManager}}
```

### 4. Cập nhật kỳ thi
```
PUT /exams/{id}
Authorization: Bearer {{adminOrManager}}
```

### 5. Bật/Tắt anonymous grading
```
PATCH /exams/{id}/anonymous-grading
```

### 6. Cập nhật grading policy
```
PATCH /exams/{id}/grading-policy
```

### 7. Cập nhật lịch thi
```
PATCH /exams/{id}/schedule
```

### 8. Clone exam
```
POST /exams/{id}/clone
```

### 9. Auto assign submissions
```
POST /exams/{id}/auto-assign-submissions
```

### 10. Publish exam (Admin)
```
POST /exams/{id}/publish
```

### 11. Xoá kỳ thi (Admin)
```
DELETE /exams/{id}
```

---

## ⭐ PHẦN 6 — RUBRICS SERVICE

### 1. Lấy rubric theo exam
```
GET /rubrics/{examId}
```

### 2. Tạo rubric
```
POST /rubrics
Authorization: Bearer {{examinerOrManagerOrAdmin}}
```

### 3. Bulk update rubric
```
POST /rubrics/{examId}/bulk
```

### 4. Cập nhật rubric
```
PUT /rubrics/{id}
```

### 5. Đổi thứ tự rubric
```
PATCH /rubrics/{id}/reorder
```

### 6. Xoá rubric
```
DELETE /rubrics/{id}
Authorization: Bearer {{admin}}
```

---

## ⭐ PHẦN 7 — EXAMINERS SERVICE

### 1. Danh sách examiners
```
GET /examiners
```

### 2. Chi tiết examiner
```
GET /examiners/{id}
```

### 3. Xem assignments
```
GET /examiners/{id}/assignments
```

### 4. Tạo examiner
```
POST /examiners
```

### 5. Update examiner
```
PUT /examiners/{id}
```

### 6. Toggle active
```
PATCH /examiners/{id}/status
```

### 7. Assign examiner cho exam
```
POST /examiners/assignments
```

### 8. Xoá assignment
```
DELETE /examiners/{examinerId}/assignments/{assignmentId}
```

---

## ⭐ PHẦN 8 — SUBMISSIONS SERVICE

### 1. Query submissions
```
GET /submissions?examId=<guid>&studentCode=S001&status=3
```

### 2. Lấy submission detail
```
GET /submissions/{id}
```

### 3. Examiner upload submission
```
POST /submissions
```

### 4. Upload artifacts
```
POST /submissions/{id}/artifacts
```

### 5. Chấm bài
```
POST /submissions/{id}/grade
```

### 6. Ghi nhận vi phạm
```
POST /submissions/{id}/violations
```

### 7. Cập nhật trạng thái submission
```
PUT /submissions/{id}/status
```

### 8. Lịch sử chấm
```
GET /submissions/{id}/grades
```

### 9. Moderation
```
POST /submissions/{id}/grade-moderation
```

### 10. Admin assign submission
```
POST /submissions/assignments
```

### 11. Xem conflicts
```
GET /admin/grading-conflicts?examId=<guid>
```

### 12. Handle appeals
```
PATCH /admin/appeals/{appealId}/resolve
```

### 13. Bulk Upload Submissions (RAR)
```
POST /submissions/archives
Query Params: examId (Guid) - Bắt buộc
Form Data: archive (File .rar)
```
Description: Upload file nén chứa bài làm của cả lớp, đề thi và đáp án. Hệ thống tự động:
- Giải nén và lưu file
- Tạo ExamMaterials (Đề, Đáp án)
- Tạo Submissions cho từng sinh viên

### 14. Get Exam Materials
```
GET /submissions/exams/{examId}/materials
Path Params: examId (Guid)
```
Description: Lấy danh sách Đề thi và Đáp án của kỳ thi.
Response: Danh sách ExamMaterialDto chứa DownloadUrl.

### 15. Download File (Secure Stream)
```
GET /submissions/files/materials/{id} (Cho Đề/Đáp án)
GET /submissions/files/artifacts/{id} (Cho Bài làm Sinh viên)
Path Params: id (Guid của Material hoặc Artifact)
Headers: Authorization: Bearer <token>
```
Description: Tải file hoặc xem preview. Trả về file stream.
Frontend dùng URL.createObjectURL(blob) để hiển thị ảnh/PDF.

---

## ⭐ PHẦN 9 — STUDENT SUBMISSIONS

### 1. Student xem bài thi
```
GET /student/exams/{examId}/submission
```

### 2. Student nộp bài
```
POST /student/exams/{examId}/submit
```

### 3. Student xem result
```
GET /student/submissions/{submissionId}/result
```

### 4. Student gửi Appeal
```
POST /student/submissions/{submissionId}/appeal
```

---

## ⭐ PHẦN 10 — ADMIN DASHBOARD SERVICE (OData + KPI)

### KPI & Analytics
```
GET /admin/kpis
GET /admin/audit-log?skip=0&take=100
GET /admin/examiner-progress
GET /admin/grading-conflicts?threshold=2
GET /admin/appeals?status=Pending
POST /admin/reports/export
PUT /admin/appeals/{id}/review
```

### OData
```
GET /odata/SubmissionInsights?$filter=SubjectCode eq 'CS'&$orderby=LastUpdatedUtc desc&$top=50
```

---

## ⭐ PHẦN 11 — NOTIFICATIONS SERVICE

### Gửi event
```
POST /events
{
  "eventType":"custom.event",
  "message":"Test message",
  "payload":{"key":"value"}
}
```

### Health check
```
GET /notifications/health/broker
```

---

## ⭐ PHẦN 12 — GATEWAY

```
GET /health
```

---

## ⭐ PHẦN 13 — SIGNALR HUBS

Không phải REST nhưng phải demo:
- `/dashboard-hub`
- `/notifications-hub`

Dùng SignalR client hoặc Postman WebSocket.

---

## 📌 ENUMS

### SubmissionStatus
- `0` - Pending
- `1` - Uploaded
- `2` - UnderReview
- `3` - Graded
- `4` - Flagged
- `5` - Rejected

### AppealStatus
- `0` - Pending
- `1` - InReview
- `2` - Resolved

### ViolationSeverity
- `0` - None
- `1` - Minor
- `2` - Major
- `3` - Critical

---

## 📝 Notes

- Tất cả endpoints yêu cầu authentication cần header: `Authorization: Bearer <token>`
- Base URL: Được cấu hình trong `.env` file
- API Gateway URL mặc định: `http://localhost:8080/api`

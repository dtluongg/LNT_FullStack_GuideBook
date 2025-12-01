# Hướng dẫn triển khai nhanh — Backend + Frontend

Tập trung vào giải pháp miễn phí, nhanh và thực tế: deploy backend Express (Node) và frontend Vite React. Bao gồm: đẩy lên GitHub, provision DB cloud, deploy backend (Railway/Render), deploy frontend (Vercel/Netlify), xử lý uploads (tùy chọn S3).

**Prerequisites**
- Tài khoản GitHub, Vercel (hoặc Netlify), Railway (hoặc Render), PlanetScale nếu muốn MySQL cloud.
- Git cài trên máy, Node.js và npm.
- Có quyền truy cập vào repo project (backend và frontend có thể cùng repo hoặc tách).

**1) Chuẩn bị mã nguồn và push lên GitHub**
- Mở `cmd.exe` trong thư mục gốc project (chứa `backend/` và `my-react-test/`).

Commands:
```cmd
cd L:\LNT\LNT_FullStack_GuideBook
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com\<your-username>\<repo>.git
git push -u origin main
```

Ghi chú: nếu đã có repo trên GitHub thì chỉ cần `git remote add` rồi `git push`.

**2) Chuẩn bị backend trước deploy**
- Mở file `backend/src/app.js` và thay phần CORS hard-coded bằng `process.env.FRONTEND_URL`.

Ví dụ thay đổi (tham khảo):
```js
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));
```

- Kiểm tra `backend/src/config/database.js` để đảm bảo dùng env vars: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- Đảm bảo `package.json` backend có script `start` (bạn có sẵn `node server.js`).
- Tạo `.env` cục bộ cho phát triển (không commit):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=...
DB_NAME=guidebook
JWT_SECRET=your_secret_here
FRONTEND_URL=http://localhost:5173
```

**3) Tạo database cloud và import dữ liệu**
- Tùy chọn provider (đề xuất):
  - PlanetScale (MySQL, free tier)
  - Railway (MySQL/Postgres tích hợp, dễ dùng)
  - Render

- Sau khi tạo DB, lấy host/user/password và import SQL (nếu bạn có `sql_v4.sql`):
```cmd
mysql -h <HOST> -u <USER> -p <DBNAME> < path\to\sql_v4.sql
```
(Nhập mật khẩu khi được hỏi)

- Hoặc dùng GUI/web UI của provider để import file SQL.

**4) Deploy backend (ví dụ dùng Railway)**
A. Railway — nhanh và miễn phí (dùng web):
1. Đăng nhập Railway, chọn "New Project -> Deploy from GitHub".
2. Kết nối repo và chọn folder `backend` (nếu repo chứa nhiều folder, Railway cho chọn root build settings).
3. Railway sẽ detect Node.js. Trong Railway Dashboard -> Environment -> Add Variables, thêm:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET`
   - `FRONTEND_URL` = URL frontend (sẽ deploy bước sau)
4. Deploy. Railway sẽ cho bạn URL backend (ví dụ `https://my-backend.up.railway.app`).

B. Kiểm tra logs và endpoints:
- Trên Railway Dashboard -> Logs, kiểm tra server khởi động thành công.
- Mở `https://<your-backend>/api/test` (nếu bạn có route test) để xác thực.

Ghi chú uploads: Container hosting thường ephemeral — file lưu trong `uploads/` có thể mất khi redeploy. Nếu cần lưu trữ lâu dài, chuyển sang S3.

**5) (Optional) Di chuyển `uploads` lên S3 / Spaces**
- Tạo bucket trên AWS S3 hoặc DigitalOcean Spaces.
- Thiết lập quyền (public hoặc private + presigned URLs).
- Cài `aws-sdk` (v3) hoặc `@aws-sdk/client-s3` và thay layer multer để upload trực tiếp lên S3.
- Env vars cần: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `S3_REGION`.

Nếu bạn muốn, tôi có thể tạo patch thay đổi mã upload để dùng S3.

**6) Deploy frontend (Vite React) — ví dụ Vercel**
A. Chuẩn bị build locally:
```cmd
cd my-react-test
npm install
npm run build
npm run preview   # kiểm thử production build (vite preview)
```

B. Vercel (gợi ý):
1. Đăng nhập Vercel -> Import Project -> Git Repository.
2. Chọn folder `my-react-test` nếu repo mono-repo.
3. Trong phần Environment Variables, thêm:
   - `VITE_API_URL=https://<your-backend-url>`
4. Deploy. Vercel sẽ xây dựng và cung cấp URL site.

Netlify có quy trình tương tự (set biến môi trường `VITE_API_URL`).

**7) Cập nhật CORS backend để cho phép domain mới**
- Sau khi frontend có URL (ví dụ `https://your-frontend.vercel.app`), đặt `FRONTEND_URL` trên Railway/Render bằng URL này.
- Hoặc dùng wildcard/array gồm nhiều origin nếu cần.

**8) Kiểm thử cuối**
- Trên browser, mở frontend URL và test:
  - Những API gọi thành công (mạng tab DevTools -> Network)
  - Ảnh hiển thị (kiểm tra URL ảnh trả về)
  - Đăng nhập: token được lưu (cookie/localStorage) và truy vấn có Authorization header
- Nếu lỗi, kiểm tra logs backend (Railway/Render) và build logs frontend (Vercel/Netlify).

**9) Một vài mẹo & các vấn đề thường gặp**
- CORS: nếu báo lỗi CORS, backend chưa include origin chính xác hoặc credentials mismatch. Bật `credentials: true` nếu frontend gửi cookie.
- Upload files: nếu ảnh không tồn tại sau redeploy => cần S3.
- JWT: đảm bảo `JWT_SECRET` trên production giống hoặc hợp lệ.
- Migrate DB: provider như PlanetScale yêu cầu kiểm tra branch/schema rules khi push migration.

**10) Rollback & Maintenance**
- Railway/Vercel cho phép rollback bản deploy trước.
- Luôn backup DB trước khi chạy scripts thay đổi schema.

---
Nếu bạn muốn, tôi sẽ tiếp tục và thực hiện một trong các bước sau (chọn 1):
- A: Patch `backend/src/app.js` để dùng `process.env.FRONTEND_URL` cho CORS.
- B: Viết code chuyển uploads sang S3 (thay multer storage) và thêm hướng dẫn cấu hình env.
- C: Viết `README-deploy.md` chi tiết từng bước với ảnh chụp màn hình (yêu cầu bạn cung cấp vài screenshot nếu muốn).
- D: Hướng dẫn từng bước tôi click trên Railway + Vercel (mô tả từng màn hình).

Chọn A/B/C/D hoặc yêu cầu khác, tôi sẽ tiếp tục.

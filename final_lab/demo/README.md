# HCMC Smart Traffic IOC

Dashboard mô phỏng giao thông TP.HCM, có hai cách chạy: HTTP server phục vụ JSON tĩnh hoặc Nginx + FastAPI + PostgreSQL qua Docker Compose. Các kịch bản What-If là mô phỏng minh họa; dữ liệu không phải luồng cảm biến trực tiếp.

## Dòng xe 24 giờ

Màn hình mặc định tập trung vào xe chuyển động trên các đoạn đường có dữ liệu, mở đầu tại cụm Lý Thường Kiệt – Quận 10. Có thể đổi sang trục Cộng Hòa, Gò Vấp hoặc Quận 12, rồi chọn từng tuyến để xem gần hơn. Bản đồ tự lấy phạm vi từ hình học của các đoạn đã chọn.

- Nút phát/tạm dừng điều khiển cả xe và timeline. Chu kỳ chạy từ 00:00 đến 23:30 rồi lặp lại; có thể kéo đến một giờ bất kỳ.
- Các mức 1x/2x/4x điều khiển tốc độ phát ngày; vận tốc xe minh họa vẫn phụ thuộc LOS tại giờ đang chọn. Ở 1x, một ngày hoàn chỉnh mất khoảng 115 giây.
- Tốc độ và khoảng cách xe được quy ước theo LOS A–F. Xe lặp trên từng đoạn; không suy luận hành trình xuyên mạng đường, số lượng xe thực, chiều lưu thông hay lưu lượng từ dữ liệu LOS.
- Chỉ số chỉ tính trên các đoạn đang được chọn. Tốc độ mô phỏng là trung bình theo chiều dài hình học, không phải vận tốc cảm biến.
- Trình duyệt có tùy chọn giảm chuyển động sẽ khởi đầu tạm dừng; người xem có thể chủ động bấm phát. Tab ẩn tạm ngưng cả đồng hồ và vẽ xe.
- “Công cụ khác” mở lại các bảng phân tích, chính sách và định tuyến.

`flow-model.js` chứa hình học và quy tắc dữ liệu; `vehicle-flow.js` vẽ xe bằng một canvas; `config.js` tập trung phạm vi khu vực, tốc độ, khoảng cách và thời gian phát. Các vị trí ngoài vùng đã chọn không được dựng thành xe giả trên đường không có dữ liệu.

## Cấu trúc mã nguồn

- `index.html`, `style.css`: markup và CSS, dùng chung cho static và Docker.
- `config.js`: đường dẫn API, JSON dự phòng và timeout kết nối.
- `data.js`: tải và kiểm tra dữ liệu; tự chuyển sang JSON khi API lỗi hoặc quá hạn.
- `app.js`: Leaflet, trạng thái dashboard, bộ lọc và mô phỏng trên trình duyệt.
- `traffic_data.json`: dữ liệu chuẩn duy nhất, cũng được backend đọc để khởi tạo database.
- `frontend/`: Dockerfile và reverse proxy Nginx; không lưu bản sao frontend.
- `backend/`: `routers/` → `services/` → `crud/`; `schemas/` kiểm tra hợp đồng dữ liệu, `database_models/` định nghĩa ORM, `config/` quản lý biến môi trường, `db/` quản lý session.

Frontend dùng `/api/traffic/data` để tải dataset khi API khả dụng. Bộ mô phỏng tương tác trong dashboard chạy trên trình duyệt; API mô phỏng cũng có thể được gọi độc lập bằng Swagger hoặc HTTP client.

## Chạy Docker

Từ thư mục gốc repository:

```bash
cd final_lab/demo
cp .env.example .env
docker compose up -d --build
```

| Dịch vụ | Địa chỉ mặc định |
| --- | --- |
| Dashboard | http://localhost:8080 |
| Swagger qua Nginx | http://localhost:8080/docs |
| Health qua Nginx | http://localhost:8080/api/health |
| Backend trực tiếp | http://localhost:8001/docs |
| PostgreSQL | localhost:5433 |

Đổi cổng bằng `FRONTEND_PORT`, `BACKEND_PORT`, `DB_PORT`; đổi database bằng `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` trong `.env`. Cấu hình mẫu dùng thông tin đăng nhập dành cho phát triển cục bộ.

```bash
docker compose logs -f
docker compose down
```

PostgreSQL lưu trong volume `postgres_data`. `make clean` xóa cả volume và dữ liệu. Backend tạo bảng và seed khi database chưa có segment; restart không ghi đè dữ liệu đã nạp. Schema được dùng cho database mới, chưa có cơ chế migration tự động cho database từ phiên bản khác.

## Chạy không dùng Docker

Chỉ chạy frontend từ thư mục gốc repository:

```bash
python -m http.server 8080 --directory final_lab/demo
```

Mở http://localhost:8080. Cần HTTP server để trình duyệt tải JSON; mở file bằng `file://` có thể bị chặn. Thư viện CDN và bản đồ nền cần kết nối mạng.

Chạy backend cục bộ ở terminal khác:

```bash
python -m pip install -r final_lab/demo/backend/requirements.txt
cd final_lab/demo/backend
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

Backend mặc định dùng SQLite tại `demo/traffic.db`. Khi chạy bằng HTTP server riêng, frontend vẫn dùng JSON tĩnh; muốn frontend gọi backend cục bộ, đổi `apiUrl` trong `config.js` thành `http://localhost:8001/api/traffic/data`. CORS mặc định cho phép `http://localhost:8080` và `http://127.0.0.1:8080`.

Cấu hình backend đọc từ biến môi trường hoặc `demo/.env`: `DATABASE_URL`, `SEED_DATA_PATH`, `ENVIRONMENT`, `API_PREFIX`, `CORS_ORIGINS` (mảng JSON). Docker Compose tự truyền URL PostgreSQL và đường dẫn seed vào container.

## API

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/health` | Readiness; HTTP 503 nếu database không phản hồi |
| GET | `/api/traffic/data` | Dataset đầy đủ, cùng hợp đồng với JSON tĩnh |
| GET | `/api/traffic/segments` | Lọc `type`, `only_severe`, `hour` từ 0 đến 23 |
| GET | `/api/traffic/hotspots` | Điểm nóng ùn tắc |
| GET | `/api/traffic/kpis` | KPI lấy từ dữ liệu gốc |
| GET | `/api/traffic/hourly` | Chỉ số theo 24 giờ |
| GET | `/api/routing/scenarios` | Kịch bản so sánh định tuyến |
| POST | `/api/simulation/policy` | Mô phỏng What-If bằng `adaptive`, `tidal`, `noLeft`, `current_hour` |

`only_severe=true` lọc LOS E/F tại `hour` nếu có, hoặc theo `dominant_los` nếu không truyền giờ. `current_hour` chấp nhận giờ thập phân từ 0 đến dưới 24.

## Kiểm thử

Từ thư mục gốc repository:

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -q
node --test tests/*.cjs
ruff check .
ruff format --check .
```

Kiểm thử API dùng SQLite tạm, nạp đủ dataset, đối chiếu dữ liệu gốc và kiểm tra bộ lọc, validation, mô phỏng, health check. Kiểm thử JavaScript xác nhận API, JSON dự phòng, lỗi mạng, JSON sai và timeout.

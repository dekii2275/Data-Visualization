# Data Visualization

Kho bài thực hành và đồ án môn Trực quan hóa Dữ liệu. Đồ án cuối kỳ xây dựng dashboard mô phỏng giao thông TP.HCM từ dữ liệu quan sát, kèm notebook EDA, báo cáo và slide.

## Cấu trúc

```text
lab01/, lab02/                 Bài thực hành và notebook
final_lab/
  data/raw/                   Dữ liệu CSV gốc dùng cho phân tích
  scripts/                    Tiền xử lý, sinh biểu đồ và kịch bản định tuyến
  demo/
    index.html, style.css     Markup và giao diện dashboard
    config.js, data.js        Cấu hình và tải dữ liệu API/JSON
    flow-model.js             Hình học và tính toán dòng xe
    vehicle-flow.js           Vẽ dòng xe bằng canvas
    app.js                    Bản đồ, tương tác và mô phỏng trên trình duyệt
    traffic_data.json         Nguồn dữ liệu dùng chung cho static và Docker
    backend/                  FastAPI: config, schemas, routers, services, crud, db
    frontend/                 Dockerfile và cấu hình Nginx
  eda_report/, slides/        Báo cáo và slide thuyết trình
scripts/                      Công cụ cập nhật biểu đồ notebook
tests/                       Kiểm thử API và tải dữ liệu frontend
```

## Chạy nhanh

Yêu cầu Python 3.11+; Docker Compose nếu chạy đủ ba tầng.

Chạy dashboard, slide và báo cáo tĩnh từ thư mục gốc:

```bash
python -m http.server 8080 --directory final_lab
```

Mở [dashboard](http://localhost:8080/demo/), [slide](http://localhost:8080/slides/) hoặc thư mục báo cáo tại `http://localhost:8080/eda_report/`. Dashboard dùng JSON tĩnh khi API không khả dụng; bản đồ nền và thư viện CDN vẫn cần mạng.

Chạy Nginx, FastAPI và PostgreSQL:

```bash
cd final_lab/demo
cp .env.example .env
docker compose up -d --build
```

Mở [dashboard Docker](http://localhost:8080) và [Swagger UI](http://localhost:8080/docs). Xem [hướng dẫn ứng dụng](final_lab/demo/README.md) về cấu hình, API và chạy backend không dùng Docker.

## Phân tích và tái tạo dữ liệu

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
jupyter lab
```

Các notebook chính: [Lab 01](lab01/process_and_eda.ipynb), [Lab 02](lab02/process_and_eda_v2.ipynb), [đồ án cuối kỳ](final_lab/process_and_eda.ipynb).

```bash
# Sinh biểu đồ và traffic_data.json; sau đó bổ sung kịch bản định tuyến.
python final_lab/scripts/prepare_data_and_charts.py
python final_lab/scripts/generate_routing_data.py

# Cập nhật hai biểu đồ LOS và các cell tương ứng trong notebook.
python scripts/update_eda_chart.py
```

Các lệnh trên ghi lại dữ liệu hoặc biểu đồ đầu ra. Chạy từ bất kỳ thư mục nào; đường dẫn đầu vào được tính từ vị trí script.

## Dữ liệu đi kèm GitHub

Toàn bộ 7 CSV trong `lab01/data/raw/`, `lab02/data/raw/`, `final_lab/data/raw/` và JSON phục vụ dashboard đều được lưu trực tiếp trong Git. Không cần tải dataset riêng sau khi clone. Xem [danh mục dữ liệu](data-manifest.json) và [mô tả dữ liệu giao thông](final_lab/data/README.md).

`python scripts/validate_data.py` kiểm tra danh mục, kích thước, SHA-256 và cấu trúc dữ liệu. Sau khi chủ động thay đổi dataset, chạy `python scripts/validate_data.py --write` rồi commit cả data lẫn manifest. JSON đã xử lý được xuất tại `final_lab/demo/traffic_data.json` để dùng chung cho bản tĩnh và Docker.

## Kiểm tra mã nguồn

```bash
python -m pip install -r requirements-dev.txt
ruff check .
ruff format --check .
python -m pytest -q
python scripts/validate_data.py
node --test tests/*.cjs
docker compose -f final_lab/demo/docker-compose.yml config --quiet
```

Node.js 22 dùng cho kiểm thử JavaScript; ứng dụng frontend không cần bước build. GitHub Actions chạy các kiểm tra trên khi push hoặc mở pull request. Dùng `ruff format .` để định dạng Python.

Quy ước tổ chức mã nằm trong [AGENTS.md](AGENTS.md): router chỉ xử lý HTTP, service giữ nghiệp vụ, CRUD truy cập database, schema kiểm tra dữ liệu và config quản lý cấu hình. Tệp `.env`, database cục bộ và công cụ AI trên máy được bỏ qua bởi Git.

Xem thêm [đồ án cuối kỳ](final_lab/README.md), [bản tổng hợp dữ liệu](final_lab/minhanh_tonghop.md) và [giấy phép](LICENSE).

# TỔNG HỢP NỘI DUNG & DỮ LIỆU ĐỒ ÁN CUỐI KỲ: TRỰC QUAN HÓA DỮ LIỆU (DATA VISUALIZATION)
## ĐỀ ÁN: QUẢN LÝ GIAO THÔNG THÍCH ỨNG THỜI GIAN THỰC TP. HỒ CHÍ MINH (HCMC SMART TRAFFIC IOC)

---

## 1. TỔNG QUAN ĐỀ TÀI & BỘ DỮ LIỆU

Bộ dữ liệu trong thư mục `final_lab` là dữ liệu thực tế về mạng lưới và trạng thái lưu thông của các dòng phương tiện tại **TP. Hồ Chí Minh**. Dữ liệu được sử dụng để phân tích thực trạng ùn tắc giao thông đô thị, tìm ra các nút thắt cổ chai trọng điểm, và xây dựng mô hình điều hành giao thông thích ứng thông minh (Smart Traffic Digital Twin / Trung tâm IOC).

---

## 2. BẢNG CHI TIẾT CÁC TỆP DỮ LIỆU TRONG THƯ MỤC `data/`

| Tên tệp | Quy mô | Nội dung chính | Các trường dữ liệu quan trọng |
| :--- | :--- | :--- | :--- |
| **`train.csv`** | **33.441** dòng | Dữ liệu quan sát trạng thái dòng xe đô thị theo thời gian thực | `segment_id`, `date`, `weekday`, `period` (khung giờ 30 phút), `LOS` (Level of Service: A đến F), `s_node_id`, `e_node_id`, `length`, `street_name`, `street_type`, `lat_snode`, `long_snode`, `lat_enode`, `long_enode`. |
| **`segment_status.csv`** | **90.938** dòng | Dữ liệu cảm biến vận tốc tức thời từ thiết bị hành trình | `updated_at`, `segment_id`, `velocity` (vận tốc tức thời đo bằng km/h). |
| **`segments.csv`** | **84.633** dòng | Bảng danh mục các phân đoạn đường (cạnh mạng lưới đồ thị) | `_id`, `s_node_id`, `e_node_id`, `length`, `max_velocity`, `street_level`, `street_name`, `street_type`. |
| **`streets.csv`** | **695** tuyến | Danh mục các tuyến đường chính tại TP.HCM | `_id`, `name`, `level`, `type`, `max_velocity`. |
| **`nodes.csv`** | **577.967** nút | Tọa độ không gian các nút giao và đỉnh đồ thị mạng lưới | `_id`, `long` (kinh độ), `lat` (vĩ độ). |

---

## 3. CÁC PHÁT HIỆN CỐT LÕI TỪ PHÂN TÍCH KHÁM PHÁ DỮ LIỆU (EDA)

1. **Phân phối cấp phục vụ (LOS):**
   - Cấp A (thông thoáng): **39,7%** (chủ yếu ban đêm, rạng sáng và đường vành đai).
   - Cấp B, C, D (dòng xe bắt đầu đông): **36,7%**.
   - Cấp E & F (ùn tắc nghiêm trọng và tê liệt): Chiếm tới **23,6%** toàn mạng lưới (gần 1/4 thời gian hoạt động nằm trong tình trạng quá tải).
2. **Động học thời gian & 2 đỉnh cao điểm:**
   - **Đỉnh cao điểm chiều (16h30 – 19h30):** Tỷ lệ kẹt xe nghiêm trọng vọt lên **38,2%** (gấp 3,8 lần so với ban đêm).
   - **Đỉnh cao điểm sáng (06h30 – 09h00):** Tỷ lệ kẹt xe nghiêm trọng đạt **30,8%**.
   - Ngày thường (Thứ 2 – Thứ 6) xuất hiện 2 đỉnh sắc nét tại đầu và cuối giờ làm việc; cuối tuần áp lực giao thông phân tán từ 10h00 đến 21h00 tại khu vực thương mại.
3. **Nghịch lý phân cấp đường bộ:**
   - Đường trục chính (`trunk` như Quốc Lộ 1) có tỷ lệ thông thoáng cao (**68,4%** LOS A).
   - Đường cấp 1 (`primary`) và đường nhánh (`tertiary`) chịu áp lực kẹt xe lớn nhất (**> 26,5%** LOS E-F).
   - **Tâm chấn ùn tắc:** Cụm Quận 10 & Tân Bình gồm các trục *Lý Thường Kiệt, Tô Hiến Thành, 3 Tháng 2, Hoàng Văn Thụ, Thành Thái*.
4. **Động học vận tốc thực tế:**
   - Vận tốc trung vị thực tế chỉ đạt **17,0 km/h** (thấp hơn 57,5% so với vận tốc thiết kế đô thị 40 km/h).
   - **25,0%** số mẫu đo vận tốc ghi nhận $\le 2\text{ km/h}$ (phương tiện chôn chân tại chỗ hoặc nhích từng mét qua nút giao).

---

## 4. CHỈ MỤC CÁC SẢN PHẨM & TÀI LIỆU TRONG DỰ ÁN

| Sản phẩm | Vị trí lưu trữ | Mô tả |
| :--- | :--- | :--- |
| **Jupyter Notebook EDA** | `process_and_eda.ipynb` | Toàn bộ mã nguồn kiểm tra dữ liệu sơ bộ, tiền xử lý và 6 phân tích EDA chuyên sâu kèm biểu đồ. |
| **Quyển Báo Cáo Tư Vấn** | `eda_report/Bao_Cao_Tu_Van_Chien_Luoc_Giao_Thong_TPHCM.md` | Báo cáo tư vấn chuyên sâu đệ trình Sở GTVT TP.HCM (kèm bản in HTML chất lượng cao). |
| **Bộ Slide Thuyết Trình** | `slides/index.html` | Web Presentation tương tác trình chiếu, hỗ trợ phím mũi tên, lời thoại diễn giả (Speaker Notes) và chế độ Fullscreen. |
| **Web Dashboard IOC Demo** | `demo/index.html` | Bản đồ số giao thông thời gian thực Leaflet Dark Mode, thanh trượt 24h, và bảng mô phỏng What-If tối ưu đèn AI thích ứng. |
| **Script xử lý & xuất biểu đồ** | `scripts/prepare_data_and_charts.py` | Script Python tự động trích xuất dữ liệu mẫu và vẽ 7 bộ biểu đồ phân tích cho báo cáo. |

---

## 5. HƯỚNG DẪN KHỞI CHẠY TRỰC TIẾP CÁC SẢN PHẨM TRÊN TRÌNH DUYỆT

Chạy lệnh máy chủ từ thư mục `final_lab`:
```bash
python3 -m http.server 8080 --directory final_lab
```

Truy cập các địa chỉ:
* **Web Dashboard IOC:** [http://localhost:8080/demo/](http://localhost:8080/demo/)
* **Slide Thuyết Trình:** [http://localhost:8080/slides/](http://localhost:8080/slides/)
* **Bản In Báo Cáo HTML:** [http://localhost:8080/eda_report/Bao_Cao_Tu_Van_Chien_Luoc_Giao_Thong_TPHCM.html](http://localhost:8080/eda_report/Bao_Cao_Tu_Van_Chien_Luoc_Giao_Thong_TPHCM.html)

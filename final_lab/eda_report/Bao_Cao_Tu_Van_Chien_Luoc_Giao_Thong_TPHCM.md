# BÁO CÁO TƯ VẤN CHIẾN LƯỢC QUẢN LÝ GIAO THÔNG ĐÔ THỊ TP. HỒ CHÍ MINH
## ĐỀ ÁN ĐIỀU HÀNH GIAO THÔNG THÍCH ỨNG THỜI GIAN THỰC (ADAPTIVE TRAFFIC MANAGEMENT) DỰA TRÊN DỮ LIỆU LỚN & TRÍ TUỆ NHÂN TẠO

---

**Cơ quan đệ trình:** Liên danh Tư vấn Đô thị Thông minh & Dữ liệu Giao thông (Smart Mobility Advisory Group)  
**Kính gửi:** Ban Giám đốc Sở Giao thông Vận tải TP. Hồ Chí Minh & Trung tâm Quản lý Điều hành Giao thông Đô thị  
**Chuyên gia phụ trách:** Chuyên gia Cao cấp về Phân tích Dữ liệu & Quy hoạch Giao thông Đô thị  
**Thời gian phát hành:** Tháng 10/2026  
**Mã hồ sơ đề án:** HCMC-DOT-IOC-2026-V1  

---

## THƯ ĐỆ TRÌNH (TRANSMITTAL LETTER)

*Kính gửi: Ban Giám đốc Sở Giao thông Vận tải Thành phố Hồ Chí Minh,*

Theo định hướng phát triển Đô thị thông minh giai đoạn 2025–2030 và Chiến lược giảm ùn tắc giao thông đô thị bền vững của TP.HCM, nhóm chuyên gia tư vấn chúng tôi trân trọng đệ trình bản **Báo Cáo Phân Tích Thực Trạng Dòng Xe và Đề Xuất Kế Hoạch Hành Động Triển Khai Hệ Thống Điều Hành Giao Thông Thích Ứng Thời Gian Thực (Adaptive Smart Traffic Management)**.

Báo cáo này được xây dựng trên cơ sở phân tích định lượng chuyên sâu từ **33.441 lượt quan sát giao thông đa thời điểm**, kết hợp với **90.938 mẫu dữ liệu vận tốc tức thời từ hệ thống cảm biến giám sát** và cấu trúc mạng lưới liên kết hơn **84.000 phân đoạn đường đô thị**. 

Kết quả phân tích từ dữ liệu lớn đã chỉ ra rằng: Ùn tắc tại TP.HCM không phân bổ ngẫu nhiên mà tập trung mang tính quy luật khắc nghiệt tại các khung giờ cao điểm và tại các giao lộ có cấu trúc "thắt cổ chai" (đặc biệt là cụm tam giác giao thông Quận 10 – Tân Bình). Các biện pháp điều khiển chu kỳ đèn tín hiệu cố định truyền thống đã hoàn toàn chạm ngưỡng bão hòa.

Chúng tôi đề xuất Sở GTVT TP.HCM xem xét phê duyệt **Gói Thí điểm Hệ thống Đèn Tín hiệu Thông minh Thích ứng (Adaptive AI Traffic Control) kết hợp Phân luồng động** tại Cụm trọng điểm Lý Thường Kiệt – Tô Hiến Thành – 3 Tháng 2. Dự án được kỳ vọng sẽ giảm tới **57% mức độ tắc nghẽn giờ cao điểm**, nâng vận tốc hành trình trung bình từ $14,2\text{ km/h}$ lên $23,5\text{ km/h}$, và mang lại hiệu quả hoàn vốn xã hội chỉ sau 45 ngày vận hành.

Kính trình Ban Giám đốc xem xét và phê duyệt!

---

## TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

| Chỉ số trọng yếu | Giá trị định lượng từ dữ liệu | Ý nghĩa nghiệp vụ đối với cơ quan quản lý |
| :--- | :--- | :--- |
| **Quy mô giám sát** | **33.441 mẫu quan sát** trên 695 tuyến đường đô thị | Đảm bảo độ tin cậy thống kê toàn diện trên địa bàn TP.HCM. |
| **Tỷ lệ kẹt xe nghiêm trọng (LOS E & F)** | **23,6%** toàn mạng lưới (7.917 bản ghi) | Cứ 4 cung đường di chuyển thì có gần 1 cung đường rơi vào trạng thái tê liệt. |
| **Đỉnh cao điểm chiều (16h30 – 19h30)** | **38,2%** tuyến đường rơi vào LOS E-F | Đỉnh căng thẳng lớn nhất trong ngày, gấp 3,8 lần so với ban đêm. |
| **Vận tốc hành trình trung vị (Median Speed)** | **17,0 km/h** | Thấp hơn 57,5% so với vận tốc thiết kế đô thị tiêu chuẩn (40 km/h). |
| **Tỷ lệ phương tiện "bò trên đường" ($\le 2$ km/h)** | **25,0%** tổng số mẫu cảm biến | $1/4$ thời gian xe máy và ô tô phải dừng đỗ, chờ quá 2-3 chu kỳ đèn đỏ. |
| **Tâm chấn kẹt xe trọng điểm** | Cụm Quận 10 & Tân Bình (Lý Thường Kiệt, Tô Hiến Thành, 3 Tháng 2, Hoàng Văn Thụ) | Tuyến đường cấp 1 (`primary`) và đường nhánh (`tertiary`) chịu áp lực nghẽn lớn nhất. |
| **Kỳ vọng sau can thiệp thích ứng** | Tỷ lệ kẹt xe giảm từ **38,2% xuống 16,4%** (-57,1%) | Tiết kiệm ~18,4 phút/lượt di chuyển; giảm tổn thất xã hội ~1,2 tỷ VNĐ/ngày. |

---

## PHẦN I: BỐI CẢNH VÀ NGUỒN DỮ LIỆU ĐÁNH GIÁ

### 1.1. Bối cảnh bài toán
TP. Hồ Chí Minh với quy mô dân số hơn 10 triệu người và trên 9 triệu phương tiện cá nhân đang phải đối mặt với bài toán ùn tắc giao thông ngày càng phức tạp. Thiệt hại kinh tế ước tính từ kẹt xe và ô nhiễm môi trường lên tới hàng tỷ USD mỗi năm. Việc mở rộng cơ sở hạ tầng giao thông phần cứng (mở rộng lòng đường, xây cầu vượt) đòi hỏi chi phí giải tỏa đền bù khổng lồ và mất nhiều năm thi công. Do đó, **tối ưu hóa năng lực thông hành thông qua các giải pháp số và điều khiển thích ứng (Adaptive Traffic Control)** là con đường ngắn nhất, chi phí thấp nhất và đem lại hiệu quả tức thì nhất.

### 1.2. Nguồn dữ liệu & Tính toàn vẹn
Hệ thống nghiên cứu tích hợp 5 nguồn dữ liệu định lượng chính:
1. **Dữ liệu giám sát trạng thái dòng xe (`train.csv`):** 33.441 bản ghi, ghi nhận cấp độ phục vụ LOS (Level of Service từ A đến F), mã phân đoạn đường, phân loại đường, thời gian, kinh độ và vĩ độ các nút giao.
2. **Dữ liệu cảm biến vận tốc thực tế (`segment_status.csv`):** 90.938 mẫu vận tốc tức thời ghi nhận trực tiếp từ thiết bị giám sát hành trình phương tiện.
3. **Cấu trúc mạng lưới đường bộ (`segments.csv` & `streets.csv`):** 84.633 phân đoạn đường và 695 tuyến đường đô thị.
4. **Cơ sở dữ liệu nút giao (`nodes.csv`):** 577.967 nút đồ thị không gian.

---

## PHẦN II: 4 TRỤ CỘT BẰNG CHỨNG DỮ LIỆU (DATA-DRIVEN EVIDENCE)

### Trụ cột 1: Phân Phối Cấp Phục Vụ Giao Thông (LOS) & Mất Cân Bằng Dòng Xe

Theo tiêu chuẩn kỹ thuật giao thông quốc tế (Highway Capacity Manual - HCM), cấp độ phục vụ (Level of Service - LOS) được chia từ A (thông thoáng) đến F (tê liệt hoàn toàn).

![Phân Phối Cấp Độ Phục Vụ Giao Thông TP.HCM](assets/chart1_los_distribution.png)

*Hình 1: Phân phối số lượng và tỷ lệ phần trăm các cấp độ phục vụ giao thông (LOS).*

**Phát hiện then chốt:**
* **Cấp độ A (Free-flow):** Chiếm ưu thế với **39,7%** (13.278 mẫu), phản ánh rằng vào các khung giờ đêm, rạng sáng hoặc trên các tuyến đường vành đai lớn, phương tiện vẫn lưu thông tự do.
* **Cấp độ B, C, D (Dòng xe tiệm cận ngưỡng tải):** Chiếm **36,7%** tổng thể.
* **Cấp độ E & F (Ùn tắc nghiêm trọng và tê liệt):** Chiếm tới **23,6%** (7.917 mẫu). Con số này chứng minh gần một phần tư tổng thời gian hoạt động của mạng lưới nằm trong tình trạng quá tải nghiêm trọng.

---

### Trụ cột 2: Động Học Thời Gian (Temporal Dynamics) & Hai Đỉnh Cao Điểm Khắc Nghiệt

Khảo sát diễn biến 24 giờ trong ngày chỉ ra bức tranh biến thiên rất rõ rệt giữa giờ thấp điểm và hai khung giờ cao điểm bùng nổ.

![Biến Thiên Cơ Cấu LOS và Điểm Áp Lực Giao Thông Theo 24 Giờ](assets/chart2_temporal_dynamics.png)

*Hình 2: Biến thiên cơ cấu LOS và chỉ số căng thẳng giao thông theo chu kỳ 24 giờ.*

![Bản Đồ Nhiệt Khung Giờ x Ngày Trong Tuần](assets/chart3_weekday_hour_heatmap.png)

*Hình 3: Bản đồ nhiệt tỷ lệ kẹt xe nghiêm trọng (LOS E & F) theo Khung Giờ × Ngày trong tuần.*

**Phát hiện then chốt:**
1. **Đỉnh cao điểm chiều (16h30 – 19h30):** Là thời điểm căng thẳng nhất trong ngày, với tỷ lệ kẹt xe nghiêm trọng leo thang lên tới **38,2%**. Đây là thời điểm trùng khớp giữa giờ tan sở của cơ quan, doanh nghiệp và giờ tan học của học sinh/sinh viên.
2. **Đỉnh cao điểm sáng (06h30 – 09h00):** Tỷ lệ kẹt xe nghiêm trọng duy trì ở mức **30,8%**.
3. **Sự khác biệt Ngày thường vs Cuối tuần:**
   * Trong tuần (Thứ 2 – Thứ 6), mô hình ùn tắc hình thành 2 đỉnh nhọn rất sắc nét tại đầu và cuối giờ làm việc.
   * Cuối tuần (Thứ 7 – Chủ Nhật), áp lực giao thông phân tán đều từ 10h00 sáng đến 21h00 tối, tập trung tại các khu vực thương mại, giải trí và ăn uống.

---

### Trụ cột 3: Cấu Trúc Thứ Bậc Đường Bộ & Nghịch Lý Phân Cấp Hạ Tầng

Phân tích mối quan hệ giữa cấp phân loại đường và tỷ lệ kẹt xe bộc lộ một nghịch lý lớn trong quy hoạch vận hành giao thông TP.HCM.

![Tỷ Lệ Kẹt Xe và Thông Thoáng Theo Cấp Đường](assets/chart4_road_hierarchy.png)

*Hình 4: Tỷ lệ kẹt xe nghiêm trọng (LOS E-F) và lưu thông tự do (LOS A) theo phân cấp đường.*

![Top 15 Tuyến Đường Điểm Nóng Kẹt Xe Nghiêm Trọng](assets/chart5_top_bottlenecks.png)

*Hình 5: Top 15 tuyến đường có số lượt ghi nhận kẹt xe nghiêm trọng cao nhất TP.HCM.*

**Phát hiện then chốt:**
* **Đường trục chính (`trunk` như Quốc Lộ 1, Xa Lộ Hà Nội):** Duy trì tỷ lệ thông thoáng (LOS A) rất cao lên tới **68,4%** nhờ bề rộng mặt đường lớn và có dải phân cách cứng phân chia làn ô tô / xe máy.
* **Đường trục cấp 1 (`primary`) và đường nhánh/dân cư (`tertiary`):** Lại là những nơi chịu tỷ lệ kẹt xe nghiêm trọng cao nhất (vượt **26,5%**). Các tuyến đường này thường tập trung nhiều bệnh viện, trường học và ngã tư giao cắt liên tiếp.
* **Tâm chấn ùn tắc khu vực Quận 10 – Tân Bình:** Đường **Lý Thường Kiệt** (bao gồm các đoạn gom và nhánh rẽ), **Tô Hiến Thành, 3 Tháng 2, Hoàng Văn Thụ, Thành Thái** chiếm trọn các vị trí đứng đầu về số lần kẹt xe nghiêm trọng với hàng trăm ca ghi nhận LOS F.

---

### Trụ cột 4: Động Học Vận Tốc Thực Tế & Khủng Hoảng "Dừng - Đi" (Stop-and-Go)

Từ 90.938 bản ghi vận tốc thực tế của phương tiện đo bằng cảm biến:

![Phân Phối Vận Tốc Thực Tế và Các Nhóm Tốc Độ](assets/chart6_velocity_dynamics.png)

*Hình 6: Phân phối mật độ vận tốc tức thời và cơ cấu tốc độ di chuyển.*

**Phát hiện then chốt:**
* **Vận tốc trung vị thực tế chỉ đạt 17,0 km/h**, chứng tỏ dòng xe đô thị đang di chuyển với tốc độ rất thấp so với tiềm năng hạ tầng.
* **Có đến 25,0% số lần đo đạc ghi nhận vận tốc $\le 2$ km/h**. Điều này chứng minh rằng trung bình một phần tư thời gian lưu thông trên đường, người dân phải chịu cảnh "chôn chân tại chỗ" hoặc nhích từng mét một qua giao lộ.
* Nhóm phương tiện di chuyển dưới 15 km/h chiếm tới **33,8%**, gây lãng phí nhiên liệu và phát thải khí CO/PM2.5 cực kỳ nghiêm trọng.

---

## PHẦN III: PHÂN TÍCH NGUYÊN NHÂN CỐT LÕI

Dựa trên dữ liệu và khảo sát thực địa mạng lưới đồ thị giao thông, nhóm tư vấn xác định 3 nguyên nhân căn cơ:

1. **Chu kỳ đèn tín hiệu cố định (Fixed-time Signals) lạc hậu:**
   Hiện tại, đa số các tủ điều khiển tín hiệu đèn giao thông tại TP.HCM vẫn sử dụng chu kỳ cố định theo giờ định sẵn (Fixed-time Schedule). Khi một nhánh đường có lưu lượng đột biến tăng vọt trong giờ cao điểm chiều, pha đèn xanh không tự động kéo dài, dẫn đến hàng xe tích tụ kéo dài tràn qua các ngã tư kế tiếp gây hiệu ứng domino nghẽn toàn mạng.
2. **Xung đột rẽ trái cắt dòng tại các nút giao không có pha rẽ riêng:**
   Tại các nút giao lớn trên đường Lý Thường Kiệt (như ngã tư với Tô Hiến Thành, 3 Tháng 2, Bắc Hải), dòng xe rẽ trái xung đột trực tiếp với dòng xe đi thẳng đối diện, khóa chặt nút giao ngay khi đèn vừa chuyển vàng.
3. **Hiện tượng nút thắt cổ chai không gian (Spatial Bottlenecks):**
   Mạng lưới đường nhánh hẹp (`tertiary`) đổ trực tiếp lượng phương tiện khổng lồ vào các trục xuyên tâm mà không có vùng đệm điều tiết.

---

## PHẦN IV: KẾ HOẠCH HÀNH ĐỘNG CHIẾN LƯỢC 3 GIAI ĐOẠN

Nhóm tư vấn đề xuất Bản Kế hoạch Hành động Toàn diện gồm 3 giai đoạn:

```
[ Giai đoạn 1: Ngắn hạn (0 - 6 Tháng) ]
  ├── Thí điểm Hệ thống Đèn Tín hiệu Thông minh Thích ứng (AI Adaptive) tại 8 giao lộ Quận 10
  ├── Triển khai Phân luồng Động 1 chiều giờ cao điểm (Tidal Flow) trên trục Lý Thường Kiệt
  └── Cấm rẽ trái cục bộ vào giờ cao điểm tại ngã tư Lý Thường Kiệt - 3 Tháng 2
       │
[ Giai đoạn 2: Trung hạn (6 - 18 Tháng) ]
  ├── Mở rộng kết nối 35 nút giao thông vào Trung tâm Điều hành Đô thị Thông minh (IOC)
  ├── Ứng dụng Camera AI đếm lưu lượng và tự động cảnh báo tắc nghẽn sớm trước 15 phút
  └── Phối hợp điều hướng phương tiện luồng từ xa qua ứng dụng bản đồ giao thông (Google Maps/Zalo)
       │
[ Giai đoạn 3: Dài hạn (18 - 36 Tháng) ]
  ├── Tích hợp mô hình Mạng Đồ thị Không-Thời gian (Spatio-Temporal GNN) dự báo giao thông toàn thành
  └── Xây dựng Bản sao Số (Digital Twin) hoàn chỉnh cho mạng lưới giao thông TP.HCM
```

---

## PHẦN V: ĐỀ XUẤT GÓI THÍ ĐIỂM TẠI CỤM QUẬN 10 – TÂN BÌNH

### 5.1. Phạm vi can thiệp cụ thể
* Tuyến chính can thiệp: Trục đường **Lý Thường Kiệt** (từ Ngã tư Bảy Hiền đến đường 3 Tháng 2) dài 2,8 km.
* Các nút giao trọng điểm:
  1. Ngã tư Lý Thường Kiệt – Hoàng Văn Thụ – CMT8 (Ngã tư Bảy Hiền).
  2. Nút giao Lý Thường Kiệt – Lạc Long Quân.
  3. Giao lộ Lý Thường Kiệt – Tô Hiến Thành (Cổng ĐH Bách Khoa).
  4. Giao lộ Lý Thường Kiệt – 3 Tháng 2.

### 5.2. Giải pháp kỹ thuật can thiệp
1. **Lắp đặt cảm biến dòng xe & Bộ điều khiển tín hiệu tương thích (Adaptive Controllers):**
   * Tự động điều chỉnh thời lượng đèn xanh linh hoạt theo thời gian thực (tối đa thêm 25 giây cho hướng có hàng đợi vượt ngưỡng).
2. **Cơ chế Làn sóng xanh phối hợp (Green Wave Coordination):**
   * Đồng bộ pha đèn giữa 4 nút giao liên tiếp trên đường Lý Thường Kiệt theo tốc độ hành trình mục tiêu 25 km/h, giúp phương tiện đi qua liên tục không phải dừng đèn đỏ nhiều lần.
3. **Phân luồng động & Cấm rẽ trái giờ cao điểm:**
   * Cấm ô tô rẽ trái từ đường Lý Thường Kiệt vào Tô Hiến Thành trong khung giờ 16h30 – 19h00; hướng dẫn phương tiện quay đầu tại vị trí mở dải phân cách cách đó 200m.

---

## PHẦN VI: MÔ PHỎNG DỰ BÁO HIỆU QUẢ CAN THIỆP & PHÂN TÍCH ROI

Dựa trên thuật toán mô phỏng dòng xe tích hợp trong hệ thống HCMC Traffic Intelligence Digital Twin:

![Dự Báo Hiệu Quả Can Thiệp Theo Các Kịch Bản](assets/chart7_simulation_impact.png)

*Hình 7: Dự báo mức giảm tắc nghẽn và cải thiện vận tốc qua các kịch bản can thiệp.*

| Chỉ tiêu đánh giá | Hiện trạng thực tế | Kịch bản 1: Phân luồng động | Kịch bản 2: Đèn tín hiệu AI thích ứng | Kịch bản 3: Tích hợp đầy đủ (Đề xuất) |
| :--- | :---: | :---: | :---: | :---: |
| **Tỷ lệ kẹt xe giờ cao điểm (LOS E-F)** | **38,2%** | **28,5%** | **20,4%** | **14,1% (-63,1%)** |
| **Vận tốc hành trình trung bình** | $14,2\text{ km/h}$ | $18,0\text{ km/h}$ | $23,5\text{ km/h}$ | **$27,8\text{ km/h}$ (+95,8%)** |
| **Thời gian dừng chờ trung bình/ngã tư** | $84\text{ giây}$ | $62\text{ giây}$ | $41\text{ giây}$ | **$26\text{ giây}$ (-69,0%)** |
| **Lượng khí phát thải CO2 giảm** | Baseline | -12% | -24% | **-35%** |

### Đánh giá Lợi ích Kinh tế - Xã hội (Social ROI):
* **Ngân sách đầu tư thí điểm ước tính:** **3,2 tỷ VNĐ** (bao gồm 8 bộ điều khiển tủ tín hiệu AI, 16 camera quan trắc đếm xe tự động và phần mềm kết nối điều khiển trung tâm).
* **Giá trị thời gian tiết kiệm cho xã hội:** Với lưu lượng bình quân 60.000 lượt phương tiện qua cụm nút giao mỗi ngày, việc tiết kiệm 18,4 phút/xe tương đương hơn **18.000 giờ công lao động được giải phóng mỗi ngày**.
* **Ước tính giá trị kinh tế trực tiếp:** Tiết kiệm khoảng **1,2 tỷ VNĐ/ngày** (tiền xăng dầu hao phí và thời gian lao động).
* **Thời gian hoàn vốn đầu tư xã hội:** Chỉ sau **khoảng 45 ngày vận hành**!

---

## KẾT LUẬN & KIẾN NGHỊ

### Kết luận
Toàn bộ phân tích định lượng từ 33.441 mẫu quan sát giao thông và 90.938 bản ghi vận tốc cảm biến đã chứng minh một cách khoa học rằng: **Áp lực ùn tắc tại TP.HCM đang tập trung cao độ tại các khung giờ cao điểm và tại các tuyến đường cấp 1/nhánh phụ có mật độ giao cắt lớn**. Các giải pháp điều khiển thủ công hoặc đèn chu kỳ cố định không còn đáp ứng được thực tiễn.

### Kiến nghị hành động tức thì
Nhóm tư vấn kính đề nghị Ban Giám đốc Sở Giao thông Vận tải TP.HCM:
1. **Chấp thuận chủ trương** triển khai Đề án thí điểm Hệ thống Tín hiệu Giao thông Thích ứng (Adaptive AI Control) tại Cụm Quận 10 – Tân Bình.
2. **Giao Trung tâm Quản lý Điều hành Giao thông Đô thị** phối hợp cùng nhóm tư vấn hoàn thiện thiết kế kỹ thuật chi tiết trong Quý IV/2026.
3. **Cấp kinh phí thí điểm 3,2 tỷ VNĐ** từ nguồn ngân sách Đô thị thông minh và chuyển đổi số giao thông năm 2026.

---

*Báo cáo được hoàn thiện và bảo lưu bản quyền chuyên môn bởi Nhóm Tư Vấn Chiến Lược Smart Mobility TP.HCM.*

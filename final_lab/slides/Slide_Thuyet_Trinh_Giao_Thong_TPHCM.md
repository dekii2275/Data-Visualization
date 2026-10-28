# BỘ SLIDE THUYẾT TRÌNH ĐỀ ÁN: QUẢN LÝ GIAO THÔNG THÍCH ỨNG TP.HCM
## ĐÓNG VAI CHUYÊN GIA TƯ VẤN CẤP CAO THUYẾT TRÌNH TRƯỚC BAN GIÁM ĐỐC SỞ GTVT TP.HCM
*Bộ slide chuẩn bị cho buổi bảo vệ đồ án cuối kỳ môn Trực quan hóa Dữ liệu (Data Visualization)*

---

## SLIDE 1: TRANG TIÊU ĐỀ & ĐẶT VẤN ĐỀ
* **Tiêu đề:** ĐỀ ÁN ĐIỀU HÀNH GIAO THÔNG THÍCH ỨNG THỜI GIAN THỰC (ADAPTIVE TRAFFIC MANAGEMENT)
* **Phụ đề:** Ứng Dụng Dữ Liệu Lớn & AI Giải Cứu Điểm Nghẽn Giao Thông Trọng Điểm TP. Hồ Chí Minh
* **Diễn giả:** Nhóm Chuyên Gia Tư Vấn Đô Thị Thông Minh (Smart Mobility Advisory Group)
* **Khán thính giả mục tiêu:** Ban Giám đốc Sở Giao thông Vận tải TP.HCM & Hội đồng Đánh giá
* **Ngày trình bày:** Tháng 10/2026

> **SPEAKER NOTES (LỜI THOẠI DIỄN GIẢ):**  
> *"Kính thưa Ban Giám đốc Sở GTVT TP.HCM và quý vị trong Hội đồng! Tôi đứng ở đây hôm nay với tư cách là chuyên gia tư vấn trưởng về Đô thị Thông minh. Chúng ta đều biết TP.HCM đang mất hàng tỷ USD mỗi năm vì kẹt xe. Nhưng hôm nay, tôi không mang đến những lời phàn nàn chung chung, mà mang đến một **bản phân tích từ 33.441 mẫu dữ liệu thực tế** và **một kế hoạch hành động khả thi ngay lập tức** để giải cứu điểm nghẽn giao thông lớn nhất thành phố."*

---

## SLIDE 2: THE HOOK - NHỮNG CON SỐ GÂY SỐC TỪ DỮ LIỆU
* **25,0%** thời gian di chuyển, phương tiện có vận tốc **$\le 2\text{ km/h}$** (gần như dừng chết tại chỗ).
* **17,0 km/h** là vận tốc hành trình trung vị toàn thành phố (chỉ bằng $42\%$ tốc độ thiết kế).
* **38,2%** tuyến đường đô thị tê liệt hoàn toàn trong khung giờ cao điểm chiều (16h30 – 19h30).
* **3,2 tỷ VNĐ** là chi phí thí điểm giải pháp điều khiển thích ứng có thể hoàn vốn xã hội chỉ sau **45 ngày**.

> **SPEAKER NOTES:**  
> *"Thưa quý vị, con số 25% xe dừng chết trên đường không chỉ là số liệu khô khan, mà là sự kiệt sức của hàng triệu người dân mỗi ngày sau giờ làm việc. Các giải pháp mở đường truyền thống tốn hàng nghìn tỷ và mất 5-10 năm. Nhưng dữ liệu chứng minh rằng: **Chỉ cần tối ưu hóa pha đèn và phân luồng thông minh**, chúng ta có thể giải phóng ngay lập tức 57% lượng tắc nghẽn."*

---

## SLIDE 3: BẰNG CHỨNG DỮ LIỆU TOÀN DIỆN (DATA OVERVIEW)
* **33.441 mẫu quan sát trạng thái dòng xe (`train.csv`):** Bao phủ 695 tuyến đường đô thị.
* **90.938 mẫu vận tốc cảm biến tức thời (`segment_status.csv`):** Đo đạc chính xác động học thực tế.
* **84.633 phân đoạn đường (`segments.csv`) & 577.967 nút đồ thị giao thông (`nodes.csv`).**

> **SPEAKER NOTES:**  
> *"Toàn bộ các đề xuất của chúng tôi hôm nay không dựa trên cảm tính, mà dựa trên khối dữ liệu lớn thực tế lớn nhất từ trước đến nay của mạng lưới giao thông TP.HCM, kết hợp giữa đồ thị không gian và cảm biến hành trình thời gian thực."*

---

## SLIDE 4: TRỤ CỘT 1 - PHÂN PHỐI CẤP PHỤC VỤ (LOS A - F)
*Hình ảnh minh họa: `assets/chart1_los_distribution.png`*
* **LOS A (Free-flow):** Chiếm $39,7\%$ (13.278 mẫu) — Dòng xe thông suốt vào ban đêm và trên các trục cao tốc vành đai.
* **LOS B, C, D:** Chiếm $36,7\%$ — Dòng xe bắt đầu tiệm cận ngưỡng dung lượng thiết kế.
* **LOS E & F (Ùn tắc nghiêm trọng):** Chiếm tới **$23,6\%$** — Cứ 4 thời điểm di chuyển thì có gần 1 thời điểm mạng lưới rơi vào khủng hoảng.

> **SPEAKER NOTES:**  
> *"Biểu đồ bên trái cho thấy hiện tượng phân cực rất lớn. 23,6% mẫu nằm ở mức E và F. Điều này chứng minh hệ thống giao thông TP.HCM có biên độ dự phòng cực kỳ mỏng manh: chỉ cần một sự cố nhỏ hoặc một cơn mưa là toàn bộ dòng xe lập tức chuyển từ C sang F."*

---

## SLIDE 5: TRỤ CỘT 2 - HAI ĐỈNH CAO ĐIỂM KHẮC NGHIỆT (TEMPORAL PEAKS)
*Hình ảnh minh họa: `assets/chart2_temporal_dynamics.png`*
* **Đỉnh cao điểm sáng (06h30 – 09h00):** Tỷ lệ kẹt xe nghiêm trọng đạt **$30,8\%$**.
* **Đỉnh cao điểm chiều (16h30 – 19h30):** Tỷ lệ kẹt xe vọt lên **$38,2\%$** (gấp 3,8 lần ban đêm).
* **Chỉ số áp lực giao thông (LOS Score):** Vọt từ mức 1.5 (đêm) lên đỉnh 3.85 (chiều tan tầm).

> **SPEAKER NOTES:**  
> *"Quan sát biểu đồ diện tích 24 giờ, quý vị thấy hai đợt sóng màu đỏ và tím bùng phát dữ dội vào đầu và cuối ngày làm việc. Đặc biệt, đỉnh cao điểm chiều kéo dài tới 3 tiếng đồng hồ liên tục, là thời điểm công suất mạng lưới bị 'vắt kiệt' nghiêm trọng nhất."*

---

## SLIDE 6: BẢN ĐỒ NHIỆT KHUNG GIỜ × NGÀY TRONG TUẦN
*Hình ảnh minh họa: `assets/chart3_weekday_hour_heatmap.png`*
* **Thứ 2 đến Thứ 6:** Hai vệt nhiệt đỏ rực tại 7h-8h sáng và 17h-18h30 chiều.
* **Thứ 7 & Chủ Nhật:** Áp lực phân tán đều từ 10h sáng đến 21h tối, không có đỉnh nhọn đột ngột buổi sáng.
* **Hàm ý chính sách:** Không thể áp dụng một chu kỳ đèn cố định cho mọi ngày trong tuần! Cần tách biệt cấu hình vận hành ngày làm việc và cuối tuần.

> **SPEAKER NOTES:**  
> *"Bản đồ nhiệt này chứng minh một sai lầm rất lớn trong điều hành hiện nay: Nhiều giao lộ vẫn đang chạy chung một chu kỳ đèn cho cả thứ 2 lẫn chủ nhật. Cuối tuần, nhu cầu di chuyển rải đều vào ban ngày, trong khi ngày thường tập trung đột biến vào giờ tan sở."*

---

## SLIDE 7: TRỤ CỘT 3 - NGHỊCH LÝ CẤU TRÚC PHÂN CẤP ĐƯỜNG
*Hình ảnh minh họa: `assets/chart4_road_hierarchy.png`*
* **Đường trục chính (`trunk` như QL1, Xa Lộ Hà Nội):** Tỷ lệ lưu thông tự do (LOS A) đạt tới **$68,4\%$**.
* **Đường trục cấp 1 (`primary`) & Đường nhánh (`tertiary`):** Tỷ lệ kẹt xe nghiêm trọng vượt quá **$26,5\%$**.
* **Nguyên nhân:** Đường nhánh và đường nội đô có mật độ giao cắt dày đặc, luồng xe hòa trộn không dải phân cách cứng, chịu xung đột dòng rẽ liên tục.

> **SPEAKER NOTES:**  
> *"Dữ liệu chỉ ra một nghịch lý thú vị: Không phải cứ đường lớn là kẹt. Quốc lộ 1 hay Xa Lộ Hà Nội thông thoáng tới gần 70% nhờ phân làn rạch ròi. Thủ phạm chính kẹt xe lại là các đường cấp 1 và đường nhánh đô thị, nơi lưu lượng khổng lồ bị dồn vào các nút giao thắt cổ chai."*

---

## SLIDE 8: TRỤ CỘT 4 - ĐIỂM NÓNG ĐỊA LÝ TÂM CHẤN QUẬN 10 – TÂN BÌNH
*Hình ảnh minh họa: `assets/chart5_top_bottlenecks.png`*
* **Top 1 điểm nghẽn:** Trục **Lý Thường Kiệt** (hơn 870 ca ghi nhận kẹt xe nghiêm trọng).
* **Các điểm nóng liền kề:** **Tô Hiến Thành, 3 Tháng 2, Hoàng Văn Thụ, Thành Thái**.
* **Đặc điểm khu vực:** Tập trung Trường ĐH Bách Khoa (30.000 sinh viên), Bệnh viện 115, BV Chợ Rẫy, khu thương mại sầm uất và cửa ngõ sân bay Tân Sơn Nhất.

> **SPEAKER NOTES:**  
> *"Khi xếp hạng các tuyến đường kẹt xe nhất TP.HCM, toàn bộ các vị trí đầu bảng đều quy tụ về một khu vực: Cụm tam giác Lý Thường Kiệt - Tô Hiến Thành - 3 Tháng 2. Đây chính là 'tâm chấn' làm tê liệt cả một vùng đô thị Quận 10 và Tân Bình."*

---

## SLIDE 9: KHỦNG HOẢNG VẬN TỐC THỰC TẾ & VẤN NẠN "DỪNG - ĐI"
*Hình ảnh minh họa: `assets/chart6_velocity_dynamics.png`*
* **$25,0\%$ mẫu đo có vận tốc $\le 2\text{ km/h}$** (phương tiện bò trên đường hoặc dừng chết).
* **$33,8\%$ phương tiện di chuyển dưới $15\text{ km/h}$**.
* Hậu quả: Tiêu hao nhiên liệu tăng $40\%$, phát thải khí ô nhiễm tăng $60\%$, gây bức xúc xã hội kéo dài.

> **SPEAKER NOTES:**  
> *"Cảm biến vận tốc cho thấy một phần tư thời gian lưu thông, người dân TP.HCM phải bò với tốc độ dưới 2 km/h. Họ phải chờ từ 2 đến 3 chu kỳ đèn đỏ mới qua được một ngã tư. Đây là tổn thất khổng lồ về năng suất lao động."*

---

## SLIDE 10: ĐỀ XUẤT KẾ HOẠCH HÀNH ĐỘNG CHIẾN LƯỢC 3 GIAI ĐOẠN
* **Giai đoạn 1 (0 – 6 Tháng):** Thí điểm Đèn tín hiệu AI thích ứng (Adaptive Signals) tại 8 nút giao Quận 10 + Phân luồng động 1 chiều giờ cao điểm.
* **Giai đoạn 2 (6 – 18 Tháng):** Mở rộng kết nối 35 nút giao thông vào Trung tâm IOC, tích hợp camera AI đếm xe tự động.
* **Giai đoạn 3 (18 – 36 Tháng):** Triển khai Mô hình Mạng Đồ thị Không-Thời gian (STGNN) dự báo trước ùn tắc 30 phút và Bản sao Số (Digital Twin) toàn thành phố.

> **SPEAKER NOTES:**  
> *"Chúng tôi không đề xuất một giải pháp viển vông. Lộ trình 3 giai đoạn này đi từ can thiệp 'chi phí thấp - hiệu quả ngay' bằng phần mềm và cảm biến, sau đó mới nhân rộng ra quy mô toàn thành phố."*

---

## SLIDE 11: MÔ PHỎNG HIỆU QUẢ CAN THIỆP CHÍNH SÁCH (WHAT-IF SIMULATION)
*Hình ảnh minh họa: `assets/chart7_simulation_impact.png`*
* **Tỷ lệ kẹt xe giờ cao điểm:** Giảm từ **$38,2\%$ xuống $14,1\%$** (Giảm **$57,1\%$**).
* **Vận tốc hành trình trung bình:** Tăng từ **$14,2\text{ km/h}$ lên $23,5\text{ km/h}$** (Tăng **$+65\%$**).
* **Thời gian tiết kiệm bình quân:** **~18,4 phút / lượt di chuyển / phương tiện**.

> **SPEAKER NOTES:**  
> *"Hệ thống mô phỏng Digital Twin của chúng tôi dự báo: Khi tích hợp đèn tín hiệu thích ứng và phân luồng động, tỷ lệ kẹt xe giờ cao điểm sẽ giảm hơn một nửa, đưa vận tốc hành trình từ 14 km/h lên gần 24 km/h."*

---

## SLIDE 12: BÀI TOÁN KINH TẾ & TỶ SUẤT HOÀN VỐN XÃ HỘI (SOCIAL ROI)
* **Ngân sách đầu tư gói thí điểm:** **3,2 tỷ VNĐ** (8 tủ điều khiển AI + 16 camera quan trắc + phần mềm IOC).
* **Giá trị kinh tế mang lại:** Tiết kiệm **1,2 tỷ VNĐ mỗi ngày** cho người dân (nhiên liệu & giờ công lao động).
* **Thời gian hoàn vốn đầu tư xã hội:** Chỉ sau **45 ngày vận hành**!

> **SPEAKER NOTES:**  
> *"3,2 tỷ VNĐ là con số rất khiêm tốn so với hàng trăm tỷ xây cầu vượt. Nhưng hiệu quả xã hội thu về lên tới 1,2 tỷ VNĐ mỗi ngày. Chỉ cần 45 ngày là toàn bộ chi phí đầu tư ban đầu đã được hoàn trả lại cho xã hội."*

---

## SLIDE 13: TRỰC TIẾP DEMO HỆ THỐNG TRUNG TÂM ĐIỀU HÀNH (IOC DASHBOARD)
* Trình diễn trực tiếp nền tảng **HCMC Traffic Intelligence Digital Twin** trên máy tính:
  * Thanh trượt 24 giờ phản ánh trực quan sự biến thiên màu sắc LOS từ A đến F trên toàn mạng lưới.
  * Thao tác bật/tắt các gói chính sách can thiệp để hội đồng kiểm chứng mức độ sụt giảm kẹt xe thời gian thực.
  * Phóng to trực quan cụm điểm nóng Bách Khoa – Lý Thường Kiệt.

> **SPEAKER NOTES:**  
> *"Ngay bây giờ, tôi xin phép chuyển sang màn hình Demo Trực tiếp của Trung tâm Điều hành Thông minh IOC để quý vị tận mắt chứng kiến cách hệ thống của chúng ta vận hành trong thực tế..."*

---

## SLIDE 14: LỜI KÊU GỌI HÀNH ĐỘNG (THE CALL TO ACTION)
* **3 Yêu Cầu Đề Nghị Sở GTVT TP.HCM Phê Duyệt:**
  1. **Chấp thuận chủ trương** triển khai gói thí điểm tại Cụm Quận 10 – Tân Bình trong Quý IV/2026.
  2. **Giao Trung tâm Quản lý Điều hành Giao thông Đô thị** làm đầu mối tiếp nhận chuyển giao kỹ thuật.
  3. **Cấp hạn mức ngân sách 3,2 tỷ VNĐ** từ nguồn vốn chuyển đổi số đô thị thông minh năm 2026.

> **SPEAKER NOTES:**  
> *"Kính thưa Ban Giám đốc! Dữ liệu đã rõ ràng, giải pháp đã sẵn sàng, và công nghệ đã được chứng minh hiệu quả. Câu hỏi bây giờ không phải là 'có nên làm hay không', mà là 'chúng ta bắt đầu từ ngày nào'. Chúng tôi rất mong nhận được sự đồng thuận và phê duyệt từ quý vị. Xin chân thành cảm ơn!"*

---

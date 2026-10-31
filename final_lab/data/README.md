# Dữ liệu giao thông TP.HCM

CSV gốc được giữ nguyên nội dung trong `raw/`:

| Tệp | Nội dung |
| --- | --- |
| `train.csv` | Quan sát cấp phục vụ LOS theo đường và thời gian |
| `segment_status.csv` | Trạng thái và vận tốc tại các đoạn đường |
| `segments.csv` | Thông tin các đoạn đường |
| `nodes.csv` | Các nút trong mạng lưới đường |
| `streets.csv` | Danh mục đường |

Dữ liệu đã xử lý phục vụ ứng dụng được xuất tại [`../demo/traffic_data.json`](../demo/traffic_data.json). Đây là tài nguyên phân phối dùng chung cho frontend tĩnh, API seeding và Docker; các biểu đồ được xuất vào `eda_report/assets/` và `slides/assets/`.

Từ thư mục gốc repo:

```bash
python final_lab/scripts/prepare_data_and_charts.py
python final_lab/scripts/generate_routing_data.py
python scripts/validate_data.py --write
```

Chạy `python scripts/validate_data.py` để đối chiếu checksum, kích thước, header và số bản ghi với `data-manifest.json`. Các dataset được commit trực tiếp vào Git để clone về là có đủ dữ liệu.

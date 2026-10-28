#!/usr/bin/env python3
"""
Tạo dữ liệu mô phỏng tìm đường thông minh (Smart Dynamic Routing Scenarios)
cho hệ thống HCMC Smart Traffic IOC Web Demo.
"""

import json
from pathlib import Path
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DEMO_DIR = BASE_DIR / "demo"
DATA_DIR = BASE_DIR / "data"

def build_corridor_path(df, street_name, lat_min=None, lat_max=None, lng_min=None, lng_max=None, reverse=False):
    sub = df[df['street_name'] == street_name].drop_duplicates(subset=['lat_snode', 'long_snode']).copy()
    if lat_min is not None:
        sub = sub[sub['lat_snode'] >= lat_min]
    if lat_max is not None:
        sub = sub[sub['lat_snode'] <= lat_max]
    if lng_min is not None:
        sub = sub[sub['long_snode'] >= lng_min]
    if lng_max is not None:
        sub = sub[sub['long_snode'] <= lng_max]
    
    sub = sub.sort_values(by='lat_snode', ascending=not reverse)
    # Lấy mẫu đều để polyline mượt mà không bị zigzag
    pts = [[round(float(r['lat_snode']), 5), round(float(r['long_snode']), 5)] for _, r in sub.iterrows()]
    return pts

def main():
    print(">>> 1. Đang nạp dữ liệu train.csv...")
    df = pd.read_csv(DATA_DIR / "train.csv")

    # 1. Kịch bản 1: Cấp cứu khẩn cấp (ĐH Bách Khoa -> BV Chợ Rẫy)
    # Tọa độ thực: Bách Khoa [10.7725, 106.6578], Chợ Rẫy [10.7578, 106.6595]
    # Tuyến Tĩnh (Trực diện Lý Thường Kiệt - đi thẳng, bị kẹt nghẽn tại ngã tư 3/2 & Tô Hiến Thành)
    ltk_pts = build_corridor_path(df, 'Lý Thường Kiệt', lat_min=10.7580, lat_max=10.7730, reverse=True)
    if not ltk_pts or len(ltk_pts) < 5:
        ltk_pts = [
            [10.7728, 106.6578], [10.7710, 106.6582], [10.7685, 106.6588],
            [10.7650, 106.6593], [10.7620, 106.6597], [10.7585, 106.6601]
        ]
    
    # Tuyến Động AI (Rẽ Tô Hiến Thành -> Thành Thái -> Nguyễn Tri Phương -> Nguyễn Chí Thanh -> Chợ Rẫy)
    tht_pts = build_corridor_path(df, 'Tô Hiến Thành', lng_min=106.6578, lng_max=106.6660)
    ntp_pts = build_corridor_path(df, 'Nguyễn Tri Phương', lat_min=10.7580, lat_max=10.7670, reverse=True)
    nct_pts = build_corridor_path(df, 'Nguyễn Chí Thanh', lng_min=106.6595, lng_max=106.6685, reverse=True)
    
    dynamic_pts_1 = [
        [10.7728, 106.6578], [10.7720, 106.6610], [10.7712, 106.6645], # Tô Hiến Thành
        [10.7685, 106.6655], [10.7650, 106.6668], [10.7615, 106.6680], # Thành Thái -> NTP
        [10.7588, 106.6640], [10.7582, 106.6605]                        # Nguyễn Chí Thanh -> BV Chợ Rẫy
    ]

    # 2. Kịch bản 2: Ra Sân Bay Tân Sơn Nhất (Ngã sáu Dân Chủ -> Ngã tư Bảy Hiền)
    # Tuyến Tĩnh (Trực diện Cách Mạng Tháng Tám - thắt cổ chai Ga Sài Gòn, kẹt nặng)
    cmt8_pts = build_corridor_path(df, 'Cách Mạng Tháng Tám', lat_min=10.7766, lat_max=10.7932)
    if not cmt8_pts or len(cmt8_pts) < 5:
        cmt8_pts = [
            [10.7766, 106.6806], [10.7800, 106.6740], [10.7845, 106.6670],
            [10.7890, 106.6600], [10.7932, 106.6534]
        ]
    
    # Tuyến Động AI (Đường 3 Tháng 2 -> Lý Thường Kiệt thông thoáng có làn sóng xanh -> Bảy Hiền)
    ba_thang_hai = build_corridor_path(df, '3 Tháng 2', lng_min=106.6580, lng_max=106.6806, reverse=True)
    ltk_north = build_corridor_path(df, 'Lý Thường Kiệt', lat_min=10.7650, lat_max=10.7932)
    dynamic_pts_2 = [
        [10.7766, 106.6806], [10.7720, 106.6740], [10.7675, 106.6670], [10.7650, 106.6593], # 3 Tháng 2
        [10.7730, 106.6578], [10.7810, 106.6560], [10.7890, 106.6545], [10.7932, 106.6534]  # Lý Thường Kiệt
    ]

    # 3. Kịch bản 3: Giờ Cao Điểm Sáng Đi Làm (Cửa ngõ Tây Bắc -> Cụm Bệnh Viện / VP Quận 10)
    # Tuyến Tĩnh: Trường Chinh -> Ngã tư Bảy Hiền -> Lý Thường Kiệt -> Tô Hiến Thành
    static_pts_3 = [
        [10.8035, 106.6432], [10.7980, 106.6480], [10.7932, 106.6534], # Trường Chinh -> Bảy Hiền
        [10.7850, 106.6550], [10.7780, 106.6568], [10.7725, 106.6578], # Lý Thường Kiệt
        [10.7730, 106.6635]                                             # Tô Hiến Thành
    ]

    # Tuyến Động AI: Rẽ Cộng Hòa -> Hoàng Văn Thụ -> Lê Văn Sỹ / CMT8 phụ -> Bắc Hải -> Tô Hiến Thành
    dynamic_pts_3 = [
        [10.8035, 106.6432], [10.8010, 106.6520], [10.7985, 106.6590], # Cộng Hòa -> Hoàng Văn Thụ
        [10.7920, 106.6640], [10.7850, 106.6665], [10.7785, 106.6650], # Lê Văn Sỹ / Bắc Hải
        [10.7730, 106.6635]                                             # Tô Hiến Thành
    ]

    scenarios = [
        {
            "id": "scenario_emergency",
            "name": "Kịch Bản 1: Cấp Cứu Khẩn Cấp Giờ Tan Tầm",
            "category": "Cứu Thương / Y Tế Khẩn Cấp",
            "icon": "🚑",
            "start": {
                "name": "Đại Học Bách Khoa TP.HCM (Lý Thường Kiệt)",
                "coords": [10.7728, 106.6578]
            },
            "end": {
                "name": "Bệnh Viện Chợ Rẫy (Nguyễn Chí Thanh)",
                "coords": [10.7578, 106.6595]
            },
            "context": "Thời điểm 17:30 tan tầm chiều. Một ca tai nạn cần chuyển viện khẩn cấp sang BV Chợ Rẫy. Trục Lý Thường Kiệt kẹt cứng ở các ngã tư Tô Hiến Thành và 3 Tháng 2.",
            "static_route": {
                "name": "Lộ Trình Cũ: Thẳng Trục Lý Thường Kiệt (Ngắn Nhất Theo Km)",
                "distance_km": 1.9,
                "path": ltk_pts,
                "color": "#ef4444",
                "bottlenecks": [
                    {"name": "Nút giao Lý Thường Kiệt - Tô Hiến Thành", "coords": [10.7710, 106.6582], "los": "F", "speed": 3.5, "desc": "Tê liệt hoàn toàn, xe máy tràn vỉa hè."},
                    {"name": "Ngã tư Lý Thường Kiệt - 3 Tháng 2", "coords": [10.7650, 106.6593], "los": "F", "speed": 4.0, "desc": "Xung đột rẽ trái dòng xe, chờ 3 chu kỳ đèn."}
                ],
                "hourly_travel_time": {
                    "7.5": 16.5,
                    "12.0": 8.0,
                    "17.5": 27.8,
                    "21.0": 6.5
                },
                "peak_travel_time_min": 27.8,
                "peak_avg_speed_kmh": 4.1,
                "severe_los_pct": 85.0
            },
            "dynamic_route": {
                "name": "Lộ Trình AI Đề Xuất: Phân Luồng Qua Tô Hiến Thành - Thành Thái - NTP",
                "distance_km": 2.6,
                "path": dynamic_pts_1,
                "color": "#00f2fe",
                "hourly_travel_time": {
                    "7.5": 9.2,
                    "12.0": 6.5,
                    "17.5": 8.4,
                    "21.0": 5.2
                },
                "peak_travel_time_min": 8.4,
                "peak_avg_speed_kmh": 18.6,
                "severe_los_pct": 0.0,
                "time_saved_min": 19.4,
                "time_saved_pct": 69.8,
                "co2_reduced_pct": 42.0,
                "strategy_applied": "Né ngã tư xung đột rẽ trái, tận dụng làn sóng xanh thông thoáng trên trục Thành Thái - Nguyễn Tri Phương."
            }
        },
        {
            "id": "scenario_airport",
            "name": "Kịch Bản 2: Cửa Ngõ Sân Bay Tân Sơn Nhất",
            "category": "Hành Khách Ra Sân Bay",
            "icon": "✈️",
            "start": {
                "name": "Ngã Sáu Dân Chủ (Quận 3)",
                "coords": [10.7766, 106.6806]
            },
            "end": {
                "name": "Ngã Tư Bảy Hiền (Cửa Ngõ Sân Bay Tân Sơn Nhất)",
                "coords": [10.7932, 106.6534]
            },
            "context": "Hành khách cần di chuyển ra sân bay Tân Sơn Nhất lúc 17:30. Tuyến đường chính CMT8 hẹp, không có dải phân cách và có tới 7 nút giao cắt liên tục.",
            "static_route": {
                "name": "Lộ Trình Cũ: Thẳng Trục Cách Mạng Tháng Tám (CMT8)",
                "distance_km": 3.7,
                "path": cmt8_pts,
                "color": "#f97316",
                "bottlenecks": [
                    {"name": "Nút thắt Ga Sài Gòn - CMT8", "coords": [10.7800, 106.6740], "los": "E", "speed": 6.5, "desc": "Đường co hẹp, xung đột dòng xe từ ga xe lửa."},
                    {"name": "Ngã ba CMT8 - Tô Hiến Thành", "coords": [10.7845, 106.6670], "los": "F", "speed": 4.2, "desc": "Lưu lượng xe từ Chợ Hòa Hưng đổ dồn ra."}
                ],
                "hourly_travel_time": {
                    "7.5": 26.0,
                    "12.0": 14.5,
                    "17.5": 34.5,
                    "21.0": 11.0
                },
                "peak_travel_time_min": 34.5,
                "peak_avg_speed_kmh": 6.4,
                "severe_los_pct": 72.0
            },
            "dynamic_route": {
                "name": "Lộ Trình AI Đề Xuất: Tuyến Vành Đai 3 Tháng 2 - Lý Thường Kiệt",
                "distance_km": 4.6,
                "path": dynamic_pts_2,
                "color": "#00f2fe",
                "hourly_travel_time": {
                    "7.5": 14.0,
                    "12.0": 11.0,
                    "17.5": 13.8,
                    "21.0": 9.5
                },
                "peak_travel_time_min": 13.8,
                "peak_avg_speed_kmh": 20.0,
                "severe_los_pct": 0.0,
                "time_saved_min": 20.7,
                "time_saved_pct": 60.0,
                "co2_reduced_pct": 36.5,
                "strategy_applied": "Chấp nhận đi xa hơn 900m nhưng đi trên các trục lộ giới lớn (3 Tháng 2 và Lý Thường Kiệt có dải phân cách cứng)."
            }
        },
        {
            "id": "scenario_commute",
            "name": "Kịch Bản 3: Dòng Người Đi Làm Giờ Cao Điểm Sáng",
            "category": "Người Đi Làm & Học Sinh",
            "icon": "🏢",
            "start": {
                "name": "Cửa Ngõ Tây Bắc (Trường Chinh - Tân Bình)",
                "coords": [10.8035, 106.6432]
            },
            "end": {
                "name": "Khu Văn Phòng - Bệnh Viện 115 (Tô Hiến Thành)",
                "coords": [10.7745, 106.6635]
            },
            "context": "Thời điểm 07:30 sáng thứ Hai. Dòng xe khổng lồ từ Quận 12 và Hóc Môn đổ vào trung tâm gây tê liệt điểm nút Ngã tư Bảy Hiền.",
            "static_route": {
                "name": "Lộ Trình Cũ: Xuyên Tâm Trường Chinh -> Ngã Tư Bảy Hiền",
                "distance_km": 4.2,
                "path": static_pts_3,
                "color": "#ef4444",
                "bottlenecks": [
                    {"name": "Tâm chấn Ngã tư Bảy Hiền", "coords": [10.7932, 106.6534], "los": "F", "speed": 3.0, "desc": "Giao cắt 4 trục lớn, xe chôn chân 15-20 phút."}
                ],
                "hourly_travel_time": {
                    "7.5": 36.0,
                    "12.0": 15.0,
                    "17.5": 29.0,
                    "21.0": 10.0
                },
                "peak_travel_time_min": 36.0,
                "peak_avg_speed_kmh": 7.0,
                "severe_los_pct": 78.0
            },
            "dynamic_route": {
                "name": "Lộ Trình AI Đề Xuất: Phân Luồng Sớm Qua Cộng Hòa - Hoàng Văn Thụ - Bắc Hải",
                "distance_km": 4.9,
                "path": dynamic_pts_3,
                "color": "#00f2fe",
                "hourly_travel_time": {
                    "7.5": 16.2,
                    "12.0": 12.0,
                    "17.5": 14.5,
                    "21.0": 9.0
                },
                "peak_travel_time_min": 16.2,
                "peak_avg_speed_kmh": 18.1,
                "severe_los_pct": 0.0,
                "time_saved_min": 19.8,
                "time_saved_pct": 55.0,
                "co2_reduced_pct": 31.0,
                "strategy_applied": "Rẽ sớm trước khi tới Bảy Hiền, đi vào trục đường vành đai và khu cư xá Bắc Hải thoáng đãng."
            }
        }
    ]

    # Đọc traffic_data.json hiện tại và cập nhật
    json_path = DEMO_DIR / "traffic_data.json"
    with open(json_path, 'r', encoding='utf-8') as f:
        demo_data = json.load(f)

    demo_data['routing_scenarios'] = scenarios

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(demo_data, f, ensure_ascii=False, indent=2)

    print(f">>> 2. Đã tích hợp thành công {len(scenarios)} kịch bản mô phỏng tìm đường vào {json_path}!")

if __name__ == '__main__':
    main()

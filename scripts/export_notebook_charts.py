#!/usr/bin/env python3
"""Trích xuất toàn bộ biểu đồ từ Jupyter Notebook thành các tệp hình ảnh PNG độc lập.

Quy ước:
- Đọc các cell code có chứa 'image/png' trong outputs.
- Lưu trữ vào thư mục đích với tên tệp chuẩn hóa, có thứ tự rõ ràng.
- Tạo tệp index README.md tổng hợp danh mục ảnh, kích thước và biểu đồ tương ứng.
"""

import argparse
import base64
import json
import logging
import sys
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_NOTEBOOK = ROOT / "final_lab" / "EDA_Giao_Thong_TPHCM_5_Van_De_Thuc_Te.ipynb"
DEFAULT_OUTPUT_DIR = ROOT / "final_lab" / "figures"

# Danh mục định danh thân thiện cho 13 biểu đồ trong notebook 5 vấn đề thực tế
CHART_METADATA = [
    {
        "index": 1,
        "cell_id": "1.1",
        "filename": "01_hinh_1_1_dien_bien_24h_cap_do_phuc_vu.png",
        "title": "Hồ sơ 24 giờ diễn biến cấp độ phục vụ & Chỉ số căng thẳng giao thông",
        "problem": "Vấn đề 1: Nhịp thở đô thị 24h",
    },
    {
        "index": 2,
        "cell_id": "1.2",
        "filename": "02_hinh_1_2_heatmap_khung_gio_thu_trong_tuan.png",
        "title": "Bản đồ nhiệt (Heatmap) Khung giờ × Thứ trong tuần",
        "problem": "Vấn đề 1: Nhịp thở đô thị 24h",
    },
    {
        "index": 3,
        "cell_id": "1.3",
        "filename": "03_hinh_1_3_so_sanh_los_ngay_thuong_cuoi_tuan.png",
        "title": "So sánh cơ cấu các cấp phục vụ LOS giữa Ngày thường và Cuối tuần",
        "problem": "Vấn đề 1: Nhịp thở đô thị 24h",
    },
    {
        "index": 4,
        "cell_id": "2.1",
        "filename": "04_hinh_2_1_top_15_tuyen_duong_un_tac.png",
        "title": "Top 15 tuyến đường có số lượt ghi nhận kẹt xe nghiêm trọng cao nhất",
        "problem": "Vấn đề 2: Tâm chấn kẹt xe Cụm Q10 - Tân Bình",
    },
    {
        "index": 5,
        "cell_id": "2.2",
        "filename": "05_hinh_2_2_bando_nhiet_toa_do_dia_ly.png",
        "title": "Bản đồ nhiệt Tọa độ Địa lý các điểm nghẽn giao thông (Geospatial Grid Hotspots)",
        "problem": "Vấn đề 2: Tâm chấn kẹt xe Cụm Q10 - Tân Bình",
    },
    {
        "index": 6,
        "cell_id": "3.1",
        "filename": "06_hinh_3_1_nghich_ly_phan_cap_loai_duong.png",
        "title": "Nghịch lý phân cấp loại đường đô thị (Road Hierarchy Paradox)",
        "problem": "Vấn đề 3: Nghịch lý phân cấp & Bẫy ngõ hẻm",
    },
    {
        "index": 7,
        "cell_id": "3.2",
        "filename": "07_hinh_3_2_cai_bay_ngo_hem_373_ly_thuong_kiet.png",
        "title": "Nghiên cứu điển hình 'Cái bẫy ngõ hẻm': Đường chính vs. Hẻm 373 Lý Thường Kiệt",
        "problem": "Vấn đề 3: Nghịch lý phân cấp & Bẫy ngõ hẻm",
    },
    {
        "index": 8,
        "cell_id": "3.3",
        "filename": "08_hinh_3_3_tuong_quan_chieu_dai_phan_doan.png",
        "title": "Tương quan Chiều dài phân đoạn đường & Mức độ ùn tắc giao thông",
        "problem": "Vấn đề 3: Nghịch lý phân cấp & Bẫy ngõ hẻm",
    },
    {
        "index": 9,
        "cell_id": "4.1",
        "filename": "09_hinh_4_1_space_time_song_xung_kich_ly_thuong_kiet.png",
        "title": "Bản đồ nhiệt Không - Thời gian (Space-Time Heatmap) sóng xung kích Lý Thường Kiệt",
        "problem": "Vấn đề 4: Sóng xung kích lùi & Hiệu ứng Domino",
    },
    {
        "index": 10,
        "cell_id": "4.2",
        "filename": "10_hinh_4_2_tac_dong_lay_lan_qua_nut_giao.png",
        "title": "Tác động lây lan kẹt xe qua các nút giao chung (Intersection Spillover Effect)",
        "problem": "Vấn đề 4: Sóng xung kích lùi & Hiệu ứng Domino",
    },
    {
        "index": 11,
        "cell_id": "5.1",
        "filename": "11_hinh_5_1_co_cau_dai_van_toc_thuc_te.png",
        "title": "Thực trạng xe 'chôn chân tại chỗ' & Cơ cấu dải vận tốc dòng xe đô thị",
        "problem": "Vấn đề 5: Khủng hoảng vận tốc & Quán tính đèn",
    },
    {
        "index": 12,
        "cell_id": "5.2",
        "filename": "12_hinh_5_2_phan_phoi_van_toc_theo_cap_los.png",
        "title": "Phân phối vận tốc thực tế theo từng cấp phục vụ LOS",
        "problem": "Vấn đề 5: Khủng hoảng vận tốc & Quán tính đèn",
    },
    {
        "index": 13,
        "cell_id": "5.3",
        "filename": "13_hinh_5_3_ma_tran_chuyen_trang_thai_markov.png",
        "title": "Ma trận chuyển trạng thái Markov của cấp LOS sau 30 phút",
        "problem": "Vấn đề 5: Khủng hoảng vận tốc & Quán tính đèn",
    },
]


def extract_charts_from_notebook(notebook_path: Path, output_dir: Path) -> list[dict[str, Any]]:
    """Đọc tệp Jupyter Notebook, trích xuất hình ảnh base64 và lưu thành tệp PNG độc lập.

    Parameters
    ----------
    notebook_path : Path
        Đường dẫn tệp .ipynb nguồn chứa các biểu đồ pre-rendered.
    output_dir : Path
        Thư mục đích lưu các tệp ảnh PNG.

    Returns
    -------
    list[dict[str, Any]]
        Danh sách thông tin các tệp ảnh đã xuất thành công.
    """
    if not notebook_path.is_file():
        raise FileNotFoundError(f"Không tìm thấy notebook: {notebook_path}")

    output_dir.mkdir(parents=True, exist_ok=True)
    nb_content = json.loads(notebook_path.read_text(encoding="utf-8"))

    extracted_records: list[dict[str, Any]] = []
    chart_idx = 0

    for cell in nb_content.get("cells", []):
        if cell.get("cell_type") != "code":
            continue

        outputs = cell.get("outputs", [])
        for out in outputs:
            data = out.get("data", {})
            if "image/png" not in data:
                continue

            img_b64 = data["image/png"]
            img_bytes = base64.b64decode(img_b64)

            meta = (
                CHART_METADATA[chart_idx]
                if chart_idx < len(CHART_METADATA)
                else {
                    "index": chart_idx + 1,
                    "cell_id": str(chart_idx + 1),
                    "filename": f"{chart_idx + 1:02d}_chart.png",
                    "title": f"Biểu đồ {chart_idx + 1}",
                    "problem": "Khám phá bổ sung",
                }
            )

            file_path = output_dir / meta["filename"]
            file_path.write_bytes(img_bytes)

            file_size_kb = len(img_bytes) / 1024.0
            logging.info(
                "Đã xuất [%02d/%02d] %s (%.1f KB) - %s",
                chart_idx + 1,
                len(CHART_METADATA),
                meta["filename"],
                file_size_kb,
                meta["title"],
            )

            extracted_records.append(
                {
                    "index": chart_idx + 1,
                    "filename": meta["filename"],
                    "path": file_path,
                    "size_kb": file_size_kb,
                    "title": meta["title"],
                    "problem": meta["problem"],
                }
            )
            chart_idx += 1

    # Tạo tệp README.md mục lục thư mục ảnh
    readme_path = output_dir / "README.md"
    readme_lines = [
        "# DANH MỤC HÌNH ẢNH & BIỂU ĐỒ TRỰC QUAN HÓA GIAO THÔNG TP.HCM",
        "## Trích xuất từ Jupyter Notebook: `EDA_Giao_Thong_TPHCM_5_Van_De_Thuc_Te.ipynb`",
        "",
        f"- **Tổng số biểu đồ:** {len(extracted_records)} hình ảnh chuẩn chất lượng cao (DPI 160).",
        f"- **Đường dẫn thư mục:** `{output_dir.as_posix()}`",
        "",
        "| STT | Tên tệp ảnh | Vấn đề phân tích | Tiêu đề nội dung biểu đồ | Dung lượng |",
        "| :---: | :--- | :--- | :--- | :---: |",
    ]

    for rec in extracted_records:
        readme_lines.append(
            f"| **{rec['index']:02d}** | [`{rec['filename']}`]({rec['filename']}) | {rec['problem']} | {rec['title']} | {rec['size_kb']:.1f} KB |"
        )

    readme_lines.extend(
        [
            "",
            "---",
            "*Ghi chú: Toàn bộ ảnh đã được khử hoàn toàn các tiêu đề con trong ngoặc đơn, sửa lỗi hiển thị thang đo trục tọa độ và căn chỉnh nhãn thẩm mỹ hiện đại.*",
        ]
    )

    readme_path.write_text("\n".join(readme_lines) + "\n", encoding="utf-8")
    logging.info("Đã tạo tệp mục lục hình ảnh: %s", readme_path)

    return extracted_records


def main() -> int:
    """CLI Entry point cho tác vụ xuất biểu đồ từ notebook."""
    parser = argparse.ArgumentParser(
        description="Trích xuất toàn bộ biểu đồ từ notebook thành thư mục ảnh PNG"
    )
    parser.add_argument(
        "--notebook",
        type=Path,
        default=DEFAULT_NOTEBOOK,
        help="Đường dẫn tới tệp Jupyter Notebook (mặc định: final_lab/EDA_Giao_Thong_TPHCM_5_Van_De_Thuc_Te.ipynb)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Đường dẫn thư mục lưu ảnh (mặc định: final_lab/figures)",
    )
    args = parser.parse_args()

    try:
        logging.info("Bắt đầu trích xuất biểu đồ từ: %s", args.notebook)
        results = extract_charts_from_notebook(args.notebook, args.output)
        logging.info(
            "Hoàn tất! Đã trích xuất thành công %d biểu đồ vào: %s", len(results), args.output
        )
        return 0
    except Exception as error:
        logging.error("Lỗi khi trích xuất biểu đồ: %s", error)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

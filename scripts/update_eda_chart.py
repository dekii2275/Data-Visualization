#!/usr/bin/env python3
"""
Tách thành 2 biểu đồ riêng biệt (standalone figures / separate cells) trong notebook process_and_eda.ipynb:
1. Biểu đồ 1: Donut Chart - Phân bố mức phục vụ (LOS)
2. Biểu đồ 2: Ranked Bar Chart - Tỷ lệ kẹt xe (LOS E-F) theo cấp đường
"""

import argparse
import base64
import io
import json
import logging
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "final_lab" / "data"
REPORT_ASSETS = BASE_DIR / "final_lab" / "eda_report" / "assets"
SLIDES_ASSETS = BASE_DIR / "final_lab" / "slides" / "assets"


cell1_code = """# Biểu đồ 1: Phân bố mức phục vụ giao thông (LOS)
fig, ax = plt.subplots(figsize=(6, 4.8))

c_counts = [
    train_df["LOS"].isin(["A", "B", "C"]).sum(),
    train_df["LOS"].eq("D").sum(),
    train_df["LOS"].isin(["E", "F"]).sum(),
]
total_n = len(train_df)
c_labels = ["Thông suốt (A-C)", "Cận ùn ứ (D)", "Kẹt xe (E-F)"]
c_colors = ["#10b981", "#f59e0b", "#ef4444"]

wedges, texts, autotexts = ax.pie(
    c_counts,
    autopct="%1.1f%%",
    pctdistance=0.76,
    startangle=140,
    colors=c_colors,
    wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2.5),
)
for at in autotexts:
    at.set_color("white")
    at.set_fontweight("bold")
    at.set_fontsize(11)

ax.text(0, 0.06, f"{total_n:,}", ha="center", va="center", fontsize=14, fontweight="bold", color="#0f172a")
ax.text(0, -0.12, "mẫu quan sát", ha="center", va="center", fontsize=9.5, color="#64748b")

ax.legend(
    wedges, c_labels,
    loc="upper center",
    bbox_to_anchor=(0.5, -0.05),
    ncol=3,
    frameon=False,
    fontsize=9.5,
)
ax.set_title("Phân Bố Mức Phục Vụ (LOS)", fontsize=12, fontweight="bold", pad=12)

plt.tight_layout()
plt.show()
"""


cell2_code = """# Biểu đồ 2: Tỷ lệ kẹt xe (LOS E-F) theo phân cấp đường
fig, ax = plt.subplots(figsize=(7.5, 4.2))

road_names = {
    "trunk": "Đường trục chính",
    "primary": "Đường cấp 1",
    "secondary": "Đường cấp 2",
    "tertiary": "Đường nhánh",
    "unclassified": "Đường nội bộ",
    "other": "Khác",
}

stats = train_df.groupby("street_type_clean").agg(
    severe_pct=("LOS", lambda x: x.isin(["E", "F"]).mean() * 100),
).sort_values(by="severe_pct", ascending=True)

stats["label"] = stats.index.map(road_names)
city_avg = train_df["LOS"].isin(["E", "F"]).mean() * 100

bar_colors = ["#ef4444" if v >= 25 else ("#f59e0b" if v >= 15 else "#10b981") for v in stats["severe_pct"]]

y_pos = np.arange(len(stats))
bars = ax.barh(
    y_pos,
    stats["severe_pct"],
    color=bar_colors,
    height=0.52,
    edgecolor="#334155",
    linewidth=0.5,
    alpha=0.92,
)

# Đường trung bình đô thị
ax.axvline(city_avg, color="#dc2626", linestyle="--", linewidth=1.4, alpha=0.85)
ax.text(
    city_avg + 0.5,
    0.2,
    f"TB: {city_avg:.1f}%",
    color="#dc2626",
    fontweight="bold",
    fontsize=9.5,
    va="center",
)

ax.set_yticks(y_pos)
ax.set_yticklabels(stats["label"], fontweight="bold", fontsize=10)
ax.set_xlabel("Tỷ lệ kẹt xe LOS E-F (%)", fontsize=10, labelpad=8)
ax.set_xlim(0, 35)
ax.set_title("Tỷ Lệ Kẹt Xe Theo Cấp Đường", fontsize=12, fontweight="bold", pad=12)
ax.grid(axis="x", linestyle="--", alpha=0.5)

for bar, pct in zip(bars, stats["severe_pct"]):
    ax.text(
        bar.get_width() + 0.6,
        bar.get_y() + bar.get_height() / 2,
        f"{pct:.1f}%",
        va="center",
        ha="left",
        fontsize=10,
        fontweight="bold",
        color="#1e293b",
    )

plt.tight_layout()
plt.show()
"""


def generate_charts() -> tuple[str, str]:
    """Render the LOS figures and return PNG payloads for notebook outputs."""
    REPORT_ASSETS.mkdir(parents=True, exist_ok=True)
    SLIDES_ASSETS.mkdir(parents=True, exist_ok=True)

    train_df = pd.read_csv(DATA_DIR / "train.csv")
    major_road_types = ["primary", "secondary", "tertiary", "trunk", "unclassified"]
    train_df["street_type_clean"] = train_df["street_type"].apply(
        lambda x: x if x in major_road_types else "other"
    )

    plt.rcParams["font.sans-serif"] = "DejaVu Sans"
    plt.rcParams["axes.edgecolor"] = "#cbd5e1"
    plt.rcParams["axes.linewidth"] = 0.8

    # =============================================================
    # 1. BIỂU ĐỒ 1: DONUT CHART (Phân Bố Mức Phục Vụ LOS)
    # =============================================================
    fig1, ax1 = plt.subplots(figsize=(6, 4.8))
    c_counts = [
        train_df["LOS"].isin(["A", "B", "C"]).sum(),
        train_df["LOS"].eq("D").sum(),
        train_df["LOS"].isin(["E", "F"]).sum(),
    ]
    total_n = len(train_df)
    c_labels = ["Thông suốt (A-C)", "Cận ùn ứ (D)", "Kẹt xe (E-F)"]
    c_colors = ["#10b981", "#f59e0b", "#ef4444"]

    wedges, texts, autotexts = ax1.pie(
        c_counts,
        autopct="%1.1f%%",
        pctdistance=0.76,
        startangle=140,
        colors=c_colors,
        wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2.5),
    )
    for at in autotexts:
        at.set_color("white")
        at.set_fontweight("bold")
        at.set_fontsize(11)

    ax1.text(
        0,
        0.06,
        f"{total_n:,}",
        ha="center",
        va="center",
        fontsize=14,
        fontweight="bold",
        color="#0f172a",
    )
    ax1.text(0, -0.12, "mẫu quan sát", ha="center", va="center", fontsize=9.5, color="#64748b")

    ax1.legend(
        wedges,
        c_labels,
        loc="upper center",
        bbox_to_anchor=(0.5, -0.05),
        ncol=3,
        frameon=False,
        fontsize=9.5,
    )
    ax1.set_title("Phân Bố Mức Phục Vụ (LOS)", fontsize=12, fontweight="bold", pad=12)
    plt.tight_layout()

    fig1.savefig(REPORT_ASSETS / "chart_los_distribution_donut.png", dpi=200, bbox_inches="tight")
    fig1.savefig(SLIDES_ASSETS / "chart_los_distribution_donut.png", dpi=200, bbox_inches="tight")

    buf1 = io.BytesIO()
    plt.savefig(buf1, format="png", dpi=150, bbox_inches="tight")
    buf1.seek(0)
    img1_b64 = base64.b64encode(buf1.read()).decode("utf-8")
    plt.close(fig1)

    # =============================================================
    # 2. BIỂU ĐỒ 2: RANKED BAR CHART (Tỷ Lệ Kẹt Xe Theo Cấp Đường)
    # =============================================================
    fig2, ax2 = plt.subplots(figsize=(7.5, 4.2))
    road_names = {
        "trunk": "Đường trục chính",
        "primary": "Đường cấp 1",
        "secondary": "Đường cấp 2",
        "tertiary": "Đường nhánh",
        "unclassified": "Đường nội bộ",
        "other": "Khác",
    }

    stats = (
        train_df.groupby("street_type_clean")
        .agg(
            severe_pct=("LOS", lambda x: x.isin(["E", "F"]).mean() * 100),
        )
        .sort_values(by="severe_pct", ascending=True)
    )

    stats["label"] = stats.index.map(road_names)
    city_avg = train_df["LOS"].isin(["E", "F"]).mean() * 100

    bar_colors = [
        "#ef4444" if v >= 25 else ("#f59e0b" if v >= 15 else "#10b981") for v in stats["severe_pct"]
    ]

    y_pos = np.arange(len(stats))
    bars = ax2.barh(
        y_pos,
        stats["severe_pct"],
        color=bar_colors,
        height=0.52,
        edgecolor="#334155",
        linewidth=0.5,
        alpha=0.92,
    )

    # Đường trung bình đô thị
    ax2.axvline(city_avg, color="#dc2626", linestyle="--", linewidth=1.4, alpha=0.85)
    ax2.text(
        city_avg + 0.5,
        0.2,
        f"TB: {city_avg:.1f}%",
        color="#dc2626",
        fontweight="bold",
        fontsize=9.5,
        va="center",
    )

    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(stats["label"], fontweight="bold", fontsize=10)
    ax2.set_xlabel("Tỷ lệ kẹt xe LOS E-F (%)", fontsize=10, labelpad=8)
    ax2.set_xlim(0, 35)
    ax2.set_title("Tỷ Lệ Kẹt Xe Theo Cấp Đường", fontsize=12, fontweight="bold", pad=12)
    ax2.grid(axis="x", linestyle="--", alpha=0.5)

    for bar, pct in zip(bars, stats["severe_pct"]):
        ax2.text(
            bar.get_width() + 0.6,
            bar.get_y() + bar.get_height() / 2,
            f"{pct:.1f}%",
            va="center",
            ha="left",
            fontsize=10,
            fontweight="bold",
            color="#1e293b",
        )

    plt.tight_layout()

    fig2.savefig(REPORT_ASSETS / "chart_road_congestion_bar.png", dpi=200, bbox_inches="tight")
    fig2.savefig(SLIDES_ASSETS / "chart_road_congestion_bar.png", dpi=200, bbox_inches="tight")

    buf2 = io.BytesIO()
    plt.savefig(buf2, format="png", dpi=150, bbox_inches="tight")
    buf2.seek(0)
    img2_b64 = base64.b64encode(buf2.read()).decode("utf-8")
    plt.close(fig2)

    return img1_b64, img2_b64


def update_notebooks(img1_b64: str, img2_b64: str) -> None:
    """Replace chart cells in both notebook copies using rendered PNG payloads."""
    cell1_source = [line + "\n" for line in cell1_code.splitlines()]
    cell2_source = [line + "\n" for line in cell2_code.splitlines()]

    notebooks = [
        BASE_DIR / "final_lab" / "process_and_eda.ipynb",
        BASE_DIR / "final_lab" / "source" / "process_and_eda.ipynb",
    ]

    for nb_file in notebooks:
        if not nb_file.exists():
            continue
        with open(nb_file, encoding="utf-8") as f:
            nb = json.load(f)

        # Tìm vị trí cell 4.0
        target_idx = None
        for idx, cell in enumerate(nb["cells"]):
            src = "".join(cell.get("source", []))
            if "4.0. Thông Tin Cơ Bản Của Dữ Liệu" in src:
                target_idx = idx
                break

        if target_idx is None:
            logging.warning("Target section missing in %s; skipping", nb_file)
            continue

        if target_idx is not None:
            code_idx = target_idx + 1

            # Cell 1 (Donut)
            cell_donut = {
                "cell_type": "code",
                "execution_count": 9,
                "id": "los-distribution-donut",
                "metadata": {},
                "source": cell1_source,
                "outputs": [
                    {
                        "data": {
                            "image/png": img1_b64,
                            "text/plain": ["<Figure size 600x480 with 1 Axes>"],
                        },
                        "metadata": {},
                        "output_type": "display_data",
                    }
                ],
            }

            # Cell 2 (Bar)
            cell_bar = {
                "cell_type": "code",
                "execution_count": 10,
                "id": "road-congestion-bar",
                "metadata": {},
                "source": cell2_source,
                "outputs": [
                    {
                        "data": {
                            "image/png": img2_b64,
                            "text/plain": ["<Figure size 750x420 with 1 Axes>"],
                        },
                        "metadata": {},
                        "output_type": "display_data",
                    }
                ],
            }

            # Kiểm tra xem cell tiếp theo đã là cell biểu đồ 2 chưa hay đang là cell gộp
            if code_idx + 1 < len(nb["cells"]) and "Biểu đồ 2" in "".join(
                nb["cells"][code_idx + 1].get("source", [])
            ):
                # Đã tách từ trước, chỉ cập nhật
                nb["cells"][code_idx] = cell_donut
                nb["cells"][code_idx + 1] = cell_bar
            else:
                # Thay thế cell gộp và chèn thêm cell 2
                nb["cells"][code_idx] = cell_donut
                nb["cells"].insert(code_idx + 1, cell_bar)

        with open(nb_file, "w", encoding="utf-8") as f:
            json.dump(nb, f, ensure_ascii=False, indent=1)
        logging.info("Updated notebook charts: %s", nb_file)


def main() -> None:
    """Regenerate chart assets and refresh their corresponding notebook cells."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    update_notebooks(*generate_charts())


if __name__ == "__main__":
    main()

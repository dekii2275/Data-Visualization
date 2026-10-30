import crud.traffic as traffic_crud
from schemas.simulation import PolicySimulationRequest, PolicySimulationResponse
from sqlalchemy.orm import Session


class SimulationService:
    @staticmethod
    def simulate_policy_impact(
        db: Session, request: PolicySimulationRequest
    ) -> PolicySimulationResponse:
        """Tính toán ảnh hưởng What-If khi kích hoạt các giải pháp thông minh."""
        segments = traffic_crud.get_segments(db)
        hour_int = int(request.current_hour)

        baseline_severe = 0
        simulated_severe = 0
        improved_count = 0
        corridors = []
        los_dist: dict[str, int] = {"A": 0, "B": 0, "C": 0, "D": 0, "E": 0, "F": 0}

        for s in segments:
            hourly_los = s.hourly_los or []
            orig_los = hourly_los[hour_int] if 0 <= hour_int < len(hourly_los) else s.dominant_los

            if orig_los in ["E", "F"]:
                baseline_severe += 1

            new_los = orig_los
            is_corridor = (
                "Lý Thường Kiệt" in s.name
                or "Tô Hiến Thành" in s.name
                or "3 Tháng 2" in s.name
                or "Thành Thái" in s.name
            )

            # Apply simulation logic based on policy toggles
            if is_corridor:
                if s.name not in corridors:
                    corridors.append(s.name)

                # Adaptive green wave improvement
                if request.adaptive:
                    if new_los == "F":
                        new_los = "D"
                    elif new_los == "E":
                        new_los = "C"
                    elif new_los == "D":
                        new_los = "B"

                # Tidal flow lane reversible
                if request.tidal and ("Lý Thường Kiệt" in s.name or "3 Tháng 2" in s.name):
                    if new_los in ["D", "C"]:
                        new_los = "B"

                # No-left turns at critical intersections
                if request.noLeft and "Tô Hiến Thành" in s.name:
                    if new_los == "B":
                        new_los = "A"

                if new_los != orig_los:
                    improved_count += 1

            if new_los in ["E", "F"]:
                simulated_severe += 1

            los_dist[new_los] = los_dist.get(new_los, 0) + 1

        total = max(len(segments), 1)
        baseline_pct = round((baseline_severe / total) * 100, 1)
        simulated_pct = round((simulated_severe / total) * 100, 1)
        reduction_pct = round(max(0.0, baseline_pct - simulated_pct), 1)

        # Dynamic KPIs calculation
        speed_boost = 0.0
        time_saved = 0.0
        co2_saved = 0.0

        if request.adaptive:
            speed_boost += 6.5
            time_saved += 28.5
            co2_saved += 18.0
        if request.tidal:
            speed_boost += 4.2
            time_saved += 15.0
            co2_saved += 12.0
        if request.noLeft:
            speed_boost += 2.8
            time_saved += 11.0
            co2_saved += 8.5

        return PolicySimulationResponse(
            current_hour=request.current_hour,
            policies_applied={
                "adaptive": request.adaptive,
                "tidal": request.tidal,
                "noLeft": request.noLeft,
            },
            improved_segments_count=improved_count,
            severe_pct_baseline=baseline_pct,
            severe_pct_simulated=simulated_pct,
            severe_reduction_pct=reduction_pct,
            avg_speed_improvement_kmh=round(speed_boost, 1),
            time_saved_pct=round(time_saved, 1),
            co2_reduced_pct=round(co2_saved, 1),
            corridors_impacted=corridors[:5],
            los_distribution=los_dist,
        )

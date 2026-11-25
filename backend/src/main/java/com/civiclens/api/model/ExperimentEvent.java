package com.civiclens.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "experiment_events")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExperimentEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Builder.Default
    private String experimentName = "smart_road_dashboard";

    @Column(nullable = false)
    private String variant; // "control" (Version A) or "experiment" (Version B)

    @Column(nullable = false)
    private String eventType; // "dashboard_view", "pothole_alert_view", "issue_report_submit", "map_interaction", "traffic_recommendation_click"

    @Column(nullable = false)
    private String sessionId; // Anonymous session UUID (privacy-conscious, no PII)

    private Long userId; // Optional authenticated user ID

    @Column(columnDefinition = "TEXT")
    private String metadata; // Safe metadata, e.g. {"source": "quick_pothole_report"}

    @CreatedDate @Column(updatable = false)
    private LocalDateTime timestamp;
}

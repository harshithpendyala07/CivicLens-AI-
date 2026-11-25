package com.civiclens.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analyses")
@EntityListeners(AuditingEntityListener.class)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AiAnalysis {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;
    private String priority;
    private String severity;
    private String estimatedFixTime;

    @Column(columnDefinition = "TEXT")
    private String aiDescription;

    private Double confidence;
    @Builder.Default
    private boolean verified = false;

    @Column(columnDefinition = "TEXT")
    private String rawResponse;

    @CreatedDate @Column(updatable = false)
    private LocalDateTime analyzedAt;
}

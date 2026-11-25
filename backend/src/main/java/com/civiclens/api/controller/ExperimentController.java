package com.civiclens.api.controller;

import com.civiclens.api.model.ExperimentEvent;
import com.civiclens.api.model.User;
import com.civiclens.api.service.ExperimentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ExperimentController {

    private final ExperimentService experimentService;

    @Data
    public static class TrackEventRequest {
        private String experimentName;
        private String variant; // "control" or "experiment"
        private String eventType; // "dashboard_view", "pothole_alert_view", "issue_report_submit", "map_interaction", "traffic_recommendation_click"
        private String sessionId; // privacy-safe anonymous session UUID
        private String metadata;
    }

    @PostMapping("/experiments/track")
    public ResponseEntity<?> trackEvent(@RequestBody TrackEventRequest req, Authentication auth) {
        Long userId = null;
        if (auth != null && auth.getPrincipal() instanceof User) {
            userId = ((User) auth.getPrincipal()).getId();
        }

        if (req.getEventType() == null || req.getEventType().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "eventType is required"));
        }

        ExperimentEvent saved = experimentService.recordEvent(
            req.getExperimentName(),
            req.getVariant(),
            req.getEventType(),
            req.getSessionId(),
            userId,
            req.getMetadata()
        );

        return ResponseEntity.ok(Map.of(
            "status", "recorded",
            "eventId", saved.getId(),
            "variant", saved.getVariant(),
            "eventType", saved.getEventType()
        ));
    }

    @GetMapping("/admin/experiments/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminExperimentMetrics(
        @RequestParam(defaultValue = "smart_road_dashboard") String experimentName
    ) {
        return ResponseEntity.ok(experimentService.getExperimentMetrics(experimentName));
    }

    @GetMapping("/experiments/public-metrics")
    public ResponseEntity<?> getPublicMetrics(
        @RequestParam(defaultValue = "smart_road_dashboard") String experimentName
    ) {
        return ResponseEntity.ok(experimentService.getExperimentMetrics(experimentName));
    }
}

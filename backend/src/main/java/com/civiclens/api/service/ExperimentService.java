package com.civiclens.api.service;

import com.civiclens.api.model.ExperimentEvent;
import com.civiclens.api.repository.ExperimentEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExperimentService {

    private final ExperimentEventRepository eventRepo;

    @Transactional
    public ExperimentEvent recordEvent(
        String experimentName,
        String variant,
        String eventType,
        String sessionId,
        Long userId,
        String metadata
    ) {
        String safeExp = (experimentName != null && !experimentName.isBlank()) ? experimentName.trim() : "smart_road_dashboard";
        String safeVariant = (variant != null && variant.equalsIgnoreCase("experiment")) ? "experiment" : "control";
        String safeSessionId = (sessionId != null && !sessionId.isBlank()) ? sessionId.trim() : UUID.randomUUID().toString();

        ExperimentEvent event = ExperimentEvent.builder()
            .experimentName(safeExp)
            .variant(safeVariant)
            .eventType(eventType)
            .sessionId(safeSessionId)
            .userId(userId)
            .metadata(metadata)
            .build();

        return eventRepo.save(event);
    }

    public Map<String, Object> getExperimentMetrics(String experimentName) {
        String exp = (experimentName != null && !experimentName.isBlank()) ? experimentName : "smart_road_dashboard";

        List<String> controlSessions = eventRepo.findDistinctSessionsByVariant(exp, "control");
        List<String> experimentSessions = eventRepo.findDistinctSessionsByVariant(exp, "experiment");

        List<String> controlConverted = eventRepo.findDistinctConvertedSessionsByVariant(exp, "control");
        List<String> experimentConverted = eventRepo.findDistinctConvertedSessionsByVariant(exp, "experiment");

        long totalControlSessions = controlSessions.size();
        long totalExperimentSessions = experimentSessions.size();

        long controlSuccessCount = controlConverted.size();
        long experimentSuccessCount = experimentConverted.size();

        double controlRate = totalControlSessions > 0 ? ((double) controlSuccessCount / totalControlSessions) * 100.0 : 0.0;
        double experimentRate = totalExperimentSessions > 0 ? ((double) experimentSuccessCount / totalExperimentSessions) * 100.0 : 0.0;

        double relativeLift = 0.0;
        if (controlRate > 0) {
            relativeLift = ((experimentRate - controlRate) / controlRate) * 100.0;
        } else if (experimentRate > 0) {
            relativeLift = 100.0;
        }

        // Event breakdowns
        Map<String, Long> controlBreakdown = new LinkedHashMap<>();
        for (Object[] row : eventRepo.countEventsByVariantGrouped(exp, "control")) {
            controlBreakdown.put((String) row[0], (Long) row[1]);
        }

        Map<String, Long> experimentBreakdown = new LinkedHashMap<>();
        for (Object[] row : eventRepo.countEventsByVariantGrouped(exp, "experiment")) {
            experimentBreakdown.put((String) row[0], (Long) row[1]);
        }

        long totalParticipants = totalControlSessions + totalExperimentSessions;
        String status = totalParticipants < 5 ? "INSUFFICIENT_DATA" : "ACTIVE";

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("experimentName", exp);
        response.put("featureFlag", "smart_road_dashboard");
        response.put("status", status);
        response.put("totalParticipants", totalParticipants);
        response.put("relativeLift", Math.round(relativeLift * 10.0) / 10.0);

        Map<String, Object> controlData = new LinkedHashMap<>();
        controlData.put("variantName", "Version A (Control)");
        controlData.put("description", "Standard Civic Defect Dashboard");
        controlData.put("eligibleSessions", totalControlSessions);
        controlData.put("successfulActions", controlSuccessCount);
        controlData.put("conversionRate", Math.round(controlRate * 10.0) / 10.0);
        controlData.put("eventCounts", controlBreakdown);

        Map<String, Object> experimentData = new LinkedHashMap<>();
        experimentData.put("variantName", "Version B (Experiment)");
        experimentData.put("description", "Smart Road Monitoring Dashboard (Risk Priority & Alerts)");
        experimentData.put("eligibleSessions", totalExperimentSessions);
        experimentData.put("successfulActions", experimentSuccessCount);
        experimentData.put("conversionRate", Math.round(experimentRate * 10.0) / 10.0);
        experimentData.put("eventCounts", experimentBreakdown);

        response.put("control", controlData);
        response.put("experiment", experimentData);

        return response;
    }
}

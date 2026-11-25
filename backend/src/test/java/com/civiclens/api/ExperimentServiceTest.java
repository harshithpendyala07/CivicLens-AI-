package com.civiclens.api;

import com.civiclens.api.model.ExperimentEvent;
import com.civiclens.api.repository.ExperimentEventRepository;
import com.civiclens.api.service.ExperimentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class ExperimentServiceTest {

    @Autowired
    private ExperimentService experimentService;

    @Autowired
    private ExperimentEventRepository eventRepository;

    private final String testExp = "test_smart_road_" + UUID.randomUUID().toString().substring(0, 8);

    @Test
    public void testRecordEvent() {
        String sessionId = "sess_" + UUID.randomUUID();
        ExperimentEvent event = experimentService.recordEvent(
            testExp, "control", "dashboard_view", sessionId, 1L, "{\"source\":\"test\"}"
        );

        assertNotNull(event.getId());
        assertEquals(testExp, event.getExperimentName());
        assertEquals("control", event.getVariant());
        assertEquals("dashboard_view", event.getEventType());
        assertEquals(sessionId, event.getSessionId());
    }

    @Test
    public void testExperimentMetricsCalculation() {
        // Record 10 control sessions, 2 with actions (20% conversion)
        for (int i = 1; i <= 10; i++) {
            String sid = "ctrl_sess_" + i + "_" + UUID.randomUUID();
            experimentService.recordEvent(testExp, "control", "dashboard_view", sid, null, null);
            if (i <= 2) {
                experimentService.recordEvent(testExp, "control", "issue_report_submit", sid, null, null);
            }
        }

        // Record 10 experiment sessions, 5 with actions (50% conversion)
        for (int i = 1; i <= 10; i++) {
            String sid = "exp_sess_" + i + "_" + UUID.randomUUID();
            experimentService.recordEvent(testExp, "experiment", "dashboard_view", sid, null, null);
            if (i <= 5) {
                experimentService.recordEvent(testExp, "experiment", "pothole_alert_view", sid, null, null);
            }
        }

        Map<String, Object> metrics = experimentService.getExperimentMetrics(testExp);
        assertNotNull(metrics);
        assertEquals(testExp, metrics.get("experimentName"));
        assertEquals("ACTIVE", metrics.get("status"));
        assertEquals(20L, metrics.get("totalParticipants"));

        @SuppressWarnings("unchecked")
        Map<String, Object> control = (Map<String, Object>) metrics.get("control");
        assertNotNull(control);
        assertEquals(10L, control.get("eligibleSessions"));
        assertEquals(2L, control.get("successfulActions"));
        assertEquals(20.0, control.get("conversionRate"));

        @SuppressWarnings("unchecked")
        Map<String, Object> experiment = (Map<String, Object>) metrics.get("experiment");
        assertNotNull(experiment);
        assertEquals(10L, experiment.get("eligibleSessions"));
        assertEquals(5L, experiment.get("successfulActions"));
        assertEquals(50.0, experiment.get("conversionRate"));

        // Relative lift: (50 - 20) / 20 * 100 = 150%
        Double lift = (Double) metrics.get("relativeLift");
        assertEquals(150.0, lift);
    }

    @Test
    public void testInsufficientDataStatus() {
        String freshExp = "sparse_exp_" + UUID.randomUUID().toString().substring(0, 8);
        // Only 2 sessions
        experimentService.recordEvent(freshExp, "control", "dashboard_view", "s1", null, null);
        experimentService.recordEvent(freshExp, "experiment", "dashboard_view", "s2", null, null);

        Map<String, Object> metrics = experimentService.getExperimentMetrics(freshExp);
        assertEquals("INSUFFICIENT_DATA", metrics.get("status"));
    }
}

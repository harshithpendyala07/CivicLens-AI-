package com.civiclens.api.repository;

import com.civiclens.api.model.ExperimentEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ExperimentEventRepository extends JpaRepository<ExperimentEvent, Long> {

    long countByExperimentNameAndVariant(String experimentName, String variant);

    long countByExperimentNameAndVariantAndEventType(String experimentName, String variant, String eventType);

    @Query("SELECT DISTINCT e.sessionId FROM ExperimentEvent e WHERE e.experimentName = :exp AND e.variant = :variant AND e.eventType = 'dashboard_view'")
    List<String> findDistinctSessionsByVariant(@Param("exp") String exp, @Param("variant") String variant);

    @Query("SELECT DISTINCT e.sessionId FROM ExperimentEvent e WHERE e.experimentName = :exp AND e.variant = :variant AND e.eventType IN ('issue_report_submit', 'pothole_alert_view', 'map_interaction', 'traffic_recommendation_click')")
    List<String> findDistinctConvertedSessionsByVariant(@Param("exp") String exp, @Param("variant") String variant);

    @Query("SELECT e.eventType, COUNT(e) FROM ExperimentEvent e WHERE e.experimentName = :exp AND e.variant = :variant GROUP BY e.eventType")
    List<Object[]> countEventsByVariantGrouped(@Param("exp") String exp, @Param("variant") String variant);
}

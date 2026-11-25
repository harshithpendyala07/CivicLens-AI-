package com.civiclens.api.repository;

import com.civiclens.api.model.Report;
import com.civiclens.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;

public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findByReporter(User reporter, Pageable pageable);
    Page<Report> findByStatus(Report.Status status, Pageable pageable);
    Page<Report> findByPriority(Report.Priority priority, Pageable pageable);
    Page<Report> findByStatusAndPriority(Report.Status status, Report.Priority priority, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:priority IS NULL OR r.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(r.category) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<Report> findWithFilters(
        @Param("status") Report.Status status,
        @Param("priority") Report.Priority priority,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT r FROM Report r WHERE r.reporter = :user AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<Report> findByReporterWithFilters(
        @Param("user") User user,
        @Param("status") Report.Status status,
        @Param("search") String search,
        Pageable pageable
    );

    long countByStatus(Report.Status status);
    long countByPriority(Report.Priority priority);

    @Query("SELECT r.category, COUNT(r) FROM Report r GROUP BY r.category")
    List<Object[]> countByCategory();

    @Query("SELECT r.priority, COUNT(r) FROM Report r GROUP BY r.priority")
    List<Object[]> countByPriorityGrouped();
}

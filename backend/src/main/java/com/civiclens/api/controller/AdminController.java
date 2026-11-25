package com.civiclens.api.controller;

import com.civiclens.api.model.*;
import com.civiclens.api.repository.ReportRepository;
import com.civiclens.api.repository.UserRepository;
import com.civiclens.api.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final ReportService reportService;
    private final ReportRepository reportRepo;
    private final UserRepository userRepo;

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        long total = reportRepo.count();
        long open = reportRepo.countByStatus(Report.Status.OPEN);
        long inProgress = reportRepo.countByStatus(Report.Status.IN_PROGRESS);
        long resolved = reportRepo.countByStatus(Report.Status.RESOLVED);
        long closed = reportRepo.countByStatus(Report.Status.CLOSED);

        Map<String, Long> catBreakdown = new LinkedHashMap<>();
        reportRepo.countByCategory().forEach(row -> catBreakdown.put((String) row[0], (Long) row[1]));

        return ResponseEntity.ok(Map.of(
            "totalReports", total,
            "openReports", open,
            "inProgressReports", inProgress,
            "resolvedReports", resolved,
            "closedReports", closed,
            "categoryBreakdown", catBreakdown
        ));
    }

    @GetMapping("/reports")
    public ResponseEntity<?> reports(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String priority,
        @RequestParam(required = false) String search
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Report.Status s = status != null && !status.isBlank() ? Report.Status.valueOf(status) : null;
        Report.Priority p = priority != null && !priority.isBlank() ? Report.Priority.valueOf(priority) : null;
        return ResponseEntity.ok(reportService.getAll(s, p, search, pageable));
    }

    @PatchMapping("/reports/{id}/status")
    public ResponseEntity<?> updateStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> body,
        Authentication auth
    ) {
        User admin = (User) auth.getPrincipal();
        Report.Status newStatus = Report.Status.valueOf(body.get("status"));
        String note = body.getOrDefault("note", "Status updated by admin");
        return ResponseEntity.ok(reportService.updateStatus(id, newStatus, admin, note));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> analytics() {
        Map<String, Long> catBreakdown = new LinkedHashMap<>();
        reportRepo.countByCategory().forEach(row -> catBreakdown.put((String) row[0], (Long) row[1]));

        Map<String, Long> priBreakdown = new LinkedHashMap<>();
        reportRepo.countByPriorityGrouped().forEach(row -> priBreakdown.put(row[0].toString(), (Long) row[1]));

        long total = reportRepo.count();
        long resolved = reportRepo.countByStatus(Report.Status.RESOLVED);
        long criticalOpen = reportRepo.countByStatus(Report.Status.OPEN);

        return ResponseEntity.ok(Map.of(
            "categoryBreakdown", catBreakdown,
            "priorityBreakdown", priBreakdown,
            "resolutionRate", total > 0 ? Math.round((resolved * 100.0) / total) : 0,
            "criticalOpen", criticalOpen,
            "aiAnalysisRate", 87,  // placeholder - track in production
            "avgResolutionTime", 48 // placeholder hours
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<?> users() {
        return ResponseEntity.ok(userRepo.findAll().stream().map(u -> Map.of(
            "id", u.getId(), "name", u.getName(), "email", u.getEmail(),
            "role", u.getRole(), "enabled", u.isEnabled()
        )).toList());
    }
}

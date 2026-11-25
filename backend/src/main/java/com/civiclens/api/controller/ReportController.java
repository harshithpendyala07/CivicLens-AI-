package com.civiclens.api.controller;

import com.civiclens.api.model.*;
import com.civiclens.api.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<?> getReports(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "createdAt,desc") String sort,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String search,
        Authentication auth
    ) {
        User user = (User) auth.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, parseSort(sort));
        Report.Status s = status != null && !status.isBlank() ? Report.Status.valueOf(status) : null;
        return ResponseEntity.ok(reportService.getByUser(user, s, search, pageable));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyReports(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String search,
        Authentication auth
    ) {
        User user = (User) auth.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Report.Status s = status != null && !status.isBlank() ? Report.Status.valueOf(status) : null;
        return ResponseEntity.ok(reportService.getByUser(user, s, search, pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllReports(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String priority,
        @RequestParam(required = false) String search
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Report.Status s = status != null && !status.isBlank() ? Report.Status.valueOf(status) : null;
        Report.Priority p = priority != null && !priority.isBlank() ? Report.Priority.valueOf(priority) : null;
        return ResponseEntity.ok(reportService.getAll(s, p, search, pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        var s = reportService.getStats();
        return ResponseEntity.ok(Map.of(
            "total", s.total(), "open", s.open(),
            "inProgress", s.inProgress(), "resolved", s.resolved(), "closed", s.closed()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getById(id));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createReport(
        @RequestParam String title,
        @RequestParam(required = false) String description,
        @RequestParam String category,
        @RequestParam(defaultValue = "MEDIUM") String priority,
        @RequestParam(required = false) String latitude,
        @RequestParam(required = false) String longitude,
        @RequestParam(required = false) String address,
        @RequestParam(required = false) MultipartFile[] images,
        Authentication auth
    ) throws Exception {
        User user = (User) auth.getPrincipal();
        Double lat = latitude != null && !latitude.isBlank() ? Double.parseDouble(latitude) : null;
        Double lng = longitude != null && !longitude.isBlank() ? Double.parseDouble(longitude) : null;
        Report report = reportService.createReport(
            user, title, description, category,
            Report.Priority.valueOf(priority), lat, lng, address, images
        );
        return ResponseEntity.status(201).body(report);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
        @PathVariable Long id,
        @RequestBody Map<String, String> body,
        Authentication auth
    ) {
        User user = (User) auth.getPrincipal();
        Comment c = reportService.addComment(id, user, body.get("text"));
        return ResponseEntity.ok(c);
    }

    private Sort parseSort(String sort) {
        String[] parts = sort.split(",");
        if (parts.length == 2) {
            return Sort.by("desc".equalsIgnoreCase(parts[1]) ? Sort.Direction.DESC : Sort.Direction.ASC, parts[0]);
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }
}

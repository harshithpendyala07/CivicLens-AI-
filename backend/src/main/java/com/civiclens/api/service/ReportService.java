package com.civiclens.api.service;

import com.civiclens.api.model.*;
import com.civiclens.api.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {
    private final ReportRepository reportRepo;
    private final GeminiAiService aiService;
    private final FileStorageService fileStorage;

    public Page<Report> getAll(Report.Status status, Report.Priority priority, String search, Pageable pageable) {
        return reportRepo.findWithFilters(status, priority, search, pageable);
    }

    public Page<Report> getByUser(User user, Report.Status status, String search, Pageable pageable) {
        return reportRepo.findByReporterWithFilters(user, status, search, pageable);
    }

    public Report getById(Long id) {
        return reportRepo.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
    }

    @Transactional
    public Report createReport(
        User reporter, String title, String description, String category,
        Report.Priority priority, Double lat, Double lng, String address,
        MultipartFile[] images
    ) throws IOException {
        Report report = Report.builder()
            .title(title)
            .description(description)
            .category(category)
            .priority(priority)
            .reporter(reporter)
            .location(Location.builder().latitude(lat).longitude(lng).address(address).build())
            .build();

        // Save images
        if (images != null) {
            for (MultipartFile img : images) {
                if (!img.isEmpty()) {
                    String filename = fileStorage.store(img);
                    report.getImages().add(ReportImage.builder()
                        .report(report)
                        .filename(filename)
                        .url("/api/files/" + filename)
                        .contentType(img.getContentType())
                        .size(img.getSize())
                        .build());
                }
            }
        }

        // AI analysis on first image
        if (images != null && images.length > 0 && !images[0].isEmpty()) {
            try {
                AiAnalysis ai = aiService.analyzeImage(images[0]);
                report.setAiAnalysis(ai);
                // Apply AI suggestions if priority is not explicitly overridden
                if (ai.getCategory() != null && category.equals("Other")) {
                    report.setCategory(ai.getCategory());
                }
            } catch (Exception e) {
                log.warn("AI analysis skipped: {}", e.getMessage());
            }
        }

        // Initial status update
        Report saved = reportRepo.save(report);
        saved.getUpdates().add(ReportUpdate.builder()
            .report(saved).updatedBy(reporter)
            .newStatus(Report.Status.OPEN).build());
        return reportRepo.save(saved);
    }

    @Transactional
    public Report updateStatus(Long id, Report.Status newStatus, User updatedBy, String note) {
        Report report = getById(id);
        Report.Status oldStatus = report.getStatus();
        report.setStatus(newStatus);
        report.getUpdates().add(ReportUpdate.builder()
            .report(report).updatedBy(updatedBy)
            .oldStatus(oldStatus).newStatus(newStatus).note(note)
            .build());
        return reportRepo.save(report);
    }

    @Transactional
    public Comment addComment(Long reportId, User author, String text) {
        Report report = getById(reportId);
        Comment comment = Comment.builder().report(report).author(author).text(text).build();
        report.getComments().add(comment);
        reportRepo.save(report);
        return comment;
    }

    public record StatsDto(long total, long open, long inProgress, long resolved, long closed) {}

    public StatsDto getStats() {
        return new StatsDto(
            reportRepo.count(),
            reportRepo.countByStatus(Report.Status.OPEN),
            reportRepo.countByStatus(Report.Status.IN_PROGRESS),
            reportRepo.countByStatus(Report.Status.RESOLVED),
            reportRepo.countByStatus(Report.Status.CLOSED)
        );
    }
}

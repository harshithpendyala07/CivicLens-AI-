package com.civiclens.api.controller;

import com.civiclens.api.model.AiAnalysis;
import com.civiclens.api.service.GeminiAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final GeminiAiService aiService;

    @PostMapping(value = "/analyze", consumes = "multipart/form-data")
    public ResponseEntity<?> analyze(@RequestParam("image") MultipartFile image) {
        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No image provided"));
        }
        AiAnalysis result = aiService.analyzeImage(image);
        return ResponseEntity.ok(Map.of(
            "category", result.getCategory(),
            "priority", result.getPriority(),
            "severity", result.getSeverity(),
            "estimatedFixTime", result.getEstimatedFixTime(),
            "aiDescription", result.getAiDescription(),
            "confidence", result.getConfidence(),
            "title", generateTitle(result.getCategory(), result.getSeverity()),
            "description", result.getAiDescription()
        ));
    }

    private String generateTitle(String category, String severity) {
        return String.format("%s %s — Needs Attention", severity != null ? severity : "", category != null ? category : "Infrastructure Issue").trim();
    }
}

package com.civiclens.api.service;

import com.civiclens.api.model.AiAnalysis;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.*;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.8-flash}")
    private String model;

    private final ObjectMapper mapper = new ObjectMapper();

    public AiAnalysis analyzeImage(MultipartFile image) {
        try {
            String base64 = Base64.getEncoder().encodeToString(image.getBytes());
            String mime = image.getContentType() != null ? image.getContentType() : "image/jpeg";

            String prompt = """
                Analyze this image of an infrastructure issue (pothole, water leak, garbage, broken infrastructure, etc.).
                Return a JSON object with EXACTLY these fields:
                {
                  "category": "one of: Pothole, Water Leak, Garbage, Street Light, Broken Sidewalk, Graffiti, Fallen Tree, Road Damage, Drainage Issue, Other",
                  "priority": "one of: LOW, MEDIUM, HIGH, CRITICAL",
                  "severity": "one of: Minor, Moderate, Severe, Critical",
                  "estimatedFixTime": "e.g. '2-4 hours', '1-3 days', '1-2 weeks'",
                  "aiDescription": "2-3 sentence description of what you see and why it needs attention",
                  "confidence": a number between 0 and 1
                }
                Return ONLY the JSON, no markdown, no explanations.
                If this is not an infrastructure issue, still return the JSON with category: "Other" and appropriate fields.
                """;

            String requestBody = mapper.writeValueAsString(Map.of(
                "contents", new Object[]{
                    Map.of("parts", new Object[]{
                        Map.of("text", prompt),
                        Map.of("inline_data", Map.of("mime_type", mime, "data", base64))
                    })
                },
                "generationConfig", Map.of(
                    "temperature", 0.1,
                    "maxOutputTokens", 512,
                    "responseMimeType", "application/json"
                )
            ));

            String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey
            );

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API error: {} - {}", response.statusCode(), response.body());
                return fallbackAnalysis();
            }

            JsonNode root = mapper.readTree(response.body());
            String text = root.at("/candidates/0/content/parts/0/text").asText();
            JsonNode result = mapper.readTree(text);

            return AiAnalysis.builder()
                .category(result.path("category").asText("Other"))
                .priority(result.path("priority").asText("MEDIUM"))
                .severity(result.path("severity").asText("Moderate"))
                .estimatedFixTime(result.path("estimatedFixTime").asText("1-3 days"))
                .aiDescription(result.path("aiDescription").asText("Infrastructure issue detected."))
                .confidence(result.path("confidence").asDouble(0.85))
                .rawResponse(text)
                .build();

        } catch (Exception e) {
            log.error("AI analysis failed: {}", e.getMessage());
            return fallbackAnalysis();
        }
    }

    private AiAnalysis fallbackAnalysis() {
        return AiAnalysis.builder()
            .category("Other")
            .priority("MEDIUM")
            .severity("Moderate")
            .estimatedFixTime("1-3 days")
            .aiDescription("AI analysis unavailable. Please categorize manually.")
            .confidence(0.0)
            .build();
    }
}

package com.civiclens.api.config;

import com.civiclens.api.model.*;
import com.civiclens.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepo;
    private final ReportRepository reportRepo;
    private final ExperimentEventRepository experimentRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        // Create demo users if not exist
        if (!userRepo.existsByEmail("admin@civiclens.app")) {
            User admin = userRepo.save(User.builder()
                .name("Harshith Pendyala")
                .email("admin@civiclens.app")
                .password(encoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .enabled(true)
                .build());

            User user = userRepo.save(User.builder()
                .name("Demo User")
                .email("user@civiclens.app")
                .password(encoder.encode("demo123"))
                .role(User.Role.USER)
                .enabled(true)
                .build());

            log.info("Demo accounts created: admin@civiclens.app / admin123, user@civiclens.app / demo123");

            // Seed sample reports
            String[][] samples = {
                {"Pothole on Main Road", "Large pothole causing accidents near junction", "Pothole", "HIGH", "17.3850", "78.4867", "Main Road, Hyderabad"},
                {"Water Leak Near Hostel A", "Major water pipe leaking for 3 days", "Water Leak", "CRITICAL", "14.6819", "77.6006", "Hostel A, JNTUA Campus"},
                {"Garbage Pile at Gate 2", "Accumulated garbage near entrance", "Garbage", "MEDIUM", "14.6825", "77.6010", "Gate 2, JNTUA Anantapur"},
                {"Broken Street Light Block 5", "Street light not working creating unsafe conditions", "Street Light", "HIGH", "14.6830", "77.6015", "Block 5, JNTUA Campus"},
                {"Damaged Sidewalk Near Library", "Cracked sidewalk creating trip hazard", "Broken Sidewalk", "LOW", "14.6815", "77.5998", "Library Road, JNTUA"},
            };

            for (String[] s : samples) {
                reportRepo.save(Report.builder()
                    .title(s[0]).description(s[1]).category(s[2])
                    .priority(Report.Priority.valueOf(s[3]))
                    .reporter(user)
                    .location(Location.builder()
                        .latitude(Double.parseDouble(s[4]))
                        .longitude(Double.parseDouble(s[5]))
                        .address(s[6]).build())
                    .build());
            }
            log.info("Sample reports created");
        }

        // Seed initial benchmark experiment event data if none exist
        if (experimentRepo.count() == 0) {
            log.info("Seeding initial Flagsmith A/B experiment benchmark events...");
            String exp = "smart_road_dashboard";

            // Control sessions (Version A) - 30 sessions, 6 conversions (20%)
            for (int i = 1; i <= 30; i++) {
                String sid = "session_ctrl_" + UUID.randomUUID().toString().substring(0, 8);
                experimentRepo.save(ExperimentEvent.builder()
                    .experimentName(exp).variant("control").eventType("dashboard_view").sessionId(sid).build());

                if (i <= 6) {
                    // Successful road-safety action
                    String action = (i % 2 == 0) ? "issue_report_submit" : "map_interaction";
                    experimentRepo.save(ExperimentEvent.builder()
                        .experimentName(exp).variant("control").eventType(action).sessionId(sid).build());
                }
            }

            // Experiment sessions (Version B - Smart Road Dashboard) - 32 sessions, 14 conversions (43.8%)
            for (int i = 1; i <= 32; i++) {
                String sid = "session_exp_" + UUID.randomUUID().toString().substring(0, 8);
                experimentRepo.save(ExperimentEvent.builder()
                    .experimentName(exp).variant("experiment").eventType("dashboard_view").sessionId(sid).build());

                // Alert view interaction
                if (i <= 22) {
                    experimentRepo.save(ExperimentEvent.builder()
                        .experimentName(exp).variant("experiment").eventType("pothole_alert_view").sessionId(sid).build());
                }

                if (i <= 14) {
                    // Successful road-safety action
                    String action = (i <= 6) ? "issue_report_submit" : ((i <= 10) ? "traffic_recommendation_click" : "map_interaction");
                    experimentRepo.save(ExperimentEvent.builder()
                        .experimentName(exp).variant("experiment").eventType(action).sessionId(sid).build());
                }
            }

            log.info("Flagsmith A/B benchmark experiment events seeded successfully");
        }
    }
}

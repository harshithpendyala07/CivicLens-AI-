package com.civiclens.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CivicLensApplication {
    public static void main(String[] args) {
        SpringApplication.run(CivicLensApplication.class, args);
    }
}

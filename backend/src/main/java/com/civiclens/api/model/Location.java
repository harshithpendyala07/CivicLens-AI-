package com.civiclens.api.model;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Location {
    private Double latitude;
    private Double longitude;
    private String address;
}

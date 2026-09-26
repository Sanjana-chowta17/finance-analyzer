package com.financeapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InsightResponse {
    private Long id;
    private String content;
    private LocalDateTime generatedAt;
}

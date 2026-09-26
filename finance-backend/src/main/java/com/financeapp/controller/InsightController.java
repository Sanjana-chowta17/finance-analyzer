package com.financeapp.controller;

import com.financeapp.dto.ChatRequest;
import com.financeapp.dto.ChatResponse;
import com.financeapp.dto.InsightResponse;
import com.financeapp.model.Insight;
import com.financeapp.security.AuthenticatedUser;
import com.financeapp.service.InsightService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
public class InsightController {

    private final InsightService insightService;

    public InsightController(InsightService insightService) {
        this.insightService = insightService;
    }

    @PostMapping("/generate")
    public InsightResponse generate(@AuthenticationPrincipal AuthenticatedUser user) {
        Insight i = insightService.generateMonthlyInsight(user.userId());
        return new InsightResponse(i.getId(), i.getContent(), i.getGeneratedAt());
    }

    @GetMapping
    public List<InsightResponse> history(@AuthenticationPrincipal AuthenticatedUser user) {
        return insightService.getHistory(user.userId())
                .stream()
                .map(i -> new InsightResponse(i.getId(), i.getContent(), i.getGeneratedAt()))
                .toList();
    }

    @PostMapping("/chat")
    public ChatResponse chat(@AuthenticationPrincipal AuthenticatedUser user,
                              @Valid @RequestBody ChatRequest request) {
        String answer = insightService.answerQuestion(user.userId(), request.getQuestion());
        return new ChatResponse(answer);
    }
}

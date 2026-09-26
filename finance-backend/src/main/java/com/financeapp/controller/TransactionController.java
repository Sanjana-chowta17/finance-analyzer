package com.financeapp.controller;

import com.financeapp.dto.TransactionRequest;
import com.financeapp.dto.TransactionResponse;
import com.financeapp.model.Transaction;
import com.financeapp.security.AuthenticatedUser;
import com.financeapp.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public List<TransactionResponse> getAll(@AuthenticationPrincipal AuthenticatedUser user) {
        return transactionService.getAllForUser(user.userId())
                .stream().map(TransactionResponse::from).toList();
    }

    @PostMapping
    public TransactionResponse create(@AuthenticationPrincipal AuthenticatedUser user,
                                       @Valid @RequestBody TransactionRequest request) {
        Transaction t = transactionService.create(user.userId(), request);
        return TransactionResponse.from(t);
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable Long id) {
        transactionService.delete(user.userId(), id);
    }

    @PostMapping("/upload")
    public List<TransactionResponse> uploadCsv(@AuthenticationPrincipal AuthenticatedUser user,
                                                @RequestParam("file") MultipartFile file) {
        return transactionService.importCsv(user.userId(), file)
                .stream().map(TransactionResponse::from).toList();
    }
}

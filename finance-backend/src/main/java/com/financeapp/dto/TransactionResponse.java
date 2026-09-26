package com.financeapp.dto;

import com.financeapp.model.Transaction;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionResponse {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate date;
    private String category;
    private String source;

    public static TransactionResponse from(Transaction t) {
        TransactionResponse r = new TransactionResponse();
        r.setId(t.getId());
        r.setDescription(t.getDescription());
        r.setAmount(t.getAmount());
        r.setDate(t.getDate());
        r.setCategory(t.getCategory());
        r.setSource(t.getSource() != null ? t.getSource().name() : null);
        return r;
    }
}

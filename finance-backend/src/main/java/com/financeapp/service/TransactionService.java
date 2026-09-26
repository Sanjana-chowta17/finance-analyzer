package com.financeapp.service;

import com.financeapp.dto.TransactionRequest;
import com.financeapp.exception.BadRequestException;
import com.financeapp.model.Transaction;
import com.financeapp.repository.TransactionRepository;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    private final AIService aiService;

    private static final DateTimeFormatter CSV_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");


    public TransactionService(
            TransactionRepository transactionRepository,
            AIService aiService) {

        this.transactionRepository = transactionRepository;
        this.aiService = aiService;
    }


    // =========================================================
    // GET ALL TRANSACTIONS
    // =========================================================

    public List<Transaction> getAllForUser(Long userId) {

        return transactionRepository
                .findByUserIdOrderByDateDesc(userId);
    }


    // =========================================================
    // CREATE TRANSACTION
    // =========================================================

    public Transaction create(
            Long userId,
            TransactionRequest request) {

        String category = request.getCategory();

        /*
         * If the user did not provide a category,
         * let Gemini/local fallback categorize it.
         */
        if (category == null || category.isBlank()) {

            category = aiService.categorizeTransaction(
                    request.getDescription()
            );
        }

        Transaction transaction = Transaction.builder()
                .userId(userId)
                .description(request.getDescription())
                .amount(request.getAmount())
                .date(request.getDate())
                .category(category)
                .source(Transaction.TransactionSource.MANUAL)
                .build();

        return transactionRepository.save(transaction);
    }


    // =========================================================
    // DELETE TRANSACTION
    // =========================================================

    public void delete(
            Long userId,
            Long transactionId) {

        Transaction transaction =
                transactionRepository.findById(transactionId)
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Transaction not found"
                                ));

        if (!transaction.getUserId().equals(userId)) {

            throw new BadRequestException(
                    "Not authorized to delete this transaction"
            );
        }

        transactionRepository.delete(transaction);
    }


    // =========================================================
    // IMPORT CSV
    // =========================================================

    /**
     * Imports transactions from CSV.
     *
     * Expected:
     * date,description,amount
     *
     * Gemini is optional.
     * If Gemini fails, local categorization is used.
     */
    public List<Transaction> importCsv(
            Long userId,
            MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new BadRequestException(
                    "Please select a CSV file."
            );
        }

        List<Transaction> saved =
                new ArrayList<>();

        try (
                var reader = new InputStreamReader(
                        file.getInputStream(),
                        StandardCharsets.UTF_8
                )
        ) {

            CSVFormat format =
                    CSVFormat.DEFAULT.builder()
                            .setHeader(
                                    "date",
                                    "description",
                                    "amount"
                            )
                            .setSkipHeaderRecord(true)
                            .setIgnoreEmptyLines(true)
                            .setTrim(true)
                            .build();

            try (CSVParser parser = format.parse(reader)) {

                for (CSVRecord record : parser) {

                    // -------------------------------------------------
                    // Validate row
                    // -------------------------------------------------

                    if (record.size() < 3) {

                        throw new BadRequestException(
                                "CSV row "
                                        + record.getRecordNumber()
                                        + " must contain date, description and amount."
                        );
                    }


                    // -------------------------------------------------
                    // Parse date
                    // -------------------------------------------------

                    LocalDate date;

                    try {

                        date = LocalDate.parse(
                                record.get("date").trim(),
                                CSV_DATE_FORMAT
                        );

                    } catch (Exception e) {

                        throw new BadRequestException(
                                "Invalid date in CSV row "
                                        + record.getRecordNumber()
                                        + ". Expected format: yyyy-MM-dd"
                        );
                    }


                    // -------------------------------------------------
                    // Parse description
                    // -------------------------------------------------

                    String description =
                            record.get("description").trim();

                    if (description.isBlank()) {

                        throw new BadRequestException(
                                "Description cannot be empty in CSV row "
                                        + record.getRecordNumber()
                        );
                    }


                    // -------------------------------------------------
                    // Parse amount
                    // -------------------------------------------------

                    BigDecimal amount;

                    try {

                        amount = new BigDecimal(
                                record.get("amount").trim()
                        );

                    } catch (Exception e) {

                        throw new BadRequestException(
                                "Invalid amount in CSV row "
                                        + record.getRecordNumber()
                        );
                    }


                    // -------------------------------------------------
                    // AI categorization
                    // -------------------------------------------------

                    String category;

                    try {

                        /*
                         * Gemini first.
                         *
                         * If Gemini fails, AIService itself uses
                         * local keyword-based categorization.
                         */
                        category =
                                aiService.categorizeTransaction(
                                        description
                                );

                    } catch (Exception e) {

                        /*
                         * Final safety fallback.
                         */
                        category = "Other";
                    }


                    // -------------------------------------------------
                    // Build transaction
                    // -------------------------------------------------

                    Transaction transaction =
                            Transaction.builder()
                                    .userId(userId)
                                    .description(description)
                                    .amount(amount)
                                    .date(date)
                                    .category(category)
                                    .source(
                                            Transaction.TransactionSource.CSV_UPLOAD
                                    )
                                    .build();


                    saved.add(
                            transactionRepository.save(transaction)
                    );
                }
            }

        } catch (IOException e) {

            throw new BadRequestException(
                    "Could not read CSV file."
            );

        } catch (BadRequestException e) {

            throw e;

        } catch (Exception e) {

            throw new BadRequestException(
                    "Could not process the CSV file."
            );
        }

        return saved;
    }
}
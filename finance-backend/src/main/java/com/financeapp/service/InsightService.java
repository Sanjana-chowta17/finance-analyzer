package com.financeapp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financeapp.model.Insight;
import com.financeapp.model.Transaction;
import com.financeapp.repository.InsightRepository;
import com.financeapp.repository.TransactionRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InsightService {

    private final TransactionRepository transactionRepository;

    private final InsightRepository insightRepository;

    private final AIService aiService;

    private final ObjectMapper objectMapper =
            new ObjectMapper();


    public InsightService(
            TransactionRepository transactionRepository,
            InsightRepository insightRepository,
            AIService aiService) {

        this.transactionRepository =
                transactionRepository;

        this.insightRepository =
                insightRepository;

        this.aiService =
                aiService;
    }


    // =========================================================
    // GENERATE MONTHLY INSIGHT
    // =========================================================

    /**
     * Generates monthly financial insight.
     *
     * Gemini is used when available.
     * If Gemini fails, a local insight is generated.
     */
    public Insight generateMonthlyInsight(Long userId) {

        LocalDate now =
                LocalDate.now();

        LocalDate start =
                now.withDayOfMonth(1);

        LocalDate end =
                now.withDayOfMonth(
                        now.lengthOfMonth()
                );


        List<Transaction> transactions =
                transactionRepository
                        .findByUserIdAndDateBetween(
                                userId,
                                start,
                                end
                        );


        Map<String, BigDecimal> categoryTotals =
                new HashMap<>();

        BigDecimal total =
                BigDecimal.ZERO;


        for (Transaction t : transactions) {

            String category =
                    t.getCategory() != null
                            ? t.getCategory()
                            : "Other";


            categoryTotals.merge(
                    category,
                    t.getAmount(),
                    BigDecimal::add
            );


            total =
                    total.add(
                            t.getAmount()
                    );
        }


        String content;


        // ---------------------------------------------------------
        // No transactions
        // ---------------------------------------------------------

        if (categoryTotals.isEmpty()) {

            content =
                    "No transactions recorded yet this month. "
                            + "Add some transactions to get personalized insights.";

        } else {

            try {

                // -------------------------------------------------
                // Gemini insight
                // -------------------------------------------------

                content =
                        aiService.generateInsights(
                                now.getMonth()
                                        + " "
                                        + now.getYear(),

                                categoryTotals,

                                total
                        );

            } catch (Exception e) {

                // -------------------------------------------------
                // Local fallback
                // -------------------------------------------------

                content =
                        buildFallbackInsight(
                                categoryTotals,
                                total
                        );
            }
        }


        Insight insight =
                Insight.builder()
                        .userId(userId)
                        .content(content)
                        .generatedAt(
                                LocalDateTime.now()
                        )
                        .build();


        return insightRepository.save(
                insight
        );
    }


    // =========================================================
    // LOCAL INSIGHT FALLBACK
    // =========================================================

    private String buildFallbackInsight(
            Map<String, BigDecimal> categoryTotals,
            BigDecimal total) {

        Map.Entry<String, BigDecimal> biggest =
                categoryTotals.entrySet()
                        .stream()
                        .max(
                                Map.Entry.comparingByValue()
                        )
                        .orElse(null);


        if (biggest == null) {

            return "There is not enough spending data "
                    + "to generate an insight yet.";
        }


        BigDecimal percentage =
                BigDecimal.ZERO;


        if (total.compareTo(
                BigDecimal.ZERO
        ) > 0) {

            percentage =
                    biggest.getValue()
                            .multiply(
                                    BigDecimal.valueOf(100)
                            )
                            .divide(
                                    total,
                                    1,
                                    RoundingMode.HALF_UP
                            );
        }


        return String.format(

                "Your total spending this month is ₹%s. "
                        + "Your largest spending category is %s at ₹%s, "
                        + "which accounts for approximately %s%% of your spending. "
                        + "Reviewing this category could help you identify "
                        + "opportunities to save.",

                total,

                biggest.getKey(),

                biggest.getValue(),

                percentage
        );
    }


    // =========================================================
    // GET INSIGHT HISTORY
    // =========================================================

    public List<Insight> getHistory(Long userId) {

        return insightRepository
                .findByUserIdOrderByGeneratedAtDesc(
                        userId
                );
    }


    // =========================================================
    // ANSWER FINANCIAL QUESTION
    // =========================================================

    /**
     * Answers questions about the user's finances.
     *
     * Simple questions → local calculation.
     * Complex questions → Gemini.
     * Gemini failure → local financial analysis.
     */
    public String answerQuestion(
            Long userId,
            String question) {

        List<Transaction> transactions =
                transactionRepository
                        .findByUserIdOrderByDateDesc(
                                userId
                        );


        // ---------------------------------------------------------
        // No transactions
        // ---------------------------------------------------------

        if (transactions.isEmpty()) {

            return "You don't have any transactions recorded yet. "
                    + "Add or import some transactions first.";
        }


        // ---------------------------------------------------------
        // First try questions Java can answer exactly
        // ---------------------------------------------------------

        String localAnswer =
                answerLocally(
                        question,
                        transactions
                );


        if (localAnswer != null) {

            return localAnswer;
        }


        // ---------------------------------------------------------
        // Prepare transaction context for Gemini
        // ---------------------------------------------------------

        List<Map<String, Object>> context =
                transactions.stream()
                        .limit(200)
                        .map(t ->
                                Map.<String, Object>of(

                                        "date",
                                        t.getDate().toString(),

                                        "description",
                                        t.getDescription(),

                                        "amount",
                                        t.getAmount(),

                                        "category",
                                        t.getCategory() != null
                                                ? t.getCategory()
                                                : "Other"
                                )
                        )
                        .toList();


        try {

            String json =
                    objectMapper.writeValueAsString(
                            context
                    );


            // -----------------------------------------------------
            // Gemini for natural-language questions
            // -----------------------------------------------------

            return aiService.answerQuestion(
                    question,
                    json
            );

        } catch (Exception e) {

            // -----------------------------------------------------
            // Gemini failed → local fallback
            // -----------------------------------------------------

            return buildSmartLocalFallback(
                    question,
                    transactions
            );
        }
    }


    // =========================================================
    // SIMPLE LOCAL QUESTIONS
    // =========================================================

    private String answerLocally(
            String question,
            List<Transaction> transactions) {

        String q =
                question
                        .toLowerCase()
                        .trim();


        // ---------------------------------------------------------
        // Biggest spending category
        // ---------------------------------------------------------

        if (q.contains("spent the most")
                || q.contains("spend the most")
                || q.contains("biggest spending")
                || q.contains("highest spending")) {

            Map<String, BigDecimal> totals =
                    calculateCategoryTotals(
                            transactions
                    );


            Map.Entry<String, BigDecimal> biggest =
                    getBiggestCategory(
                            totals
                    );


            if (biggest != null) {

                return String.format(

                        "You spent the most on %s, "
                                + "with total spending of ₹%s.",

                        biggest.getKey(),

                        biggest.getValue()
                );
            }
        }


        // ---------------------------------------------------------
        // Total spending
        // ---------------------------------------------------------

        if (q.contains("how much did i spend")
                || q.contains("total spending")
                || q.contains("total spent")) {

            BigDecimal total =
                    calculateTotal(
                            transactions
                    );


            return String.format(

                    "Your total recorded spending is ₹%s.",

                    total
            );
        }


        // ---------------------------------------------------------
        // Number of transactions
        // ---------------------------------------------------------

        if (q.contains("how many transactions")
                || q.contains("number of transactions")
                || q.contains("transaction count")) {

            return String.format(

                    "You have %d recorded transactions.",

                    transactions.size()
            );
        }


        return null;
    }


    // =========================================================
    // SMART LOCAL FALLBACK
    // =========================================================

    private String buildSmartLocalFallback(
            String question,
            List<Transaction> transactions) {

        String q =
                question
                        .toLowerCase()
                        .trim();


        Map<String, BigDecimal> categoryTotals =
                calculateCategoryTotals(
                        transactions
                );


        BigDecimal total =
                calculateTotal(
                        transactions
                );


        Map.Entry<String, BigDecimal> biggest =
                getBiggestCategory(
                        categoryTotals
                );


        // ---------------------------------------------------------
        // Spending reduction
        // ---------------------------------------------------------

        if (q.contains("reduce")
                || q.contains("save")
                || q.contains("cut")
                || q.contains("spending less")
                || q.contains("spend less")) {

            if (biggest != null) {

                return String.format(

                        "Your largest spending category is %s at ₹%s. "
                                + "If you want to reduce your overall spending, "
                                + "this is the category that could have the "
                                + "biggest impact. Your total recorded spending "
                                + "is ₹%s.",

                        biggest.getKey(),

                        biggest.getValue(),

                        total
                );
            }
        }


        // ---------------------------------------------------------
        // Unnecessary expenses
        // ---------------------------------------------------------

        if (q.contains("unnecessary")
                || q.contains("waste")
                || q.contains("wasted")) {

            if (biggest != null) {

                return String.format(

                        "Your highest spending category is %s at ₹%s. "
                                + "This doesn't necessarily mean all of it "
                                + "is unnecessary, but reviewing the individual "
                                + "transactions in this category may help you "
                                + "find expenses you can reduce.",

                        biggest.getKey(),

                        biggest.getValue()
                );
            }
        }


        // ---------------------------------------------------------
        // General fallback
        // ---------------------------------------------------------

        if (biggest != null) {

            return String.format(

                    "Based on your recorded transactions, your largest "
                            + "spending category is %s at ₹%s. "
                            + "Your total recorded spending is ₹%s. "
                            + "Reviewing your transactions in %s is a good "
                            + "place to start if you want to manage your spending.",

                    biggest.getKey(),

                    biggest.getValue(),

                    total,

                    biggest.getKey()
            );
        }


        return "I couldn't connect to the AI assistant right now, "
                + "but your transaction data is still available "
                + "in the dashboard.";
    }


    // =========================================================
    // CATEGORY TOTALS
    // =========================================================

    private Map<String, BigDecimal> calculateCategoryTotals(
            List<Transaction> transactions) {

        Map<String, BigDecimal> totals =
                new HashMap<>();


        for (Transaction t : transactions) {

            String category =
                    t.getCategory() != null
                            ? t.getCategory()
                            : "Other";


            totals.merge(
                    category,
                    t.getAmount(),
                    BigDecimal::add
            );
        }


        return totals;
    }


    // =========================================================
    // TOTAL
    // =========================================================

    private BigDecimal calculateTotal(
            List<Transaction> transactions) {

        BigDecimal total =
                BigDecimal.ZERO;


        for (Transaction t : transactions) {

            total =
                    total.add(
                            t.getAmount()
                    );
        }


        return total;
    }


    // =========================================================
    // BIGGEST CATEGORY
    // =========================================================

    private Map.Entry<String, BigDecimal> getBiggestCategory(
            Map<String, BigDecimal> categoryTotals) {

        return categoryTotals.entrySet()
                .stream()
                .max(
                        Map.Entry.comparingByValue()
                )
                .orElse(null);
    }
}
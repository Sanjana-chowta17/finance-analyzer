package com.financeapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.base-url}")
    private String baseUrl;

    @Value("${gemini.api.model}")
    private String model;

    public AIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    // =========================================================
    // 1. CATEGORIZE TRANSACTION
    // =========================================================

    public String categorizeTransaction(String description) {

        System.out.println("=================================");
        System.out.println("AI CATEGORIZATION STARTED");
        System.out.println("Description: " + description);

        try {

            String prompt = buildCategorizationPrompt(description);

            String result = callGemini(
                    prompt,
                    100,
                    "minimal"
            );

            String category = normalizeCategory(result);

            if (category != null) {

                System.out.println(
                        "Gemini category: " + category
                );

                System.out.println("=================================");

                return category;
            }

            System.out.println(
                    "Gemini returned an unknown category: " + result
            );

        } catch (Exception e) {

            System.out.println(
                    "Gemini categorization failed."
            );

            System.out.println(
                    "Using local categorization fallback."
            );

            e.printStackTrace();
        }

        // Gemini failed → local fallback
        String localCategory = categorizeLocally(description);

        System.out.println(
                "Local category: " + localCategory
        );

        System.out.println("=================================");

        return localCategory;
    }


    // =========================================================
    // 2. CATEGORIZATION PROMPT
    // =========================================================

    private String buildCategorizationPrompt(String description) {

        return """
                You are a personal finance transaction categorization system.

                Categorize the following transaction into EXACTLY ONE
                of these categories:

                Groceries
                Rent
                Utilities
                Entertainment
                Dining
                Transport
                Shopping
                Health
                Subscriptions
                Income
                Other

                Transaction description:
                %s

                Rules:
                - Return ONLY the category name.
                - Do not explain your answer.
                - Do not add punctuation.
                - Do not return multiple categories.

                Examples:
                Swiggy -> Dining
                Zomato -> Dining
                Uber -> Transport
                Amazon -> Shopping
                Netflix -> Subscriptions
                Salary -> Income
                """.formatted(description);
    }


    // =========================================================
    // 3. NORMALIZE GEMINI RESPONSE
    // =========================================================

    private String normalizeCategory(String result) {

        if (result == null || result.isBlank()) {
            return null;
        }

        String text = result
                .toLowerCase()
                .trim();

        if (text.contains("grocer")) {
            return "Groceries";
        }

        if (text.contains("rent")) {
            return "Rent";
        }

        if (text.contains("utilit")) {
            return "Utilities";
        }

        if (text.contains("entertainment")) {
            return "Entertainment";
        }

        if (text.contains("dining")) {
            return "Dining";
        }

        if (text.contains("transport")) {
            return "Transport";
        }

        if (text.contains("shopping")) {
            return "Shopping";
        }

        if (text.contains("health")) {
            return "Health";
        }

        if (text.contains("subscription")) {
            return "Subscriptions";
        }

        if (text.contains("income")) {
            return "Income";
        }

        if (text.equals("other")
                || text.startsWith("other ")) {
            return "Other";
        }

        return null;
    }


    // =========================================================
    // 4. LOCAL FALLBACK CATEGORIZER
    // =========================================================

    private String categorizeLocally(String description) {

        if (description == null || description.isBlank()) {
            return "Other";
        }

        String text = description
                .toLowerCase()
                .trim();


        // -----------------------------------------------------
        // DINING
        // -----------------------------------------------------

        if (containsAny(
                text,
                "swiggy",
                "zomato",
                "restaurant",
                "cafe",
                "coffee",
                "food",
                "biryani",
                "pizza",
                "burger",
                "maggie",
                "noodles",
                "dosa",
                "idli",
                "paratha",
                "dominos",
                "kfc",
                "mcdonald",
                "mcdonalds",
                "starbucks",
                "meal",
                "bakery"
        )) {
            return "Dining";
        }


        // -----------------------------------------------------
        // GROCERIES
        // -----------------------------------------------------

        if (containsAny(
                text,
                "bigbasket",
                "blinkit",
                "zepto",
                "dmart",
                "grocery",
                "groceries",
                "vegetable",
                "vegetables",
                "fruit",
                "fruits",
                "milk",
                "rice",
                "dal",
                "atta",
                "flour",
                "sugar",
                "salt",
                "oil"
        )) {
            return "Groceries";
        }


        // -----------------------------------------------------
        // TRANSPORT
        // -----------------------------------------------------

        if (containsAny(
                text,
                "uber",
                "ola",
                "rapido",
                "metro",
                "bus",
                "petrol",
                "fuel",
                "parking",
                "cab",
                "taxi",
                "auto",
                "transport"
        )) {
            return "Transport";
        }


        // -----------------------------------------------------
        // SHOPPING
        // -----------------------------------------------------

        if (containsAny(
                text,
                "amazon",
                "flipkart",
                "myntra",
                "ajio",
                "meesho",
                "shopping",
                "clothes",
                "clothing",
                "shoes",
                "fashion",
                "electronics",
                "laptop",
                "mobile phone"
        )) {
            return "Shopping";
        }


        // -----------------------------------------------------
        // SUBSCRIPTIONS
        // -----------------------------------------------------

        if (containsAny(
                text,
                "netflix",
                "spotify",
                "youtube premium",
                "prime video",
                "amazon prime",
                "subscription",
                "hotstar",
                "disney+",
                "disney plus"
        )) {
            return "Subscriptions";
        }


        // -----------------------------------------------------
        // UTILITIES
        // -----------------------------------------------------

        if (containsAny(
                text,
                "electricity",
                "electricity bill",
                "water bill",
                "gas bill",
                "internet",
                "wifi",
                "broadband",
                "mobile recharge",
                "recharge",
                "phone bill"
        )) {
            return "Utilities";
        }


        // -----------------------------------------------------
        // HEALTH
        // -----------------------------------------------------

        if (containsAny(
                text,
                "apollo",
                "pharmacy",
                "hospital",
                "medicine",
                "medical",
                "doctor",
                "clinic",
                "health",
                "medplus",
                "1mg",
                "tata 1mg"
        )) {
            return "Health";
        }


        // -----------------------------------------------------
        // RENT
        // -----------------------------------------------------

        if (containsAny(
                text,
                "rent",
                "house rent",
                "room rent",
                "apartment rent",
                "flat rent"
        )) {
            return "Rent";
        }


        // -----------------------------------------------------
        // ENTERTAINMENT
        // -----------------------------------------------------

        if (containsAny(
                text,
                "movie",
                "movies",
                "cinema",
                "pvr",
                "inox",
                "bookmyshow",
                "game",
                "gaming",
                "concert",
                "entertainment"
        )) {
            return "Entertainment";
        }


        // -----------------------------------------------------
        // INCOME
        // -----------------------------------------------------

        if (containsAny(
                text,
                "salary",
                "income",
                "bonus",
                "freelance",
                "payment received",
                "salary credited"
        )) {
            return "Income";
        }


        // -----------------------------------------------------
        // NOTHING MATCHED
        // -----------------------------------------------------

        return "Other";
    }


    // =========================================================
    // 5. KEYWORD HELPER
    // =========================================================

    private boolean containsAny(
            String text,
            String... keywords
    ) {

        for (String keyword : keywords) {

            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }


    // =========================================================
    // 6. GENERATE FINANCIAL INSIGHTS
    // =========================================================

    public String generateInsights(
            String month,
            Map<String, BigDecimal> categoryTotals,
            BigDecimal total) {

        String prompt = """
                You are a personal finance assistant.

                Analyze the user's spending for %s.

                Category spending:
                %s

                Total spending:
                ₹%s

                Provide a clear and useful financial insight.

                Mention:
                - total spending
                - largest spending category
                - an observation about spending
                - one practical suggestion to manage spending

                Keep the response concise and easy to understand.
                """.formatted(
                month,
                categoryTotals,
                total
        );

        try {

            return callGemini(
                    prompt,
                    2000,
                    "low"
            );

        } catch (Exception e) {

            System.out.println(
                    "Gemini insight generation failed."
            );

            e.printStackTrace();

            throw new RuntimeException(
                    "Gemini insight generation failed",
                    e
            );
        }
    }


    // =========================================================
    // 7. AI CHAT
    // =========================================================

    public String answerQuestion(
            String question,
            String transactionContext) {

        String prompt = """
                You are a personal finance assistant.

                Answer the user's question using ONLY the transaction
                information provided below.

                User question:
                %s

                Transaction data:
                %s

                Give a clear, helpful and concise answer.

                Do not invent transactions or amounts that are not
                present in the provided data.
                """.formatted(
                question,
                transactionContext
        );

        try {

            return callGemini(
                    prompt,
                    1500,
                    "low"
            );

        } catch (Exception e) {

            System.out.println(
                    "Gemini chat request failed."
            );

            e.printStackTrace();

            throw new RuntimeException(
                    "Gemini chat request failed",
                    e
            );
        }
    }


    // =========================================================
    // 8. GEMINI API CALL
    // =========================================================

    private String callGemini(
            String prompt,
            int maxTokens,
            String thinkingLevel) {

        Map<String, Object> generationConfig =
                Map.of(
                        "maxOutputTokens",
                        maxTokens,

                        "thinkingConfig",
                        Map.of(
                                "thinkingLevel",
                                thinkingLevel
                        )
                );

        Map<String, Object> requestBody =
                Map.of(
                        "contents",
                        List.of(
                                Map.of(
                                        "parts",
                                        List.of(
                                                Map.of(
                                                        "text",
                                                        prompt
                                                )
                                        )
                                )
                        ),

                        "generationConfig",
                        generationConfig
                );

        String url =
                baseUrl
                        + "/models/"
                        + model
                        + ":generateContent?key="
                        + apiKey;

        Map<?, ?> response =
                webClient
                        .post()
                        .uri(url)
                        .header(
                                "Content-Type",
                                "application/json"
                        )
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

        if (response == null) {

            throw new RuntimeException(
                    "Empty response received from Gemini"
            );
        }

        Object candidatesObject =
                response.get("candidates");

        if (!(candidatesObject instanceof List<?> candidates)
                || candidates.isEmpty()) {

            throw new RuntimeException(
                    "Gemini returned no candidates: "
                            + response
            );
        }

        Object firstCandidate =
                candidates.get(0);

        if (!(firstCandidate instanceof Map<?, ?> candidate)) {

            throw new RuntimeException(
                    "Invalid Gemini candidate response"
            );
        }

        Object contentObject =
                candidate.get("content");

        if (!(contentObject instanceof Map<?, ?> content)) {

            throw new RuntimeException(
                    "Gemini response does not contain content"
            );
        }

        Object partsObject =
                content.get("parts");

        if (!(partsObject instanceof List<?> parts)
                || parts.isEmpty()) {

            throw new RuntimeException(
                    "Gemini response does not contain text parts"
            );
        }

        StringBuilder result =
                new StringBuilder();

        for (Object partObject : parts) {

            if (partObject instanceof Map<?, ?> part) {

                Object textObject =
                        part.get("text");

                if (textObject != null) {

                    result.append(
                            textObject.toString()
                    );
                }
            }
        }

        String finalResult =
                result.toString().trim();

        if (finalResult.isBlank()) {

            throw new RuntimeException(
                    "Gemini returned empty text"
            );
        }

        return finalResult;
    }
}
# AI-Powered Personal Finance Analyzer

Full-stack starter project: **Spring Boot** (backend) + **React/Vite** (frontend) + **Claude (Anthropic API)** for AI categorization, insights, and a finance Q&A chat.

## Structure

```
finance-backend/    Spring Boot API (Java 21, MySQL, JWT auth)
finance-frontend/   React app (Vite, axios, recharts)
```

## 1. Backend setup

1. Make sure MySQL is running locally on port 3306.
2. Set environment variables (or edit `application.yml` directly):

   ```bash
   export DB_USERNAME=root
   export DB_PASSWORD=yourpassword
   export JWT_SECRET=$(openssl rand -base64 32)
   export ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Run it:

   ```bash
   cd finance-backend
   mvn spring-boot:run
   ```

   The database `finance_app` is auto-created on first run (`createDatabaseIfNotExist=true`), and tables are created via `ddl-auto: update`.

4. API will be live at `http://localhost:8080`.

## 2. Frontend setup

```bash
cd finance-frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` and talks to the backend at `http://localhost:8080/api` (see `src/api/client.js`).

## 3. Try it out

1. Register an account (`/register`).
2. Add a transaction manually — the backend calls Claude to auto-categorize it if you leave the category blank.
3. Or upload a CSV with columns `date,description,amount` (date format `YYYY-MM-DD`) — every row gets categorized automatically.
4. Click **Generate this month's insight** for an AI-written spending summary.
5. Use the **Ask about your finances** chat box for free-form questions like "How much did I spend on dining last month?"

## Key files to know

| Concern | File |
|---|---|
| AI calls (all of them) | `finance-backend/.../service/AIService.java` |
| Auto-categorization + CSV import | `finance-backend/.../service/TransactionService.java` |
| Insights + chat grounding | `finance-backend/.../service/InsightService.java` |
| JWT auth | `finance-backend/.../security/JwtUtil.java`, `JwtAuthFilter.java` |
| Security rules / CORS | `finance-backend/.../config/SecurityConfig.java` |
| Frontend API client | `finance-frontend/src/api/client.js` |
| Dashboard (main screen) | `finance-frontend/src/pages/Dashboard.jsx` |

## Next steps / things left as an exercise

- **Budgets**: the `Budget` entity + repository exist but there's no controller/UI yet — add a `BudgetController` and a simple form to set monthly limits per category, then compare against actual spend.
- **Pagination** on transactions once the list grows.
- **Migrations**: swap `ddl-auto: update` for Flyway/Liquibase before deploying.
- **Rate limiting / caching** on AI calls if you expect heavy usage — right now every uncategorized transaction triggers a live Claude call.
- **Tests**: no unit/integration tests included — add JUnit + Mockito for services, and React Testing Library for components.

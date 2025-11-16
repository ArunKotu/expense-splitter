package com.ExpenseSplitter.ExpenseSplitter.Service;

import com.ExpenseSplitter.ExpenseSplitter.Model.Expense;
import com.ExpenseSplitter.ExpenseSplitter.Model.Member;
import com.ExpenseSplitter.ExpenseSplitter.Repository.ExpenseRepository;
import com.ExpenseSplitter.ExpenseSplitter.Repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepo;
    private final MemberRepository memberRepo;

    public ExpenseService(ExpenseRepository expenseRepo, MemberRepository memberRepo) {
        this.expenseRepo = expenseRepo;
        this.memberRepo = memberRepo;
    }

    // ---------------- ADD EXPENSE ----------------
    public Expense addExpense(Expense expense) {
        if (expense.getDate() == null) {
            expense.setDate(LocalDate.now());
        }
        return expenseRepo.save(expense);
    }

    // ---------------- FETCH EXPENSES ----------------
    public List<Expense> getAllExpenses() {
        return expenseRepo.findAll();
    }

    public List<Expense> getExpensesTillDate(LocalDate toDate) {
        return expenseRepo.findByDateLessThanEqualOrderByDateAsc(toDate);
    }

    // ---------------- PAID BY EACH USER ----------------
    public Map<String, BigDecimal> getPaidByEach(LocalDate toDate) {
        List<Expense> expenses = expenseRepo.findByDateLessThanEqualOrderByDateAsc(toDate);

        Map<String, BigDecimal> map = new LinkedHashMap<>();

        for (Expense e : expenses) {
            String payer = e.getPayer().trim();
            BigDecimal amt = e.getAmount() == null ? BigDecimal.ZERO : e.getAmount();

            map.putIfAbsent(payer, BigDecimal.ZERO);
            map.put(payer, map.get(payer).add(amt));
        }

        return map;
    }


    // ===========================================
    //         CORRECT SUMMARY CALCULATION
    // ===========================================
    public Map<String, Object> calculateSummary(LocalDate toDate) {

        List<Member> members = memberRepo.findAll();
        List<Expense> expenses = expenseRepo.findByDateLessThanEqualOrderByDateAsc(toDate);

        // Normalize member names
        Map<String, String> canonical = new LinkedHashMap<>();
        for (Member m : members) {
            canonical.put(m.getName().trim().toLowerCase(), m.getName().trim());
        }

        Map<String, BigDecimal> paid = new LinkedHashMap<>();
        Map<String, List<Map<String, Object>>> perPayerExpenses = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;

        // Init maps
        for (String n : canonical.values()) {
            paid.put(n, BigDecimal.ZERO);
            perPayerExpenses.put(n, new ArrayList<>());
        }

        // Collect Paid + per-person details
        for (Expense e : expenses) {

            String lookup = e.getPayer().trim().toLowerCase();
            String payer = canonical.getOrDefault(lookup, e.getPayer());

            BigDecimal amt = e.getAmount() == null ? BigDecimal.ZERO : e.getAmount();
            total = total.add(amt);

            paid.put(payer, paid.get(payer).add(amt));

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("date", e.getDate());
            row.put("category", e.getCategory());
            row.put("amount", amt);
            row.put("reason", e.getReason());

            perPayerExpenses.get(payer).add(row);
        }

        int memberCount = members.size();
        BigDecimal fairShare = memberCount == 0
                ? BigDecimal.ZERO
                : total.divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.HALF_EVEN);

        // NET = paid - fairShare
        Map<String, BigDecimal> net = new LinkedHashMap<>();
        for (String name : paid.keySet()) {
            net.put(name, paid.get(name).subtract(fairShare).setScale(2, RoundingMode.HALF_EVEN));
        }


        // ===============================
        //       GREEDY SETTLEMENT LOGIC
        // ===============================
        List<Map<String, Object>> settlements = new ArrayList<>();

        List<MemberBalance> creditors = new ArrayList<>();
        List<MemberBalance> debtors = new ArrayList<>();

        for (Map.Entry<String, BigDecimal> e : net.entrySet()) {
            BigDecimal val = e.getValue();
            if (val.compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new MemberBalance(e.getKey(), val));
            } else if (val.compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new MemberBalance(e.getKey(), val.abs()));
            }
        }

        int i = 0, j = 0;

        while (i < debtors.size() && j < creditors.size()) {

            MemberBalance debtor = debtors.get(i);
            MemberBalance creditor = creditors.get(j);

            BigDecimal pay = debtor.amount.min(creditor.amount);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("from", debtor.name);
            row.put("to", creditor.name);
            row.put("amount", pay.setScale(2, RoundingMode.HALF_EVEN));

            settlements.add(row);

            debtor.amount = debtor.amount.subtract(pay);
            creditor.amount = creditor.amount.subtract(pay);

            if (debtor.amount.compareTo(BigDecimal.ZERO) == 0) i++;
            if (creditor.amount.compareTo(BigDecimal.ZERO) == 0) j++;
        }

        // Build final output
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("total", total);
        out.put("fairShare", fairShare);
        out.put("paid", paid);
        out.put("net", net);
        out.put("settlements", settlements);
        out.put("perPayerExpenses", perPayerExpenses);

        return out;
    }


    // Helper Class
    static class MemberBalance {
        String name;
        BigDecimal amount;

        MemberBalance(String name, BigDecimal amount) {
            this.name = name;
            this.amount = amount;
        }
    }


    // ===========================================
    //           EMAIL SUMMARY BUILDER
    // ===========================================
    public String buildSummaryEmail(Map<String, Object> summary) {

        StringBuilder sb = new StringBuilder();

        sb.append("Expense Summary\n\n");
        sb.append("Total: ").append(summary.get("total")).append("\n");
        sb.append("Fair Share: ").append(summary.get("fairShare")).append("\n\n");

        sb.append("\nPaid by Each:\n");
        Map<String, BigDecimal> paid =
                (Map<String, BigDecimal>) summary.get("paid");

        paid.forEach((k, v) ->
                sb.append(" - ").append(k).append(": ").append(v).append("\n")
        );

        sb.append("\nSettlements:\n");
        List<Map<String, Object>> settlements =
                (List<Map<String, Object>>) summary.get("settlements");

        if (settlements.isEmpty()) {
            sb.append("No settlements required.\n");
        } else {
            for (Map<String, Object> s : settlements) {
                sb.append(" - ")
                        .append(s.get("from")).append(" → ")
                        .append(s.get("to")).append(": ₹")
                        .append(s.get("amount")).append("\n");
            }
        }

        return sb.toString();
    }


    // ---------------- DELETE EXPENSE ----------------
    public void deleteExpense(String id) {
        if (!expenseRepo.existsById(id)) {
            throw new RuntimeException("Expense not found: " + id);
        }
        expenseRepo.deleteById(id);
    }

    // ---------------- UPDATE EXPENSE ----------------
    public Expense updateExpense(String id, Expense updated) {
        Expense existing = expenseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found: " + id));

        if (updated.getPayer() != null) existing.setPayer(updated.getPayer());
        if (updated.getAmount() != null) existing.setAmount(updated.getAmount());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updated.getReason() != null) existing.setReason(updated.getReason());
        if (updated.getDate() != null) existing.setDate(updated.getDate());

        return expenseRepo.save(existing);
    }
}

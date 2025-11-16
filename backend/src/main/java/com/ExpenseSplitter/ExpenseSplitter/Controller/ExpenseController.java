package com.ExpenseSplitter.ExpenseSplitter.Controller;

import com.ExpenseSplitter.ExpenseSplitter.Model.Expense;
import com.ExpenseSplitter.ExpenseSplitter.Service.ExpenseService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping("/add")
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.addExpense(expense));
    }
    @PutMapping("/update/{id}")
    public ResponseEntity<Expense> updateExpense(
            @PathVariable String id,
            @RequestBody Expense expense
    ) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expense));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/till")
    public ResponseEntity<List<Expense>> getExpensesTillDate(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate
    ) {
        if (toDate == null) toDate = LocalDate.now();
        return ResponseEntity.ok(expenseService.getExpensesTillDate(toDate));
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteExpense(@PathVariable String id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok("Expense deleted successfully");
    }

    @GetMapping("/paid-by-each")
    public ResponseEntity<Map<String, BigDecimal>> getPaidByEach(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate
    ) {
        if (toDate == null) toDate = LocalDate.now();
        return ResponseEntity.ok(expenseService.getPaidByEach(toDate));
    }


    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate
    ) {
        if (toDate == null) toDate = LocalDate.now();
        return ResponseEntity.ok(expenseService.calculateSummary(toDate));
    }
}

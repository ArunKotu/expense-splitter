package com.ExpenseSplitter.ExpenseSplitter.Controller;

import com.ExpenseSplitter.ExpenseSplitter.Model.Member;
import com.ExpenseSplitter.ExpenseSplitter.Repository.MemberRepository;
import com.ExpenseSplitter.ExpenseSplitter.Service.EmailService;
import com.ExpenseSplitter.ExpenseSplitter.Service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/summary")
public class SummaryController {

    private final ExpenseService expenseService;
    private final MemberRepository memberRepo;
    private final EmailService emailService;

    public SummaryController(ExpenseService expenseService,
                             MemberRepository memberRepo,
                             EmailService emailService) {
        this.expenseService = expenseService;
        this.memberRepo = memberRepo;
        this.emailService = emailService;
    }

    @PostMapping("/email/send-summary")
    public ResponseEntity<?> sendSummaryMail() {

        LocalDate today = LocalDate.now();

        // 1. Calculate summary map
        Map<String, Object> summary = expenseService.calculateSummary(today);

        // 2. Generate HTML email body
        String emailBody = expenseService.buildSummaryEmail(summary);

        // 3. Send to all members
        List<Member> members = memberRepo.findAll();

        for (Member m : members) {
            if (m.getEmail() != null && !m.getEmail().isEmpty()) {
                emailService.sendMail(
                        m.getEmail(),
                        "Expense Summary & Settlements (" + today + ")",
                        emailBody
                );
            }
        }

        return ResponseEntity.ok("Emails sent successfully");
    }
}

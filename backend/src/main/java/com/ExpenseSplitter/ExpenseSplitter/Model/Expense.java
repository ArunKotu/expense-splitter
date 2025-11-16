package com.ExpenseSplitter.ExpenseSplitter.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Document(collection = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    private String id;
    private String payer;
    private BigDecimal amount;
    private String category;
    private String reason;
    private LocalDate date;
}


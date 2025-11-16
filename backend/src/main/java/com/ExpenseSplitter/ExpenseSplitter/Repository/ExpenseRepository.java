package com.ExpenseSplitter.ExpenseSplitter.Repository;

import com.ExpenseSplitter.ExpenseSplitter.Model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByDateLessThanEqualOrderByDateAsc(LocalDate toDate);
    List<Expense> findByDateBetweenOrderByDateAsc(LocalDate from, LocalDate to);
}
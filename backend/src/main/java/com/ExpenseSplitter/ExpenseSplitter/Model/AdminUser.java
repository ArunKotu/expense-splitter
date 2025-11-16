package com.ExpenseSplitter.ExpenseSplitter.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "admin")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUser {
    @Id
    private String id;
    private String username;
    private String password;
}

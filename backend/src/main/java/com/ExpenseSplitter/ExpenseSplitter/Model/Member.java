package com.ExpenseSplitter.ExpenseSplitter.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "members")
public class Member {

    @Id
    private String id;

    private String name;

    private String email;


}


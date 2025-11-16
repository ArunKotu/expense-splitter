package com.ExpenseSplitter.ExpenseSplitter.Repository;
import com.ExpenseSplitter.ExpenseSplitter.Model.Member;
import org.springframework.data.mongodb.repository.MongoRepository;



public interface MemberRepository extends MongoRepository<Member,String> {
    boolean existsByName(String name);
}

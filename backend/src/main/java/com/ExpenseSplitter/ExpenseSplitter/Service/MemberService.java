package com.ExpenseSplitter.ExpenseSplitter.Service;

import com.ExpenseSplitter.ExpenseSplitter.Dto.AddMemberRequest;
import com.ExpenseSplitter.ExpenseSplitter.Repository.MemberRepository;
import org.springframework.stereotype.Service;
import com.ExpenseSplitter.ExpenseSplitter.Model.Member;

import java.util.List;
import java.util.Optional;

@Service
public class MemberService {


    private final MemberRepository repo;


    public MemberService(MemberRepository repo) {
        this.repo = repo;
    }


    public Member addMember(AddMemberRequest request) {
        Member m = new Member(null, request.getName(), request.getEmail());
        return repo.save(m);
    }

    public List<Member> getAllMembers() {
        return repo.findAll();
    }
    public boolean delete(String id){
        Optional<Member> m = repo.findById(id);
        if(m.isPresent()){
            repo.deleteById(id);
            return true;
        }
        else {
            throw new RuntimeException("User Not Found!");

        }

    }
}
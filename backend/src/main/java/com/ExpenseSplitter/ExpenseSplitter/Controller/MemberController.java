package com.ExpenseSplitter.ExpenseSplitter.Controller;

import com.ExpenseSplitter.ExpenseSplitter.Dto.AddMemberRequest;
import com.ExpenseSplitter.ExpenseSplitter.Model.Member;
import com.ExpenseSplitter.ExpenseSplitter.Service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/members")
public class MemberController {


    private final MemberService memberService;


    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable String id){
        return ResponseEntity.ok(memberService.delete(id));
    }
    @PostMapping("/add")
    public ResponseEntity<Member> addMember(@RequestBody AddMemberRequest request) {
        return ResponseEntity.ok(memberService.addMember(request));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Member>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }
}

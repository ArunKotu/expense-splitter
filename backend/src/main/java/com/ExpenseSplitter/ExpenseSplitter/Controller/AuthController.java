package com.ExpenseSplitter.ExpenseSplitter.Controller;

import com.ExpenseSplitter.ExpenseSplitter.Dto.AdminRegisterRequest;
import com.ExpenseSplitter.ExpenseSplitter.Dto.LoginRequest;
import com.ExpenseSplitter.ExpenseSplitter.Dto.LoginResponse;
import com.ExpenseSplitter.ExpenseSplitter.Model.AdminUser;
import com.ExpenseSplitter.ExpenseSplitter.Service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(
                authService.login(req.getUsername(), req.getPassword())
        );
    }


    @PostMapping("/create-admin")
    public ResponseEntity<AdminUser> createAdmin(@RequestBody AdminRegisterRequest request) {
        return ResponseEntity.ok(
                authService.createAdmin(request.getUsername(), request.getPassword())
        );
    }
}

package com.ExpenseSplitter.ExpenseSplitter.Service;

import com.ExpenseSplitter.ExpenseSplitter.Dto.LoginResponse;
import com.ExpenseSplitter.ExpenseSplitter.Model.AdminUser;
import com.ExpenseSplitter.ExpenseSplitter.Repository.AdminUserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final AdminUserRepository repo;
    private final PasswordEncoder encoder;

    public AuthService(AdminUserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    // Create Admin
    public AdminUser createAdmin(String username, String password) {
        AdminUser admin = new AdminUser(null, username, encoder.encode(password));
        return repo.save(admin);
    }

    public LoginResponse login(String username, String password) {

        AdminUser user = repo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return new LoginResponse();
    }
}
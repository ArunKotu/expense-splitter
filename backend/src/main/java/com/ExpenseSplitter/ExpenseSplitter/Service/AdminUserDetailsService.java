package com.ExpenseSplitter.ExpenseSplitter.Service;

import com.ExpenseSplitter.ExpenseSplitter.Model.AdminUser;
import com.ExpenseSplitter.ExpenseSplitter.Repository.AdminUserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminUserRepository repo;

    public AdminUserDetailsService(AdminUserRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        AdminUser admin = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + username));

        return User.withUsername(admin.getUsername())
                .password(admin.getPassword())   // hashed BCrypt password
                .authorities("ADMIN")
                .build();
    }
}

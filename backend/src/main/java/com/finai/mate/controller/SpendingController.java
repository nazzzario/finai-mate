package com.finai.mate.controller;

import com.finai.mate.model.Category;
import com.finai.mate.model.Spending;
import com.finai.mate.model.User;
import com.finai.mate.repository.SpendingRepository;
import com.finai.mate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spendings")
public class SpendingController {

    @Autowired
    SpendingRepository spendingRepository;

    @Autowired
    UserRepository userRepository;

    @PostMapping("/")
    public ResponseEntity<?> addSpending(@RequestBody Map<String, Object> spendingRequest) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        try {
            BigDecimal amount = new BigDecimal(spendingRequest.get("amount").toString());
            String description = (String) spendingRequest.get("description");
            String categoryStr = (String) spendingRequest.get("category");
            Category category = Category.valueOf(categoryStr);
            LocalDate date = LocalDate.parse((String) spendingRequest.get("date"));

            Spending spending = new Spending(amount, description, date, category, user);
            spendingRepository.save(spending);

            return ResponseEntity.ok("Spending added successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding spending: " + e.getMessage());
        }
    }

    @GetMapping("/")
    public ResponseEntity<?> getUserSpendings() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        List<Spending> spendings = spendingRepository.findByUser(user);
        return ResponseEntity.ok(spendings);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSpending(@PathVariable Long id) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }

        return spendingRepository.findById(id).map(spending -> {
            if (!spending.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Not authorized to delete this spending");
            }
            spendingRepository.delete(spending);
            return ResponseEntity.ok("Spending deleted successfully");
        }).orElse(ResponseEntity.notFound().build());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        }
        return null;
    }
}

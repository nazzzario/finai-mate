package com.finai.mate.util;

import com.finai.mate.model.Category;
import com.finai.mate.model.Spending;
import com.finai.mate.model.User;
import com.finai.mate.repository.SpendingRepository;
import com.finai.mate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    SpendingRepository spendingRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("demo").isEmpty()) {
            System.out.println("Seeding demo data...");

            User demoUser = new User("demo", "demo@example.com", passwordEncoder.encode("password"));
            userRepository.save(demoUser);

            Random random = new Random();
            Category[] categories = Category.values();
            LocalDate today = LocalDate.now();

            for (int i = 0; i < 60; i++) {
                BigDecimal amount = BigDecimal.valueOf(random.nextDouble() * 100 + 5).setScale(2,
                        BigDecimal.ROUND_HALF_UP);
                String description = "Sample Expense " + (i + 1);
                Category category = categories[random.nextInt(categories.length)];

                // Random date within last 3 months
                LocalDate date = today.minusDays(random.nextInt(90));

                Spending spending = new Spending(amount, description, date, category, demoUser);
                spendingRepository.save(spending);
            }

            System.out.println("Demo data seeded successfully! (User: demo, Pass: password)");
        }
    }
}

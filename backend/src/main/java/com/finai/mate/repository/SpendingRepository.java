package com.finai.mate.repository;

import com.finai.mate.model.Spending;
import com.finai.mate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpendingRepository extends JpaRepository<Spending, Long> {
    List<Spending> findByUser(User user);
}

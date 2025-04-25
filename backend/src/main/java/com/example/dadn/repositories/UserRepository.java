package com.example.dadn.repositories;

import com.example.dadn.entities.User;
import com.example.dadn.entities.key.UserKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, UserKey> {
    Optional<User> findByUserKey_Username(String username);
}

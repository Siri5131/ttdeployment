package com.example.chat.Repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.chat.entity.User;

public interface UserRepo extends JpaRepository<User, Long> {

    User findByEmailAndPassword(String email, String password);
}

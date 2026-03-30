package com.example.chat.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.chat.entity.Message;

public interface MessageRepo extends JpaRepository<Message, Long> {

    List<Message> findByRoomId(Long roomId);
}

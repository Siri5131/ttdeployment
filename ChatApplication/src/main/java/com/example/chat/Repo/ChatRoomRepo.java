package com.example.chat.Repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.chat.entity.ChatRoom;

public interface ChatRoomRepo extends JpaRepository<ChatRoom, Long> {

    ChatRoom findByRoomName(String roomName);
}

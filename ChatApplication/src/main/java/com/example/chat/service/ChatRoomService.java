package com.example.chat.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.chat.Repo.ChatRoomRepo;
import com.example.chat.entity.ChatRoom;

@Service
public class ChatRoomService {

    @Autowired
    private ChatRoomRepo repo;

    public ChatRoom saveNewChatRoom(ChatRoom chatRoom) {
        return repo.save(chatRoom);
    }

    public List<ChatRoom> getAllChatRooms() {
        return repo.findAll();
    }

    public ChatRoom getChatRoomById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("ChatRoom Not Found"));
    }

    public void deleteChatRoomById(Long id) {
        repo.deleteById(id);
    }

    public ChatRoom updateChatRoom(Long id, ChatRoom updatedRoom) {
        ChatRoom existingRoom = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("ChatRoom Not Found"));

        existingRoom.setRoomName(updatedRoom.getRoomName());
        existingRoom.setCreatedBy(updatedRoom.getCreatedBy());
        return repo.save(existingRoom);
    }
}

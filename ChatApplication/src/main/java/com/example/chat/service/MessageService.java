package com.example.chat.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.chat.Repo.MessageRepo;
import com.example.chat.entity.Message;

@Service
public class MessageService {

    @Autowired
    private MessageRepo repo;

    public Message saveMessage(Message message) {
        message.setTimestamp(LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return repo.save(message);
    }

    public List<Message> getAllMessages() {
        return repo.findAll();
    }

    public List<Message> getMessagesByRoomId(Long roomId) {
        return repo.findByRoomId(roomId);
    }

    public void deleteMessageById(Long id) {
        repo.deleteById(id);
    }

    public Message updateMessage(Long id, Message updatedMessage) {
        Message existingMessage = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Message Not Found"));

        existingMessage.setContent(updatedMessage.getContent());
        return repo.save(existingMessage);
    }
}

package com.example.chat.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.chat.entity.Message;
import com.example.chat.service.MessageService;

@RestController
@CrossOrigin("*")
public class MessageController {

    @Autowired
    private MessageService service;

    @PostMapping("/sendMessage")
    public Message sendMessage(@RequestBody Message message) {
        return service.saveMessage(message);
    }

    @GetMapping("/allMessages")
    public List<Message> getAllMessages() {
        return service.getAllMessages();
    }

    @GetMapping("/messages/{roomId}")
    public List<Message> getMessagesByRoomId(@PathVariable Long roomId) {
        return service.getMessagesByRoomId(roomId);
    }

    @DeleteMapping("/deleteMessage/{id}")
    public void deleteMessageById(@PathVariable Long id) {
        service.deleteMessageById(id);
    }

    @PutMapping("/updateMessage/{id}")
    public Message updateMessage(@PathVariable Long id, @RequestBody Message message) {
        return service.updateMessage(id, message);
    }
}

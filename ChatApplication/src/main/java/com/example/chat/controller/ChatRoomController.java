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

import com.example.chat.entity.ChatRoom;
import com.example.chat.service.ChatRoomService;

@RestController
@CrossOrigin("*")
public class ChatRoomController {

    @Autowired
    private ChatRoomService service;

    @PostMapping("/createRoom")
    public ChatRoom saveNewChatRoom(@RequestBody ChatRoom chatRoom) {
        return service.saveNewChatRoom(chatRoom);
    }

    @GetMapping("/allRooms")
    public List<ChatRoom> getAllChatRooms() {
        return service.getAllChatRooms();
    }

    @GetMapping("/room/{id}")
    public ChatRoom getChatRoomById(@PathVariable Long id) {
        return service.getChatRoomById(id);
    }

    @DeleteMapping("/deleteRoom/{id}")
    public void deleteChatRoomById(@PathVariable Long id) {
        service.deleteChatRoomById(id);
    }

    @PutMapping("/updateRoom/{id}")
    public ChatRoom updateChatRoom(@PathVariable Long id, @RequestBody ChatRoom chatRoom) {
        return service.updateChatRoom(id, chatRoom);
    }
}

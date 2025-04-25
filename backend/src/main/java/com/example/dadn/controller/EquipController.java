package com.example.dadn.controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dadn.service.EquipService;
import com.example.dadn.service.HistoryService;
import com.example.dadn.service.UserEquipService;
import com.example.dadn.entities.Equipment;
import com.example.dadn.entities.History;
import com.example.dadn.entities.Schedule;
import com.example.dadn.entities.UserEquip;
import com.example.dadn.entities.enums.Enum_state;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.List;
import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:5173")

@RestController

@RequiredArgsConstructor

@RequestMapping("/dadn")


public class EquipController {

    
    private final EquipService equipService;

    private final UserEquipService userEquipService;
    private final HistoryService historyService;

    
    @PutMapping("/{username}/changeState/{id}")
    public Equipment putMethodName(@PathVariable Integer id,@PathVariable String username) {
        //TODO: process PUT request
        Equipment temp = equipService.getbyId(id);
        Enum_state a= Enum_state.Off;
        if(temp.getEquipment_state()==Enum_state.Off) a=Enum_state.On;
        
        return equipService.change(id);
        
    }
    @PutMapping("/changeLimit/{id}")
    public Equipment putLimit(@PathVariable Integer id,@RequestParam("tempLimit")Float temp_limit,@RequestParam("lightLimit")Float light_limit) {
        return equipService.changeLimit(id, temp_limit, light_limit);
        
    }
    @GetMapping("/{username}/getequip")
    public List<Equipment> getMethodName(@PathVariable String username) {
        return equipService.getbyUsername(username);
    }
    @GetMapping("/{username}/gethistory/{id}")
    public List<History> getHistory(@PathVariable Integer id) {
        return historyService.getHistory(id);
    }
    
    
    @GetMapping("/all")
    public List<Equipment> all() {
        //TODO: process PUT request
        return equipService.all();
        
    }
    @GetMapping("/getSche/{id}")
    public ResponseEntity<Schedule> getSche(@PathVariable Integer id) {
        Schedule schedule = equipService.getSche(id);
        return ResponseEntity.ok(schedule);
    }
    @PostMapping("/save")
    public ResponseEntity<String> saveState(@RequestParam String feed,
                                            @RequestParam String username) {
        String msg = historyService.saveStateFromAdafruit(feed, username);
        return ResponseEntity.ok(msg);
    }
    @PostMapping("/adduserequip")
    public ResponseEntity<String> newuserequip(@RequestParam Integer equipId,
    @RequestParam String username) {
        //TODO: process POST request
        String msg = equipService.newUserEquip(equipId, username);
        if (msg.equals("Nguoi dung da so huu thiet bi nay")) {
            return ResponseEntity.badRequest().body(msg);
        } else {
            return ResponseEntity.ok(msg);
        }
    }
    @DeleteMapping("/deleteuserequip")
    public ResponseEntity<String> deluserequip(@RequestParam Integer equipId,
    @RequestParam String username) {
        //TODO: process POST request
        String msg = equipService.deleteUserEquip(equipId, username);
        if (msg.equals("Xoa thanh cong")) {
            return ResponseEntity.ok(msg);
        } else {
            return ResponseEntity.badRequest().body(msg);
        }
    }
    @PostMapping("/newsche")
    public  ResponseEntity<String>  newSchedule(@RequestParam Integer EquipId,@RequestParam Timestamp time,@RequestParam Enum_state state) {
        //TODO: process POST request
        String msg = equipService.newSchedule(EquipId,time, state);
        return  ResponseEntity.ok(msg);
    }
    
    
}

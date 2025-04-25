package com.example.dadn.service;

import java.time.LocalDateTime;
import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import com.example.dadn.entities.Equipment;
import com.example.dadn.entities.Schedule;
import com.example.dadn.entities.enums.Enum_state;
import com.example.dadn.repositories.EquipmentRepository;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

public interface EquipService {
     public Equipment change(Integer id);
    public List<Equipment> all();
    public List<Equipment> getbyUsername(String username);
    public Equipment getbyId(Integer Id);
    public Equipment changeLimit(Integer id, Float tempLimit, Float lightLimit);
    public Schedule getSche(Integer id);
    public String newUserEquip(Integer id, String username);
    public String deleteUserEquip(Integer id, String username);
    
    public String newSchedule(Integer EquipId, Timestamp timestamp,Enum_state state);
}
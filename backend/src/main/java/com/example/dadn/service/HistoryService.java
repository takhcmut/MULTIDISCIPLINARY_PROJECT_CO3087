package com.example.dadn.service;

import java.util.List;

import com.example.dadn.entities.History;
import com.example.dadn.entities.enums.Enum_state;

public interface HistoryService {
    
    public List<History> getHistory(Integer equip);
    public String saveStateFromAdafruit(String feed, String username);
}

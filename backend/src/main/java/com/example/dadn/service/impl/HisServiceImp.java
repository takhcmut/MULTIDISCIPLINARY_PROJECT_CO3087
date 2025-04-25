package com.example.dadn.service.impl;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.dadn.entities.Equipment;
import com.example.dadn.entities.History;
import com.example.dadn.entities.enums.Enum_state;
import com.example.dadn.entities.key.HistoryKey;
import com.example.dadn.repositories.HistoryRepository;
import com.example.dadn.repositories.EquipmentRepository;
import com.example.dadn.service.HistoryService;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.example.dadn.entities.SensorData;
import com.example.dadn.repositories.SensorRepository;
import org.json.JSONObject;

import lombok.AllArgsConstructor;
@Service
@RequiredArgsConstructor
public class HisServiceImp implements HistoryService {
    private final HistoryRepository historyRepo;
    private final RestTemplate restTemplate = new RestTemplate();
    private final EquipmentRepository equipmentRepo;

   
    @Override
    public List<History> getHistory(Integer equip){
        return historyRepo.findByEquipId(equip);
    };
    @Override
    public String saveStateFromAdafruit(String feed, String username) {
        String url = "http://localhost:5000/sensor/" + feed;
        ResponseEntity<String> res = restTemplate.getForEntity(url, String.class);

        JSONObject json = new JSONObject(res.getBody());
        String value = json.getString("value");

        // Tìm thiết bị theo feed (giả sử equip_name = feed name)
        Equipment eq = equipmentRepo.findByEquipName(feed);
        if (eq == null) return "Thiết bị không tồn tại";

        History history = new History();

// Tạo key (nếu bạn dùng historyId là auto tăng thì KHÔNG cần set ở đây)
HistoryKey key = new HistoryKey();
history.setHistoryKey(key);

// Gán dữ liệu còn lại
history.setUsername(username);
history.setEquipId(eq.getEquipKey().getEquipId());
history.setEquipment_state(value.equals("1") ? Enum_state.On : Enum_state.Off);
history.setUpdateTime(new Timestamp(System.currentTimeMillis()));

        historyRepo.save(history);
        return "Đã lưu trạng thái thiết bị " + feed + " = " + value;
    }
    
}

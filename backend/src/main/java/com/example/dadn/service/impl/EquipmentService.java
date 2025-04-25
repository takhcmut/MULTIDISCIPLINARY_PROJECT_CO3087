package com.example.dadn.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;


import com.example.dadn.entities.Equipment;
import com.example.dadn.entities.Schedule;
import com.example.dadn.entities.UserEquip;
import com.example.dadn.entities.enums.Enum_state;
import com.example.dadn.repositories.EquipmentRepository;
import com.example.dadn.repositories.ScheduleRepository;
import com.example.dadn.repositories.UserEquipRepository;
import com.example.dadn.service.EquipService;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Service
@AllArgsConstructor
public class EquipmentService implements EquipService{
    
    private EquipmentRepository equipmentRepository;
    private UserEquipRepository userEquipRepository;
    private ScheduleRepository scheduleRepository;
    @Override
    public Equipment change(Integer id) {
        
        Equipment a = equipmentRepository.findByEquipKey_EquipId(id);
        if(a.getEquipment_state() == Enum_state.Off) {a.setEquipment_state(Enum_state.On);} else a.setEquipment_state(Enum_state.Off);
        equipmentRepository.save(a);
        return a;
    }
    @Override
    public List<Equipment> all(){
        
        return equipmentRepository.findAll();
    };
    @Override
    public Equipment changeLimit(Integer id, Float tempLimit, Float lightLimit){
        Equipment a = equipmentRepository.findByEquipKey_EquipId(id);
        a.setTempLimit(tempLimit);
        a.setLightLimit(lightLimit);
        equipmentRepository.save(a);
        return a;
    };
    @Override
    public Schedule getSche(Integer id){
        List<Schedule> scheduleList = scheduleRepository.findByScheduleKey_EquipId(id);
        Schedule temp = (scheduleList != null && !scheduleList.isEmpty()) ? scheduleList.get(0) : null;

    LocalDateTime now = LocalDateTime.now();    
    if (now.isAfter(temp.getScheduleKey().getTimestamp().toLocalDateTime())) {
        // now > timestamp
        scheduleRepository.delete(temp);
    }
        
        return temp;
    };
    @Override
    public List<Equipment> getbyUsername(String username){
        List<UserEquip> userEquipList = userEquipRepository.findByUserEquipKey_Username(username);

        List<Integer> equipIds = userEquipList.stream()
    .map(ue -> ue.getUserEquipKey().getEquipId())
    .collect(Collectors.toList());
    List<Equipment> equips = equipmentRepository.findByEquipKey_EquipIdIn(equipIds);
    return equips;
    };
    @Override
    public Equipment getbyId(Integer Id){
        return equipmentRepository.findByEquipKey_EquipId(Id);
    };
}

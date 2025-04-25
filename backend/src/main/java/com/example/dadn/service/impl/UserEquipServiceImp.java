package com.example.dadn.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.dadn.entities.UserEquip;
import com.example.dadn.repositories.UserEquipRepository;
import com.example.dadn.service.UserEquipService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserEquipServiceImp implements UserEquipService{
    private UserEquipRepository userEquipRepository;
    @Override 
    
    public List<UserEquip> equipHistory(Integer id){
        return userEquipRepository.findByUserEquipKey_EquipId(id);
     };

    
}

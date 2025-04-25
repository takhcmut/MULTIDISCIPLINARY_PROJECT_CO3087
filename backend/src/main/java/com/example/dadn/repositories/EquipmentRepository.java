package com.example.dadn.repositories;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.dadn.entities.Equipment;
import com.example.dadn.entities.key.EquipKey;


@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, EquipKey>{
    Equipment findByEquipKey_EquipId(Integer equipid);
    List<Equipment> findByEquipKey_EquipIdIn(List<Integer> equipIds);
    Equipment findByEquipName(String equipName);
}
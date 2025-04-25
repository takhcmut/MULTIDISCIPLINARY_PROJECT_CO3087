package com.example.dadn.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.dadn.entities.UserEquip;
import com.example.dadn.entities.key.UserEquipKey;
import java.util.List;


@Repository
public interface UserEquipRepository extends JpaRepository<UserEquip,UserEquipKey> {
    List<UserEquip> findByUserEquipKey_EquipId(Integer equipId);
    List<UserEquip> findByUserEquipKey_Username(String username);
    UserEquip findByUserEquipKey_UsernameAndUserEquipKey_EquipId(String username,Integer EquipId);
}

package com.example.dadn.entities;

import com.example.dadn.entities.key.UserEquipKey;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.AllArgsConstructor;

import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name= "user_and_equip")

public class UserEquip {
    @EmbeddedId
    private UserEquipKey userEquipKey;

}

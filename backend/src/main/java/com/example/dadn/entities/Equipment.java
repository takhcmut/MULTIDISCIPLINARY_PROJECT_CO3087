package com.example.dadn.entities;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.example.dadn.entities.enums.Enum_state;
import com.example.dadn.entities.key.EquipKey;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="equipment")
public class Equipment {
    
    @EmbeddedId
    private EquipKey equipKey; 
    @Column(name="equip_name")
    private String equipName;
    @Column(name="equipment_type")
    private String equipment_type;
    @Enumerated(EnumType.STRING)
    @Column(name="equipment_state")
    private Enum_state equipment_state; 
    @Column(name="temp_limit")
    private Float tempLimit;
    
    @Column(name="light_limit")
    private Float lightLimit;

    // public Object getEquipment_state() {
    //     throw new UnsupportedOperationException("Not supported yet.");
    // }
    
}

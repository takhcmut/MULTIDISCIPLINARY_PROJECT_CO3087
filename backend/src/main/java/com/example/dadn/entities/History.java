package com.example.dadn.entities;

import java.sql.Timestamp;

import com.example.dadn.entities.enums.Enum_state;
import com.example.dadn.entities.key.HistoryKey;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.AllArgsConstructor;

import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name= "ehistory")
public class History {
    @EmbeddedId
    private HistoryKey historyKey;
    @Column(name="username")
    private String username;
    @Column(name="equip_id")
    private Integer equipId;
    @Enumerated(EnumType.STRING)
    @Column(name="state_updated")
    private Enum_state equipment_state; 
    @Column(name = "update_time")
    private Timestamp updateTime;

    
}

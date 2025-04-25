package com.example.dadn.entities.key;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
@Data
@Embeddable
@AllArgsConstructor
@NoArgsConstructor

public class UserEquipKey implements Serializable{
    @Column(name="username")
    private String username;
    @Column(name="equip_id")
    private Integer equipId;
    
}

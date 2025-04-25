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
public class EquipKey implements Serializable {
       @Column(name = "equip_id")
       private Integer equipId;
        // @Column(name = "order_number")
        // private Integer orderNum;
        // @Column(name = "user_id")
        // private Integer userId;
    }
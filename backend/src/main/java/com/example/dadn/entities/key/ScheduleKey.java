package com.example.dadn.entities.key;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;

import java.io.Serializable;

@Data
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleKey implements Serializable{
    @Column(name="equip_id")
    private Integer equipId;
 
    @Column(name="timestamp")
    private Timestamp timestamp;

}

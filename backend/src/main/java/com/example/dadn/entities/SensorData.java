package com.example.dadn.entities;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Entity
@Table(name = "sensor_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "feed_name")
    private String feedName;

    @Column(name = "value")
    private String value;

    @Column(name = "timestamp", insertable = false, updatable = false)
    private Timestamp timestamp;
}

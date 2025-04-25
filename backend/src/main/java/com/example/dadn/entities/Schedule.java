package com.example.dadn.entities;
import java.sql.Timestamp;

import com.example.dadn.entities.enums.Enum_state;
import com.example.dadn.entities.key.HistoryKey;
import com.example.dadn.entities.key.ScheduleKey;

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
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="schedules")
public class Schedule {
@EmbeddedId
private ScheduleKey scheduleKey;
@Enumerated(EnumType.STRING)
@Column(name="state")
private Enum_state state; 
}

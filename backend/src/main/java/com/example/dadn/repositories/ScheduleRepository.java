package com.example.dadn.repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.dadn.entities.Schedule;
import com.example.dadn.entities.key.ScheduleKey;
import java.util.List;
@Repository
public interface ScheduleRepository extends JpaRepository<Schedule,ScheduleKey> {
    List<Schedule> findByScheduleKey_EquipId(Integer equipId);
    // List<Schedule> findByEquipIdAndState(Integer equipId, Enum_state state);
    // List<Schedule> findByState(Enum_state state);
    // List<Schedule> findByTimestampBetween(Timestamp start, Timestamp end);  

}

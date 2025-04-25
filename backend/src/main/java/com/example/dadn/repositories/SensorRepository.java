package com.example.dadn.repositories;

import com.example.dadn.entities.SensorData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SensorRepository extends JpaRepository<SensorData, Integer> {
    // Có thể thêm method nếu cần (VD: findByFeedName)
}

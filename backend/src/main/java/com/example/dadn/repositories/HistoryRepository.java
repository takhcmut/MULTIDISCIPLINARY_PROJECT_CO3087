package com.example.dadn.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.dadn.entities.History;
import com.example.dadn.entities.key.HistoryKey;
import java.util.List;


@Repository
public interface HistoryRepository extends JpaRepository<History,HistoryKey>{
    List<History> findByEquipId(Integer equipId);


    
}

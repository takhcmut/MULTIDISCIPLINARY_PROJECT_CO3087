package com.example.dadn.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import com.example.dadn.service.impl.SensorService;
@RestController
@RequestMapping("/api/sensor")
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensorService;

    @GetMapping("/get")
    public ResponseEntity<String> getSensor(@RequestParam String feed) {
        String result = sensorService.fetchSensorValue(feed);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/get-and-save")
    public ResponseEntity<String> getAndSave(@RequestParam String feed) {
        String result = sensorService.fetchAndSave(feed); // 💡 chỉ gọi service
        return ResponseEntity.ok(result);
    }
}

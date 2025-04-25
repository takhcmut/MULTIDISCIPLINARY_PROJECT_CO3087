package com.example.dadn.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;


import com.example.dadn.service.impl.PythonGatewayService;


import lombok.AllArgsConstructor;
@RestController

@RequestMapping("/api/device")
@RequiredArgsConstructor

public class DeviceController {
    
    private final PythonGatewayService gatewayService;
    

    @PostMapping("/control")
    public ResponseEntity<String> control(@RequestParam String feed,
                                          @RequestParam String status) {
        String result = gatewayService.controlDevice(feed, status);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sensor")
    public ResponseEntity<String> getSensor(@RequestParam String feed) {
        String value = gatewayService.getSensorValue(feed);
        return ResponseEntity.ok(value);
    }


}

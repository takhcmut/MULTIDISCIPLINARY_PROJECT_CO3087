package com.example.dadn.service.impl;

import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.example.dadn.entities.SensorData;
import com.example.dadn.repositories.SensorRepository;
import org.json.JSONObject;


@Service
@RequiredArgsConstructor

public class SensorService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PY_GATEWAY = "http://localhost:5000";
    private final SensorRepository sensorRepository;
    public String fetchSensorValue(String feed) {
        String url = PY_GATEWAY + "/sensor/" + feed;
        ResponseEntity<String> res = restTemplate.getForEntity(url, String.class);
        return res.getBody(); // sẽ là JSON string: {"feed":"cambien1","value":"..."}
    }
    public String fetchAndSave(String feed) {
        String url = "http://localhost:5000/sensor/" + feed;
        ResponseEntity<String> res = restTemplate.getForEntity(url, String.class);

        // Parse JSON (dùng org.json hoặc Jackson)
        JSONObject json = new JSONObject(res.getBody());
        String value = json.getString("value");

        SensorData data = SensorData.builder()
                .feedName(feed)
                .value(value)
                .build();

        sensorRepository.save(data);

        return "Đã lưu giá trị " + value + " từ feed " + feed;
    }
}

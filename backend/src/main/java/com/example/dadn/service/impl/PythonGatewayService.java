package com.example.dadn.service.impl;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;

@Service
public class PythonGatewayService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String GATEWAY_BASE_URL = "http://localhost:5000";

    public String controlDevice(String feed, String status) {
        String url = GATEWAY_BASE_URL + "/control";

        Map<String, String> body = new HashMap<>();
        body.put("feed", feed);
        body.put("status", status);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        return response.getBody();
    }
    public String getSensorValue(String feed) {
        String url = GATEWAY_BASE_URL + "/sensor/" + feed;
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }
}

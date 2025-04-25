package com.example.dadn.controller;

import com.example.dadn.dto.AuthRequest;
import com.example.dadn.service.AuthService;
import com.example.dadn.service.impl.JwtService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<?> auth(
            @RequestBody AuthRequest request
    ){
        return ResponseEntity.ok(authService.auth(request));
    }
}

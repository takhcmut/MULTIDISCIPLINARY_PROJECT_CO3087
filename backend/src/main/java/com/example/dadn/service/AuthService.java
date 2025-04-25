package com.example.dadn.service;

import com.example.dadn.dto.AuthRequest;
import com.example.dadn.dto.AuthResponse;
import com.example.dadn.entities.User;
import com.example.dadn.repositories.UserRepository;
import com.example.dadn.service.impl.JwtService;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@AllArgsConstructor
public class AuthService {

    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;

    private JwtService jwtService;

    private AuthenticationManager authenticationManager;

    public AuthResponse auth(AuthRequest request){

        if (userRepository.findByUserKey_Username(request.getUsername()).isEmpty())
            return new AuthResponse(null,null,"Invalid Username: Can't find Username");

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            return new AuthResponse(null,null, "Invalid Password: Wrong password");
        }


        User user = userRepository.findByUserKey_Username(request.getUsername()).orElseThrow(
                () -> new UsernameNotFoundException("Cant find user")
        );

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole());// Ví dụ thêm role của user
        extraClaims.put("username", request.getUsername());
        extraClaims.put("age", 123);

        String jwtToken = jwtService.generateToken(extraClaims,user);
        System.out.println("token: " + jwtToken);
        return AuthResponse.builder()
                .token(jwtToken)
                .username(request.getUsername())
                .response("Login successfully!")
                .build();
    }

    public String getIdFromToken(){
        return null;
    }
}
package com.example.aiinsurance.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "mySecretKeyForJwtTokenGenerationWhichIsLongEnough";
    private static final long EXPIRATION_TIME = 86400000; // 24 hours

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(String username) {
        // default non-admin token
        return generateToken(username, false);
    }

    public String generateToken(String username, boolean isAdmin) {
        return Jwts.builder()
                .setSubject(username)
                .claim("admin", isAdmin)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean extractIsAdmin(String token) {
        Claims claims = parseClaims(token);
        Boolean admin = claims.get("admin", Boolean.class);
        return admin != null && admin;
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // we can log here if needed
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
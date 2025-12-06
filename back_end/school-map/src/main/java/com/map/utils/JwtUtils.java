// JwtUtils.java
package com.map.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;
import java.util.Map;

public class JwtUtils {

    // 设置密钥，与测试类保持一致
    private static final String SECRET_KEY = "eXlj";

    // 设置过期时间为12小时
    private static final long EXPIRATION_TIME = 12 * 60 * 60 * 1000; // 12小时转换为毫秒

    /**
     * 生成JWT令牌
     * @param claims 要存储在令牌中的声明信息
     * @return 生成的JWT令牌字符串
     */
    public static String generateJwt(Map<String, Object> claims) {
        return Jwts.builder()
                .setClaims(claims)                    // 设置载荷
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 设置过期时间
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY) // 使用HS256算法和密钥签名
                .compact();
    }

    /**
     * 解析JWT令牌
     * @param token JWT令牌字符串
     * @return 解析出的声明信息
     */
    public static Claims parseJwt(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)  // 使用相同的密钥解析
                .parseClaimsJws(token)      // 解析令牌
                .getBody();                 // 获取载荷
    }
}

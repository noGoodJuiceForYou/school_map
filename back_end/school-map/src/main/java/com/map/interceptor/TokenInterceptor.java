package com.map.interceptor;

import com.map.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class TokenInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//        // 1、获取请求路径
//        String requestURI = request.getRequestURI();
//
//        // 2、判断请求路径是否为登录接口
//        if (requestURI.contains("/login")) {
//            log.info("登录接口，放行");
//            return true;
//        }

        // 3、获取请求头中的令牌（token）
        String token = request.getHeader("token");

        // 4、判断令牌是否存在，如果不存在，返回错误结果(401)
        if(token == null || token.isEmpty()){
            log.info("请求头token为空,响应401");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        // 5、如果令牌存在，校验令牌，如果校验失败 -> 返回错误结果(401)
        try {
            JwtUtils.parseJwt(token);
        } catch (Exception e){
          log.info("令牌校验失败，响应401");
          response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
          return false;
        }

        // 6、如果令牌校验成功，返回true，放行
        log.info("令牌校验成功，放行");
        return true;
    }
}

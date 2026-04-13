package com.map.config;

import com.map.interceptor.TokenInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 配置类
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

//    @Autowired
//    private DemoInterceptor demoInterceptor;

    @Autowired
    private TokenInterceptor tokenInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(tokenInterceptor)
//                .addPathPatterns("/**")  //拦截所有请求
//                .excludePathPatterns("/map/login")
//                .excludePathPatterns("/map/register");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        // 开发环境
                        "http://localhost:8081",
                        "http://127.0.0.1:8081",
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://localhost:5175",
                        // 生产环境 - HTTPS域名
                        "https://www.xujcmap.top",
                        "https://xujcmap.top",
                        "http://www.xujcmap.top",
                        "http://xujcmap.top"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

package com.map.controller;


import com.map.pojo.LoginInfo;
import com.map.pojo.Result;
import com.map.pojo.User;
import com.map.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class LoginController {

    @Autowired
    private UserService userService;

    @PostMapping("/map/login")
    public Result login(@RequestBody User user) {
        log.info("登录：{}", user);
        LoginInfo loginInfo = userService.login(user);
        if (loginInfo != null) {
            return Result.success(loginInfo);
        }
        return Result.error("用户名或密码错误");
    }

}

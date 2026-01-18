package com.map.controller.user;


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
public class RegisterController {

    @Autowired
    private UserService userService;

    @PostMapping("/user/register")
    public Result register(@RequestBody User user) {
        log.info("注册：{}", user);
        userService.register(user);
        return Result.success();
    }
}

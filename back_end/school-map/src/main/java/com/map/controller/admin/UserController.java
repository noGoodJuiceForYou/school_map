package com.map.controller.admin;


import com.map.pojo.Result;
import com.map.pojo.User;
import com.map.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/user")
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/list")
    public Result<List<User>> list() {
        log.info("获取普通用户列表");
        List<User> users = userService.getAllUsers();
        return Result.success(users);
    }

    @DeleteMapping("/delete/{id}")
    public Result delete(@PathVariable Integer id) {
        log.info("删除用户：{}", id);
        userService.deleteUser(id);
        return Result.success();
    }

    @PutMapping("/updateIdentity")
    public Result updateIdentity(@RequestParam Integer id, @RequestParam Integer identity) {
        log.info("更新用户权限：{}, {}", id, identity);
        userService.updateUserIdentity(id, identity);
        return Result.success();
    }

}
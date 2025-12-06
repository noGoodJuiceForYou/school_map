package com.map.service.impl;


import com.map.mapper.UserMapper;
import com.map.pojo.LoginInfo;
import com.map.pojo.User;
import com.map.service.UserService;
import com.map.utils.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public LoginInfo login(User user) {
        // 1、根据用户名和密码查询员工信息
        User u = userMapper.selectByUsernameAndPassword(user);
        // 2、如果查询有结果，则登录成功
        if(u != null){
            log.info("登录成功，用户信息：{}", u);
            //生成JWT令牌
            Map<String, Object> claims = new HashMap<>();
            claims.put("id", u.getId());
            claims.put("username", u.getUsername());
            String jwt = JwtUtils.generateJwt(claims);
            return new LoginInfo(u.getId(), u.getUsername(), "", jwt);
        }
        // 3、不存在则返回null
        return null;
    }

    @Override
    public void register(User user) {
        userMapper.insert(user);
    }
}

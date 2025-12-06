package com.map.service;


import com.map.pojo.LoginInfo;
import com.map.pojo.User;

public interface UserService {
    LoginInfo login(User user);

    void register(User user);
}

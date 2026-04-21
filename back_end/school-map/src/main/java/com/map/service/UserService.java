package com.map.service;


import com.map.pojo.LoginInfo;
import com.map.pojo.User;

import java.util.List;

public interface UserService {
    LoginInfo loginForM(User user);

    void register(User user);

    LoginInfo loginForC(User user);

    List<User> getAllUsers();

    void deleteUser(Integer id);

    void updateUserIdentity(Integer id, Integer identity);
}

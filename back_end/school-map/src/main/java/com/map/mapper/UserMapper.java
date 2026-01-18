package com.map.mapper;

import com.map.pojo.User;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {
    @Select("select * from user where username = #{username} and password = #{password}")
    User selectByUsernameAndPassword(User user);

    @Select("select * from user where username = #{username}")
    User selectByUsername(String username);

    @Insert("insert into user(username, password) values(#{username}, #{password})")
    void insert(User user);
}

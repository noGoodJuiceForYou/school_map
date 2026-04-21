package com.map.mapper;

import com.map.pojo.User;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface UserMapper {
    @Select("select * from user where BINARY username = #{username} and BINARY password = #{password}")
    User selectByUsernameAndPassword(User user);

    @Select("select * from user where BINARY id = #{id}")
    User selectById(Integer id);

    @Insert("insert into user(username, password) values(#{username}, #{password})")
    void insert(User user);

    @Select("select * from user")
    List<User> selectAllUsers();

    @Delete("delete from user where id = #{id}")
    void deleteById(Integer id);

    @Update("update user set identity = #{identity} where id = #{id}")
    void updateIdentity(Integer id, Integer identity);
}

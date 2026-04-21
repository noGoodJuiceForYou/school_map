package com.map.mapper;

import com.map.pojo.DTO.UserCommentDTO;
import com.map.pojo.UserComment;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface UserCommentMapper {
    @Insert("insert into user_comment(user_id, location_id, content, time, needs_review) values(#{userId}, #{locationId}, #{content}, #{time}, #{needsReview})")
    void add(UserComment userComment);

    List<UserCommentDTO> getCommentsByLocationId(Integer locationId);

    @Delete("delete from user_comment where id = #{id}")
    void delete(Integer id);
}

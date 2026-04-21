package com.map.service;

import com.map.pojo.DTO.UserCommentDTO;
import com.map.pojo.UserComment;

import java.util.List;

public interface UserCommentService {
    void add(UserComment userComment);
    List<UserCommentDTO> getCommentsByLocationId(Integer locationId);
    void delete(Integer id);
}

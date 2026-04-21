package com.map.service.impl;

import com.map.mapper.UserCommentMapper;
import com.map.pojo.DTO.UserCommentDTO;
import com.map.pojo.UserComment;
import com.map.service.UserCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserCommentServiceImpl implements UserCommentService {

    @Autowired
    UserCommentMapper userCommentMapper;

    @Override
    public void add(UserComment userComment) {
        LocalDateTime time = LocalDateTime.now();
        userComment.setTime(time);
        userCommentMapper.add(userComment);
    }

    @Override
    public List<UserCommentDTO> getCommentsByLocationId(Integer locationId) {
        return userCommentMapper.getCommentsByLocationId(locationId);
    }

    @Override
    public void delete(Integer id) {
        userCommentMapper.delete(id);
    }
}

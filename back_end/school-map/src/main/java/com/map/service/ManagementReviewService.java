package com.map.service;

import com.map.pojo.DTO.ManagementReviewQueryDTO;
import com.map.pojo.DTO.UserCommentDTO;
import com.map.pojo.PageResult;

import java.util.List;

public interface ManagementReviewService {

    void delete(List<Integer> ids);

    PageResult pageQuery(ManagementReviewQueryDTO query);
}

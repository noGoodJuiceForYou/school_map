package com.map.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.map.mapper.ManagementReviewMapper;
import com.map.pojo.DTO.ManagementReviewQueryDTO;
import com.map.pojo.DTO.UserCommentDTO;
import com.map.pojo.PageResult;
import com.map.pojo.UserComment;
import com.map.pojo.VO.UserLocationInfoVO;
import com.map.service.ManagementReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ManagementReviewServiceImpl implements ManagementReviewService {

    @Autowired
    private ManagementReviewMapper managementReviewMapper;

    @Override
    public void delete(List<Integer> ids) {
        managementReviewMapper.deleteById(ids);
    }

    @Override
    public PageResult pageQuery(ManagementReviewQueryDTO query) {
        PageHelper.startPage(query.getPage(), query.getPageSize());
        Page<UserCommentDTO> page = managementReviewMapper.pageQuery(query);
        return new PageResult(page.getTotal(), page.getResult());
    }
}

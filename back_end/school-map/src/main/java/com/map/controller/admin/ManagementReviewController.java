package com.map.controller.admin;

import com.map.pojo.DTO.ManagementReviewQueryDTO;
import com.map.pojo.DTO.UserCommentDTO;
import com.map.pojo.PageResult;
import com.map.pojo.Result;
import com.map.service.ManagementReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/commentReview")
@Slf4j
public class ManagementReviewController {

    @Autowired
    private ManagementReviewService managementReviewService;

    @GetMapping("/list")
    public Result<PageResult> list(ManagementReviewQueryDTO query) {
        log.info("获取需审核评论列表");
        PageResult list = managementReviewService.pageQuery(query);
        return Result.success(list);
    }

    @DeleteMapping("/delete")
    public Result delete(@RequestParam List<Integer> ids) {
        log.info("删除评论：{}", ids);
        managementReviewService.delete(ids);
        return Result.success();
    }
}


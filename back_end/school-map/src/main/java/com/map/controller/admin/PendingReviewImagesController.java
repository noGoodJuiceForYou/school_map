package com.map.controller.admin;

import com.map.pojo.PendingReviewImages;
import com.map.pojo.Result;
import com.map.pojo.VO.AdminPendingReviewImagesVO;
import com.map.pojo.VO.PendingReviewImagesVO;
import com.map.service.PendingReviewImagesService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("AdminPendingReviewImagesController")
@RequestMapping("/admin/pendingReviewImages")
@Slf4j
public class PendingReviewImagesController {

    @Autowired
    private PendingReviewImagesService pendingReviewImagesService;

    @PostMapping("/move")
    public Result move(@RequestParam Integer id) {
        log.info("移动待审核图片");
        pendingReviewImagesService.move(id);
        return Result.success();
    }

    @GetMapping("/list")
    public Result<List<AdminPendingReviewImagesVO>> listPendingReviewImages() {
        log.info("获取待审核图片列表");
        List<AdminPendingReviewImagesVO> list = pendingReviewImagesService.listAll();
        return Result.success(list);
    }

    @DeleteMapping("/delete")
    public Result deletePendingReviewImages(@RequestParam Integer id) {
        log.info("删除待审核图片：{}", id);
        pendingReviewImagesService.delete(id);
        return Result.success();
    }

}

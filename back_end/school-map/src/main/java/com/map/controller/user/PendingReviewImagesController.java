package com.map.controller.user;

import com.map.pojo.PendingReviewImages;
import com.map.pojo.Result;
import com.map.pojo.VO.PendingReviewImagesVO;
import com.map.service.PendingReviewImagesService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("UserPendingReviewImagesController")
@RequestMapping("/user/pendingReviewImages")
@Slf4j
public class PendingReviewImagesController {

    @Autowired
    private PendingReviewImagesService pendingReviewImagesService;

    @PostMapping("/add")
    public Result addPendingReviewImages(@RequestBody PendingReviewImages pendingReviewImages) {
        log.info("添加待审核图片：{}", pendingReviewImages);
        pendingReviewImagesService.add(pendingReviewImages);
        return Result.success();
    }

    @GetMapping("/list")
    public Result<List<PendingReviewImagesVO>> listPendingReviewImages(@RequestParam Integer userId) {
        log.info("获取待审核图片列表");
        List<PendingReviewImagesVO> list = pendingReviewImagesService.listByUserId(userId);
        return Result.success(list);
    }

    @DeleteMapping("/delete")
    public Result deletePendingReviewImages(@RequestParam Integer id) {
        log.info("删除待审核图片：{}", id);
        pendingReviewImagesService.delete(id);
        return Result.success();
    }

}

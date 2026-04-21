package com.map.service;

import com.map.pojo.PendingReviewImages;
import com.map.pojo.VO.AdminPendingReviewImagesVO;
import com.map.pojo.VO.PendingReviewImagesVO;

import java.util.List;

public interface PendingReviewImagesService {
    void add(PendingReviewImages pendingReviewImages);

    List<PendingReviewImagesVO> listByUserId(Integer userId);

    void delete(Integer id);

    List<AdminPendingReviewImagesVO> listAll();

    void move(Integer id);
}

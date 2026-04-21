package com.map.service.impl;

import com.map.mapper.*;
import com.map.pojo.*;
import com.map.pojo.VO.AdminPendingReviewImagesVO;
import com.map.pojo.VO.PendingReviewImagesVO;
import com.map.pojo.VO.SubLocationImagesVO;
import com.map.pojo.VO.SubLocationInfoVO;
import com.map.service.PendingReviewImagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PendingReviewImagesServiceImpl implements PendingReviewImagesService {

    @Autowired
    private PendingReviewImagesMapper pendingReviewImagesMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private LocationInfoMapper locationInfoMapper;

    @Autowired
    private SubLocationInfoMapper subLocationInfoMapper;

    @Autowired
    private LocationImagesMapper locationImagesMapper;

    @Autowired
    private SubLocationImagesMapper subLocationImagesMapper;

    @Override
    public void add(PendingReviewImages pendingReviewImages) {
        LocalDateTime time = LocalDateTime.now();
        pendingReviewImages.setTime(time);
        pendingReviewImagesMapper.add(pendingReviewImages);
    }

    @Override
    @Transactional
    public List<PendingReviewImagesVO> listByUserId(Integer userId) {
        List<PendingReviewImagesVO> list = new ArrayList<>();
        List<PendingReviewImages> priList = pendingReviewImagesMapper.listByUserId(userId);
        for (PendingReviewImages pri : priList) {
            PendingReviewImagesVO priVO = new PendingReviewImagesVO();
            String name;
            if (pri.getLocationId() == null) {
                name = subLocationInfoMapper.getSubLocationInfo(Long.valueOf(pri.getSubLocationId())).getName();
            }
            else {
                name = locationInfoMapper.getInfo(Long.valueOf(pri.getLocationId())).getName();
            }
            priVO.setId(pri.getId());
            priVO.setName(name);
            priVO.setImage(pri.getUrl());
            priVO.setTime(pri.getTime());
            list.add(priVO);
        }
        return list;
    }

    @Override
    public void delete(Integer id) {
        pendingReviewImagesMapper.deleteById(id);
    }

    @Override
    @Transactional
    public List<AdminPendingReviewImagesVO> listAll() {
        List<PendingReviewImages> pendingReviewImages = pendingReviewImagesMapper.listAll();
        List<AdminPendingReviewImagesVO> list = new ArrayList<>();
        for (PendingReviewImages pendingReviewImage : pendingReviewImages) {
            AdminPendingReviewImagesVO adminPendingReviewImagesVO = new AdminPendingReviewImagesVO();
            adminPendingReviewImagesVO.setUsername(userMapper.selectById(pendingReviewImage.getUserId()).getUsername());
            if(pendingReviewImage.getLocationId() == null) {
                adminPendingReviewImagesVO.setSubLocationName(subLocationInfoMapper.getSubLocationInfo(Long.valueOf(pendingReviewImage.getSubLocationId())).getLocationName());
            }
            if(pendingReviewImage.getSubLocationId() == null) {
                adminPendingReviewImagesVO.setLocationName(locationInfoMapper.getInfo(Long.valueOf(pendingReviewImage.getLocationId())).getName());
            }
            adminPendingReviewImagesVO.setId(pendingReviewImage.getId());
            adminPendingReviewImagesVO.setUrl(pendingReviewImage.getUrl());
            adminPendingReviewImagesVO.setTime(pendingReviewImage.getTime());
            list.add(adminPendingReviewImagesVO);
        }
        return list;
    }

    @Override
    @Transactional
    public void move(Integer id) {
        PendingReviewImages pri = pendingReviewImagesMapper.getById(id);
        if (pri.getLocationId() != null) {
            Long locationId = Long.valueOf(pri.getLocationId());
            String url = pri.getUrl();
            locationImagesMapper.addImages(locationId, url);
        }
        if (pri.getSubLocationId() != null) {
            Long subLocationId = Long.valueOf(pri.getSubLocationId());
            String url = pri.getUrl();
            subLocationImagesMapper.addImage(subLocationId, url);
        }
        pendingReviewImagesMapper.deleteById(id);
    }
}

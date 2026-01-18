package com.map.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.map.mapper.LocationImagesMapper;
import com.map.mapper.LocationInfoMapper;
import com.map.mapper.SubLocationImagesMapper;
import com.map.mapper.SubLocationInfoMapper;
import com.map.pojo.DTO.LocationPageQueryDTO;
import com.map.pojo.LocationInfo;
import com.map.pojo.DTO.LocationInfoDTO;
import com.map.pojo.PageResult;
import com.map.pojo.VO.AdminLocationInfoVO;
import com.map.pojo.VO.LocationImagesVO;
import com.map.pojo.VO.SubLocationImagesVO;
import com.map.pojo.VO.UserLocationInfoVO;
import com.map.pojo.SubLocation;
import com.map.service.LocationInfoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class LocationInfoServiceImpl implements LocationInfoService {

    @Autowired
    private LocationInfoMapper locationInfoMapper;

    @Autowired
    private LocationImagesMapper locationImagesMapper;

    @Autowired
    private SubLocationInfoMapper subLocationInfoMapper;

    @Autowired
    private SubLocationImagesMapper subLocationImagesMapper;

    /**
     * 获取地点信息
     * @param id
     */
    @Override
    public UserLocationInfoVO getInfo(Long id) {
        LocationInfo locationInfo = locationInfoMapper.getInfo(id);
        if (locationInfo == null) {
            log.warn("地点不存在，id: {}", id);
            return null;
        }

        List<LocationImagesVO> images = locationImagesMapper.getImages(id);
        List<String> imagess = new ArrayList<>();
        for (LocationImagesVO image : images) {
            imagess.add(image.getUrl());
        }
        List<SubLocation> subLocations = subLocationInfoMapper.getSubLocations(id);

        for (SubLocation subLocation : subLocations) {
            Long subId = subLocation.getId();
            List<SubLocationImagesVO> subImages = subLocationImagesMapper.getSubImages(subId);
            List<String> subImagess = new ArrayList<>();
            for (SubLocationImagesVO subImage : subImages) {
                subImagess.add(subImage.getUrl());
            }
            subLocation.setImages(subImagess);
        }

        UserLocationInfoVO userLocationInfoVO = UserLocationInfoVO.builder()
                .id(locationInfo.getId())
                .name(locationInfo.getName())
                .description(locationInfo.getDescription())
                .information(locationInfo.getInformation())
                .images(imagess)
                .subLocations(subLocations)
                .build();

        log.info("获取地点信息成功，id: {}", id);
        return userLocationInfoVO;
    }

    /**
     * 分页获取所有父地点列表
     */
    @Override
    public PageResult pageQuery(LocationPageQueryDTO query) {
        PageHelper.startPage(query.getPage(), query.getPageSize());
        Page<UserLocationInfoVO> page = locationInfoMapper.pageQuery(query);
        return new PageResult(page.getTotal(), page.getResult());
    }

    /**
     * 获取父地点图片
     * @param id
     */
    @Override
    public List<LocationImagesVO> getImages(Long id) {
        return locationImagesMapper.getImages(id);
    }

    /**
     * 新增父地点
     */
    @Override
    public void addLocation(LocationInfoDTO locationInfoDTO) {
        locationInfoMapper.addLocation(locationInfoDTO);
    }

    /**
     * 更新父地点信息
     */
    @Override
    public void updateLocation(LocationInfoDTO locationInfoDTO) {
        locationInfoMapper.updateLocation(locationInfoDTO);
    }

    /**
     * 删除父地点
     */
    @Transactional
    @Override
    public void deleteLocation(List<Long> ids) {
        subLocationImagesMapper.deleteSubLocationImagesByLocationId(ids);
        subLocationInfoMapper.deleteSubLocationByLocationId(ids);
        locationImagesMapper.deleteLocationImages(ids);
        locationInfoMapper.deleteLocation(ids);
    }

    /**
     * 根据id获取父地点信息
     * @param id
     */
    @Override
    public AdminLocationInfoVO getAdminInfo(Long id) {
        AdminLocationInfoVO locationInfo = locationInfoMapper.getAdminInfo(id);
        return locationInfo;
    }

    /**
     * 新增父地点图片
     * @param id
     * @param image
     */
    @Override
    public void addImage(Long id, String image) {
        locationImagesMapper.addImages(id, image);
    }

    /**
     * 删除父地点图片
     * @param ids
     */
    @Override
    public void deleteImages(List<Long> ids) {
        locationImagesMapper.deleteLocationImagesByIds(ids);
    }

    /**
     * 获取父地点下拉列表
     */
    @Override
    public List<UserLocationInfoVO> getLocationList() {
        return locationInfoMapper.getList();
    }
}

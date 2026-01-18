package com.map.service;

import com.map.pojo.DTO.LocationPageQueryDTO;
import com.map.pojo.DTO.LocationInfoDTO;
import com.map.pojo.PageResult;
import com.map.pojo.VO.AdminLocationInfoVO;
import com.map.pojo.VO.LocationImagesVO;
import com.map.pojo.VO.UserLocationInfoVO;

import java.util.List;

public interface LocationInfoService {
    /**
     * 获取地点信息
     * @param id
     */
    UserLocationInfoVO getInfo(Long id);

    /**
     * 分页获取所有地点列表
     */
    PageResult pageQuery(LocationPageQueryDTO query);


    /**
     * 获取父地点图片
     * @param id
     */
    List<LocationImagesVO> getImages(Long id);

    /**
     * 新增父地点
     */
    void addLocation(LocationInfoDTO locationInfoDTO);

    /**
     * 更新父地点信息
     */
    void updateLocation(LocationInfoDTO locationInfoDTO);

    /**
     * 删除父地点信息
     */
    void deleteLocation(List<Long> ids);

    /**
     * 根据id获取父地点信息
     * @param id
     */
    AdminLocationInfoVO getAdminInfo(Long id);

    /**
     * 新增父地点图片
     * @param id
     * @param image
     */
    void addImage(Long id, String image);

    /**
     * 删除父地点图片
     * @param ids
     */
    void deleteImages(List<Long> ids);

    /**
     * 获取父地点下拉列表
     */
    List<UserLocationInfoVO> getLocationList();
}

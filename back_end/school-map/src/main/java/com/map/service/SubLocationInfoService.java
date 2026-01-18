package com.map.service;

import com.map.pojo.DTO.SubLocationInfoDTO;
import com.map.pojo.DTO.SubLocationPageQueryDTO;
import com.map.pojo.PageResult;
import com.map.pojo.VO.SubLocationImagesVO;
import com.map.pojo.VO.SubLocationInfoVO;

import java.util.List;

public interface SubLocationInfoService {
    /**
     * 获取地点的子地点列表
     */
    PageResult pageQuery(SubLocationPageQueryDTO query);

    /**
     * 获取子地点图片
     */
    List<SubLocationImagesVO> getImages(Long id);

    /**
     * 新增子地点
     */
    void addSubLocation(SubLocationInfoDTO subLocationInfoDTO);

    /**
     * 删除子地点
     */
    void deleteSubLocationById(List<Long> ids);

    /**
     * 新增子地点图片
     */
    void addImages(Long id, String image);

    /**
     * 删除子地点图片
     */
    void deleteImages(List<Long> ids);

    /**
     * 根据id获取子地点信息
     */
    SubLocationInfoVO getSubLocationInfo(Long id);

    /**
     * 修改子地点信息
     */
    void updateSubLocation(SubLocationInfoDTO subLocationInfoDTO);
}

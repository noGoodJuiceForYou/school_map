package com.map.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.map.mapper.SubLocationImagesMapper;
import com.map.mapper.SubLocationInfoMapper;
import com.map.pojo.DTO.SubLocationInfoDTO;
import com.map.pojo.DTO.SubLocationPageQueryDTO;
import com.map.pojo.PageResult;
import com.map.pojo.VO.SubLocationImagesVO;
import com.map.pojo.VO.SubLocationInfoVO;
import com.map.service.SubLocationInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubLocationInfoServiceImpl implements SubLocationInfoService {

    @Autowired
    private SubLocationInfoMapper subLocationInfoMapper;

    @Autowired
    private SubLocationImagesMapper subLocationImagesMapper;

    /**
     * 分页获取所有子地点列表
     */
    @Override
    public PageResult pageQuery(SubLocationPageQueryDTO query) {
        PageHelper.startPage(query.getPage(), query.getPageSize());
        Page<SubLocationInfoVO> page = subLocationInfoMapper.pageQuery(query);
        return new PageResult(page.getTotal(), page.getResult());
    }

    /**
     * 获取子地点图片
     * @param id
     */
    @Override
    public List<SubLocationImagesVO> getImages(Long id) {
        return subLocationImagesMapper.getSubImages(id);
    }

    /**
     * 新增子地点
     */
    @Override
    public void addSubLocation(SubLocationInfoDTO subLocationInfoDTO) {
        subLocationInfoMapper.addSubLocation(subLocationInfoDTO);
    }

    /**
     * 删除子地点
     */
    @Transactional
    @Override
    public void deleteSubLocationById(List<Long> ids) {
        subLocationImagesMapper.deleteBySubLocationId(ids);
        subLocationInfoMapper.deleteById(ids);
    }

    /**
     * 新增子地点图片
     */
    @Override
    public void addImages(Long id, String image) {
        subLocationImagesMapper.addImage(id, image);
    }

    /**
     * 删除子地点图片
     */
    @Override
    public void deleteImages(List<Long> ids) {
        subLocationImagesMapper.deleteById(ids);
    }

    /**
     * 根据id获取子地点信息
     */
    @Override
    public SubLocationInfoVO getSubLocationInfo(Long id) {
        return subLocationInfoMapper.getSubLocationInfo(id);
    }

    /**
     * 更新子地点信息
     */
    @Override
    public void updateSubLocation(SubLocationInfoDTO subLocationInfoDTO) {
        subLocationInfoMapper.updateSubLocation(subLocationInfoDTO);
    }
}

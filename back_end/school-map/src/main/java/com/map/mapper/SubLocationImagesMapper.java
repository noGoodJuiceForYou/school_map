package com.map.mapper;

import com.map.pojo.VO.SubLocationImagesVO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Service;

import java.util.List;

@Mapper
public interface SubLocationImagesMapper {

    /**
     * 获取地点子地点图片
     * @param id
     */
    @Select("select id, url from sub_location_images where sub_location_id = #{id}")
    List<SubLocationImagesVO> getSubImages(Long id);

    /**
     * 根据父地点id删除子地点图片
     * @param ids
     */
    void deleteSubLocationImagesByLocationId(List<Long> ids);

    /**
     * 根据id删除子地点图片
     * @param ids
     */
    void deleteById(List<Long> ids);

    /**
     * 新增子地点图片
     * @param id
     * @param image
     */
    @Insert("insert into sub_location_images(sub_location_id, url) values (#{id}, #{image})")
    void addImage(Long id, String image);

    /**
     * 根据子地点id删除子地点图片
     * @param ids
     */
    void deleteBySubLocationId(List<Long> ids);
}

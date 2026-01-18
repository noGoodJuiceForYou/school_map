package com.map.mapper;

import com.map.pojo.VO.LocationImagesVO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Service;

import java.util.List;

@Mapper
public interface LocationImagesMapper {

    /**
     * 获取父地点图片
     * @param id
     */
    @Select("select id, url from location_images where location_id = #{id}")
    List<LocationImagesVO> getImages(Long id);

    /**
     * 删除父地点图片
     * @param ids
     */
    void deleteLocationImages(List<Long> ids);

    /**
     * 新增父地点图片
     * @param id
     * @param image
     */
    @Insert("insert into location_images(location_id, url) values(#{id}, #{image})")
    void addImages(Long id, String image);

    /**
     * 根据图片id删除图片
     * @param ids
     */
    void deleteLocationImagesByIds(List<Long> ids);
}

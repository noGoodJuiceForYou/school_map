package com.map.mapper;

import com.map.pojo.LocationImages;
import com.map.pojo.LocationInfo;
import com.map.pojo.LocationInfoVO;
import com.map.pojo.SubLocation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface LocationInfoMapper {
    /**
     * 获取地点信息
     * @param id
     */
    @Select("select * from location_info where id = #{id}")
    LocationInfo getInfo(Long id);

    /**
     * 获取地点图片
     * @param id
     */
    @Select("select url from location_images where location_id = #{id}")
    List<String> getImages(Long id);

    @Select("select * from sub_location where location_id = #{id}")
    List<SubLocation> getSubLocations(Long id);
}

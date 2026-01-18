package com.map.mapper;

import com.github.pagehelper.Page;
import com.map.pojo.DTO.LocationInfoDTO;
import com.map.pojo.DTO.LocationPageQueryDTO;
import com.map.pojo.LocationInfo;
import com.map.pojo.VO.AdminLocationInfoVO;
import com.map.pojo.VO.UserLocationInfoVO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface LocationInfoMapper {
    /**
     * 根据id获取地点信息
     * @param id
     */
    @Select("select * from location_info where id = #{id}")
    LocationInfo getInfo(Long id);

    /**
     * 分页获取所有地点列表
     */
    Page<UserLocationInfoVO> pageQuery(LocationPageQueryDTO query);


    /**
     * 新增父地点
     */
    @Insert("insert into location_info(name, description, information) values(#{name}, #{description}, #{information})")
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
    @Select("select * from location_info where id = #{id}")
    AdminLocationInfoVO getAdminInfo(Long id);

    /**
     * 获取父地点下拉列表
     */
    @Select("select id, name from location_info")
    List<UserLocationInfoVO> getList();
}

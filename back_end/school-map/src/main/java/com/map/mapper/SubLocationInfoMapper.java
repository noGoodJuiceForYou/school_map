package com.map.mapper;

import com.github.pagehelper.Page;
import com.map.pojo.DTO.SubLocationInfoDTO;
import com.map.pojo.DTO.SubLocationPageQueryDTO;
import com.map.pojo.SubLocation;
import com.map.pojo.VO.SubLocationInfoVO;
import lombok.Data;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SubLocationInfoMapper {

    /**
     * 获取地点副地点
     * @param id
     */
    @Select("select * from sub_location where location_id = #{id}")
    List<SubLocation> getSubLocations(Long id);

    /**
     * 分页获取子地点列表
     * @param query
     */
    Page<SubLocationInfoVO> pageQuery(SubLocationPageQueryDTO query);

    /**
     * 根据父地点id删除子地点信息
     * @param ids
     */
    void deleteSubLocationByLocationId(List<Long> ids);

    /**
     * 新增子地点信息
     * @param subLocationInfoDTO
     */
    @Insert("insert into sub_location(location_id, name, introduction) values (#{locationId}, #{name}, #{introduction})")
    void addSubLocation(SubLocationInfoDTO subLocationInfoDTO);

    /**
     * 根据id删除子地点信息
     * @param ids
     */
    void deleteById(List<Long> ids);

    /**
     * 根据id获取子地点信息
     * @param id
     */
    SubLocationInfoVO getSubLocationInfo(Long id);

    /**
     * 更新子地点信息
     * @param subLocationInfoDTO
     */
    void updateSubLocation(SubLocationInfoDTO subLocationInfoDTO);

}

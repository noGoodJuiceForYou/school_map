package com.map.pojo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LocationInfoVO {
    // 主键id
    private Integer id;
    // 地点名称
    private String name;
    // 描述
    private String description;
    // 详细信息
    private String information;
    // 图片集
    private List<String> images;
    // 副地点
    private List<SubLocation> subLocations;
}

package com.map.pojo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LocationInfo {
    // 主键id
    private Integer id;
    // 地点名称
    private String name;
    // 描述
    private String description;
    // 详细信息
    private String information;
}

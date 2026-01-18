package com.map.pojo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocationInfoDTO {
    // 地点id
    private Long id;
    // 地点名称
    private String name;
    // 描述
    private String description;
    // 详细信息
    private String information;
}

package com.map.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocationImages {
    // 主键id
    private Integer id;
    // 地点id
    private Integer locationId;
    // 图片url地址
    private String url;

}

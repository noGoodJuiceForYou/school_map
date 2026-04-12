package com.map.pojo.VO;

import com.map.pojo.SubLocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminLocationInfoVO {
    // 主键id
    private Integer id;
    // 地点名称
    private String name;
    // 描述
    private String description;
    // 详细信息
    private String information;
    // 经度
    private Double longitude;
    // 纬度
    private Double latitude;
}

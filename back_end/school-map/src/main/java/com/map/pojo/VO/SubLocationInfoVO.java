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
public class SubLocationInfoVO {
    // 主键id
    private Integer id;
    // 地点名称
    private String name;
    // 父地点名称
    private String locationName;
    // 简介
    private String introduction;
}

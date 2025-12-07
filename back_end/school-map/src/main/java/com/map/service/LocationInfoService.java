package com.map.service;

import com.map.pojo.LocationInfoVO;

public interface LocationInfoService {
    /**
     * 获取地点信息
     * @param id
     */
    LocationInfoVO getInfo(Long id);
}

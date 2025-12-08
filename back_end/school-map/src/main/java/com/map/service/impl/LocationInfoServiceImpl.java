package com.map.service.impl;

import com.map.mapper.LocationInfoMapper;
import com.map.pojo.LocationImages;
import com.map.pojo.LocationInfo;
import com.map.pojo.LocationInfoVO;
import com.map.pojo.SubLocation;
import com.map.service.LocationInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationInfoServiceImpl implements LocationInfoService {

    @Autowired
    private LocationInfoMapper locationInfoMapper;

    /**
     * 获取地点信息
     * @param id
     */
    @Override
    public LocationInfoVO getInfo(Long id) {
        LocationInfo locationInfo = locationInfoMapper.getInfo(id);

        List<String> images = locationInfoMapper.getImages(id);

        List<SubLocation> subLocations = locationInfoMapper.getSubLocations(id);

        for (SubLocation subLocation : subLocations) {
            Long subId = subLocation.getId();
            List<String> subImages = locationInfoMapper.getSubImages(subId);
            subLocation.setImages(subImages);
        }

        LocationInfoVO locationInfoVO = LocationInfoVO.builder()
                .name(locationInfo.getName())
                .description(locationInfo.getDescription())
                .information(locationInfo.getInformation())
                .images(images)
                .subLocations(subLocations)
                .build();

        return locationInfoVO;
    }
}

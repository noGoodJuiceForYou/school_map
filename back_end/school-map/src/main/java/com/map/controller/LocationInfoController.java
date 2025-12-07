package com.map.controller;


import com.map.pojo.LocationInfoVO;
import com.map.pojo.Result;
import com.map.service.LocationInfoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/map/locationinfo")
@Slf4j
public class LocationInfoController {

    @Autowired
    private LocationInfoService locationInfoService;

    /**
     * 获取地点信息
     * @return
     */
    @GetMapping("/{id}")
    public Result<LocationInfoVO> getLocationInfo(@PathVariable Long id) {
        log.info("获取地点信息");
        LocationInfoVO locationInfoVO = locationInfoService.getInfo(id);
        return Result.success(locationInfoVO);
    }


}

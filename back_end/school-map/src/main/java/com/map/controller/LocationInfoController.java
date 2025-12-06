package com.map.controller;


import com.map.pojo.LocationInfoVO;
import com.map.pojo.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/map/locationinfo")
@Slf4j
public class LocationInfoController {


    /**
     * 获取地点信息
     * @return
     */
    //TODO 获取地点信息
    @GetMapping
    public Result<LocationInfoVO> getLocationInfo() {
        log.info("获取地点信息");
        return Result.success();
    }
}

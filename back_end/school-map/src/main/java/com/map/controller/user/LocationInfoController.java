package com.map.controller.user;


import com.map.pojo.Result;
import com.map.pojo.VO.UserLocationInfoVO;
import com.map.service.LocationInfoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("UserLocationController")
@RequestMapping("/user/location")
@Slf4j
public class LocationInfoController {

    @Autowired
    private LocationInfoService locationInfoService;

    /**
     * 根据id获取所有地点信息
     * @return
     */
    @GetMapping("/{id}")
    public Result<UserLocationInfoVO> getLocationInfo(@PathVariable Long id) {
        log.info("获取地点信息，id: {}", id);
        UserLocationInfoVO userLocationInfoVO = locationInfoService.getInfo(id);
        return Result.success(userLocationInfoVO);
    }

}

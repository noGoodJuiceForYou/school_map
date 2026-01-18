package com.map.controller.admin;


import com.map.pojo.DTO.LocationInfoDTO;
import com.map.pojo.DTO.LocationPageQueryDTO;
import com.map.pojo.PageResult;
import com.map.pojo.VO.AdminLocationInfoVO;
import com.map.pojo.VO.LocationImagesVO;
import com.map.pojo.VO.UserLocationInfoVO;
import com.map.pojo.Result;
import com.map.service.LocationInfoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("AdminLocationInfoController")
@RequestMapping("/admin/location")
@Slf4j
public class LocationInfoController {

    @Autowired
    private LocationInfoService locationInfoService;

    /**
     * 分页查询所有父地点
     * @return
     */
    @GetMapping("/list")
    public Result<PageResult> listInfo(LocationPageQueryDTO query) {
        log.info("获取所有地点列表");
        PageResult locations = locationInfoService.pageQuery(query);
        return Result.success(locations);
    }

    /**
     * 根据id获取父地点信息
     * @return
     */
    @GetMapping("/{id}")
    public Result<AdminLocationInfoVO> getLocationInfo(@PathVariable Long id) {
        log.info("获取地点信息，id: {}", id);
        AdminLocationInfoVO adminLocationInfoVO = locationInfoService.getAdminInfo(id);
        return Result.success(adminLocationInfoVO);
    }

    /**
     * 根据id获取父地点图片
     * @param id
     * @return
     */
    @GetMapping("/{id}/images")
    public Result<List<LocationImagesVO>> getImages(@PathVariable Long id) {
        log.info("获取地点图片，id: {}", id);
        List<LocationImagesVO> images = locationInfoService.getImages(id);
        return Result.success(images);
    }

    /**
     * 新增父地点
     * @return
     */
    @PostMapping("/add")
    public Result addLocation(@RequestBody LocationInfoDTO locationInfoDTO) {
        log.info("新增地点信息，DTO: {}", locationInfoDTO);
        locationInfoService.addLocation(locationInfoDTO);
        return Result.success();
    }

    /**
     * 更新父地点信息
     */
    @PutMapping("/update")
    public Result updateLocation(@RequestBody LocationInfoDTO locationInfoDTO) {
        log.info("更新地点信息，DTO: {}", locationInfoDTO);
        locationInfoService.updateLocation(locationInfoDTO);
        return Result.success();
    }

    /**
     * 删除父地点信息
     * @return
     */
    @DeleteMapping("/delete")
    public Result deleteLocation(@RequestParam List<Long> ids) {
        log.info("删除地点信息，ids: {}", ids);
        locationInfoService.deleteLocation(ids);
        return Result.success();
    }

    /**
     * 新增父地点图片
     * @return
     */
    @PostMapping("/addImages")
    public Result addImages(@RequestParam Long id, @RequestParam String image) {
        log.info("新增地点图片，id: {}, images: {}", id, image);
        locationInfoService.addImage(id, image);
        return Result.success();
    }

    /**
     * 删除父地点图片
     * @return
     */
    @DeleteMapping("/deleteImages")
    public Result deleteImages(@RequestParam List<Long> ids) {
        locationInfoService.deleteImages(ids);
        return Result.success();
    }

    /**
     * 获取父地点下拉列表
     */
    @GetMapping("/Llist")
    public Result<List<UserLocationInfoVO>> getLocationList() {
        log.info("获取父地点下拉列表");
        List<UserLocationInfoVO> locations = locationInfoService.getLocationList();
        return Result.success(locations);
    }
}

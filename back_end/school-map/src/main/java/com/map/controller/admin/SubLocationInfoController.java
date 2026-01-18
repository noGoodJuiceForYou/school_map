package com.map.controller.admin;

import com.map.pojo.DTO.SubLocationInfoDTO;
import com.map.pojo.DTO.SubLocationPageQueryDTO;
import com.map.pojo.PageResult;
import com.map.pojo.Result;
import com.map.pojo.VO.SubLocationImagesVO;
import com.map.pojo.VO.SubLocationInfoVO;
import com.map.service.SubLocationInfoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/subLocation")
@Slf4j
public class SubLocationInfoController {

    @Autowired
    private SubLocationInfoService subLocationInfoService;

    /**
     * 分页查询所有子地点
     * @return
     */
    @GetMapping("/list")
    public Result<PageResult> listInfo(SubLocationPageQueryDTO query) {
        log.info("获取所有地点列表");
        PageResult locations = subLocationInfoService.pageQuery(query);
        return Result.success(locations);
    }

    /**
     * 根据id获取子地点图片
     * @param id
     * @return
     */
    @GetMapping("/{id}/images")
    public Result<List<SubLocationImagesVO>> getImages(@PathVariable Long id) {
        log.info("获取地点图片，id: {}", id);
        List<SubLocationImagesVO> subLocationImagesVO = subLocationInfoService.getImages(id);
        return Result.success(subLocationImagesVO);
    }

    /**
     * 根据id获取子地点信息
     * @param id
     * @return
     */
    @GetMapping("/{id}")
    public Result<SubLocationInfoVO> getSubLocationInfo(@PathVariable Long id) {
        log.info("获取子地点信息，id: {}", id);
        SubLocationInfoVO subLocationInfoVO = subLocationInfoService.getSubLocationInfo(id);
        return Result.success(subLocationInfoVO);
    }

    /**
     * 新增子地点
     * @return
     */
    @PostMapping("/add")
    public Result addSubLocation(@RequestBody SubLocationInfoDTO subLocationInfoDTO){
        log.info("新增子地点");
        subLocationInfoService.addSubLocation(subLocationInfoDTO);
        return Result.success();
    }

    /**
     * 修改子地点信息
     * @param subLocationInfoDTO
     * @return
     */
    @PutMapping("/update")
    public Result updateSubLocation(@RequestBody SubLocationInfoDTO subLocationInfoDTO) {
        log.info("修改子地点信息");
        subLocationInfoService.updateSubLocation(subLocationInfoDTO);
        return Result.success();
    }


    /**
     * 删除子地点
     * @param ids
     * @return
     */
    @DeleteMapping("/delete")
    public Result deleteSubLocation(@RequestBody List<Long> ids) {
        log.info("删除子地点");
        subLocationInfoService.deleteSubLocationById(ids);
        return Result.success();
    }

    /**
     * 新增子地点图片
     * @return
     */
    @PostMapping("/addImages")
    public Result addImages(@RequestParam Long id, @RequestParam String image) {
        log.info("新增子地点图片");
        subLocationInfoService.addImages(id, image);
        return Result.success();
    }

    /**
     * 删除子地点图片
     * @return
     */
    @DeleteMapping("/deleteImages")
    public Result deleteImages(@RequestParam List<Long> ids) {
        log.info("删除子地点图片");
        subLocationInfoService.deleteImages(ids);
        return Result.success();
    }

}

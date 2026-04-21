package com.map.mapper;

import com.map.pojo.PendingReviewImages;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PendingReviewImagesMapper {

    void add(PendingReviewImages pendingReviewImages);

    @Select("select * from pending_review_images where user_id = #{userId} order by time desc")
    List<PendingReviewImages> listByUserId(Integer userId);

    @Delete("delete from pending_review_images where id = #{id}")
    void deleteById(Integer id);

    @Select("select * from pending_review_images order by time desc")
    List<PendingReviewImages> listAll();

    @Select("select * from pending_review_images where id = #{id}")
    PendingReviewImages getById(Integer id);
}

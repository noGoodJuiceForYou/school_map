package com.map.pojo.VO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PendingReviewImagesVO {
    private Integer id;
    private String name;
    private String image;
    private LocalDateTime time;
}

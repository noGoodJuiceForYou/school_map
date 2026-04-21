package com.map.pojo.VO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPendingReviewImagesVO {
    private Integer id;
    private String username;
    private String locationName;
    private String subLocationName;
    private String url;
    private LocalDateTime time;
}

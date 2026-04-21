package com.map.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PendingReviewImages {
    private Integer id;
    private Integer userId;
    private Integer locationId;
    private Integer subLocationId;
    private String url;
    private LocalDateTime time;
}

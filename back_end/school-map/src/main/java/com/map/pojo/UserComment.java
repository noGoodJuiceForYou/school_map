package com.map.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserComment {
    private Integer id;
    private Integer userId;
    private Integer locationId;
    private String content;
    private LocalDateTime time;
    private Integer needsReview;
}

package com.map.pojo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserCommentDTO {
    private Integer id;
    private Integer userId;
    private String username;
    private Integer locationId;
    private String content;
    private LocalDateTime time;
}

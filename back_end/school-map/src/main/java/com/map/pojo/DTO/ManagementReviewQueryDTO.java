package com.map.pojo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagementReviewQueryDTO {
    private int page;
    private int pageSize;
    private String name;
}

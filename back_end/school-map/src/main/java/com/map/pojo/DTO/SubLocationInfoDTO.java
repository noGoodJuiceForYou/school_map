package com.map.pojo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubLocationInfoDTO {
    private Long id;
    private String name;
    private Long locationId;
    private String introduction;
}

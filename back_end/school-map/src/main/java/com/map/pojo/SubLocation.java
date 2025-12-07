package com.map.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubLocation {
    private Long id;
    private Long location_id;
    private String name;
    private String introduction;
}

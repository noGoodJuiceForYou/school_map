package com.map.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubLocation {
    private Long id;
    private Long location_id;
    private String name;
    private String introduction;
    private List<String> images;
}

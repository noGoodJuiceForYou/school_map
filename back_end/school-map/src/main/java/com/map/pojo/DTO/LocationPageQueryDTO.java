package com.map.pojo.DTO;

import lombok.Data;

@Data
public class LocationPageQueryDTO {

    private int page;

    private int pageSize;

    private String name;

}

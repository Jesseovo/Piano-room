package com.bookingsystem.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    private Long id;
    private String roomNumber;
    private String name;
    private Integer floor;
    private Integer capacity;
    private Long roomTypeId;
    private String facilities;
    private Integer status;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
package com.china.cultural.tourism.scenic.controller;

import com.china.cultural.tourism.scenic.entity.ScenicSpot;
import com.china.cultural.tourism.scenic.service.ScenicSpotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/scenic-spots")
public class ScenicSpotController {
    @Autowired
    private ScenicSpotService scenicSpotService;
    
    @GetMapping
    public ResponseEntity<List<ScenicSpot>> getAllScenicSpots(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<ScenicSpot> scenicSpots = scenicSpotService.getAllScenicSpots(page, size);
        return new ResponseEntity<>(scenicSpots, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ScenicSpot> getScenicSpotById(@PathVariable Long id) {
        Optional<ScenicSpot> scenicSpot = scenicSpotService.getScenicSpotById(id);
        return scenicSpot.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/level/{level}")
    public ResponseEntity<List<ScenicSpot>> getScenicSpotsByLevel(@PathVariable String level) {
        List<ScenicSpot> scenicSpots = scenicSpotService.getScenicSpotsByLevel(level);
        return new ResponseEntity<>(scenicSpots, HttpStatus.OK);
    }
    
    @GetMapping("/region/{region}")
    public ResponseEntity<List<ScenicSpot>> getScenicSpotsByRegion(@PathVariable String region) {
        List<ScenicSpot> scenicSpots = scenicSpotService.getScenicSpotsByRegion(region);
        return new ResponseEntity<>(scenicSpots, HttpStatus.OK);
    }
    
    @PostMapping
    public ResponseEntity<ScenicSpot> createScenicSpot(@RequestBody ScenicSpot scenicSpot) {
        ScenicSpot createdScenicSpot = scenicSpotService.saveScenicSpot(scenicSpot);
        return new ResponseEntity<>(createdScenicSpot, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ScenicSpot> updateScenicSpot(@PathVariable Long id, @RequestBody ScenicSpot scenicSpot) {
        Optional<ScenicSpot> existingScenicSpot = scenicSpotService.getScenicSpotById(id);
        if (existingScenicSpot.isPresent()) {
            scenicSpot.setId(id);
            ScenicSpot updatedScenicSpot = scenicSpotService.saveScenicSpot(scenicSpot);
            return new ResponseEntity<>(updatedScenicSpot, HttpStatus.OK);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScenicSpot(@PathVariable Long id) {
        Optional<ScenicSpot> existingScenicSpot = scenicSpotService.getScenicSpotById(id);
        if (existingScenicSpot.isPresent()) {
            scenicSpotService.deleteScenicSpot(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
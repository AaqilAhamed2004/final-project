package com.aura.controller;

import com.aura.dto.PrologAnalysisResponseDto;
import com.aura.schema.PrologAnalysis;
import com.aura.service.AnalysisService;
import com.aura.repository.AnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/logic")
public class LogicController {

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private AnalysisRepository analysisRepository;

    /** POST /api/logic/analyze/{id} — Manually trigger AI analysis (gn_officer, super_admin only) */
    @PostMapping("/analyze/{id}")
    @PreAuthorize("hasAnyRole('GN_OFFICER', 'SUPER_ADMIN')")
    public PrologAnalysisResponseDto runAnalysis(@PathVariable String id) {
        PrologAnalysis analysis = analysisService.analyzeRequestSync(id);
        return analysisService.toResponseDto(analysis);
    }

    /** GET /api/logic/analysis/{id} — Retrieve AI analysis result for a request */
    @GetMapping("/analysis/{id}")
    public PrologAnalysisResponseDto getAnalysisResult(@PathVariable String id) {
        PrologAnalysis analysis = analysisRepository.findByRequestId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Analysis not found for this request"));
        return analysisService.toResponseDto(analysis);
    }
}

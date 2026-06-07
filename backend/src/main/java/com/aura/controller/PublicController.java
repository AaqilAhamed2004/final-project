package com.aura.controller;

import com.aura.dto.BookingCreateDto;
import com.aura.dto.ContributionDto;
import com.aura.dto.PublicStatsDto;
import com.aura.schema.Booking;
import com.aura.schema.ReliefRequest;
import com.aura.schema.User;
import com.aura.service.PublicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private PublicService publicService;

    /** GET /api/public/board — Get public/approved relief requests */
    @GetMapping("/board")
    public List<ReliefRequest> getBoard() {
        return publicService.getBoard();
    }

    /** GET /api/public/stats — General public statistics */
    @GetMapping("/stats")
    public PublicStatsDto getStats() {
        return publicService.getStats();
    }

    /** POST /api/public/book — Book a request for donation (donors, gn_officers, super_admins) */
    @PostMapping("/book")
    @PreAuthorize("hasAnyRole('DONOR', 'GN_OFFICER', 'SUPER_ADMIN')")
    public Map<String, Object> bookRequest(
            @RequestBody BookingCreateDto dto,
            @AuthenticationPrincipal User currentUser) {
        Booking booking = publicService.bookRequest(dto, currentUser);
        return Map.of("message", "Donation booked successfully", "booking_id", booking.getId());
    }

    /** GET /api/public/my-contributions — Contributions made by currently authenticated user */
    @GetMapping("/my-contributions")
    @PreAuthorize("hasAnyRole('DONOR', 'GN_OFFICER', 'SUPER_ADMIN')")
    public List<ContributionDto> getMyContributions(@AuthenticationPrincipal User currentUser) {
        return publicService.getMyContributions(currentUser);
    }
}

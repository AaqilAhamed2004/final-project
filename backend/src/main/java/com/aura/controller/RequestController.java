package com.aura.controller;

import com.aura.dto.ReliefRequestCreateDto;
import com.aura.dto.UpdateStatusDto;
import com.aura.schema.ReliefRequest;
import com.aura.schema.User;
import com.aura.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    @Autowired
    private RequestService requestService;

    /** POST /api/requests — Create new relief request (gn_officer, super_admin only) */
    @PostMapping
    @PreAuthorize("hasAnyRole('GN_OFFICER', 'SUPER_ADMIN')")
    public ReliefRequest createRequest(
            @RequestBody ReliefRequestCreateDto dto,
            @AuthenticationPrincipal User currentUser) {
        return requestService.createRequest(dto, currentUser);
    }

    /** GET /api/requests — All requests */
    @GetMapping
    public List<ReliefRequest> getAllRequests() {
        return requestService.getAllRequests();
    }

    /** GET /api/requests/my — Requests created by the currently authenticated user */
    @GetMapping("/my")
    public List<ReliefRequest> getMyRequests(@AuthenticationPrincipal User currentUser) {
        return requestService.getMyRequests(currentUser);
    }

    /** PATCH /api/requests/{id}/status — Update request status (gn_officer, super_admin only) */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('GN_OFFICER', 'SUPER_ADMIN')")
    public ReliefRequest updateStatus(@PathVariable String id, @RequestBody UpdateStatusDto dto) {
        return requestService.updateStatus(id, dto);
    }
}

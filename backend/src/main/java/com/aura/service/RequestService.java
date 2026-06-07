package com.aura.service;

import com.aura.dto.ReliefRequestCreateDto;
import com.aura.dto.UpdateStatusDto;
import com.aura.schema.ReliefRequest;
import com.aura.schema.RequestItem;
import com.aura.repository.RequestRepository;
import com.aura.schema.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RequestService {

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private AnalysisService analysisService;

    /**
     * Creates a new relief request and triggers AI analysis asynchronously.
     * Mirrors the create_request POST endpoint in requests.py.
     */
    public ReliefRequest createRequest(ReliefRequestCreateDto dto, User currentUser) {
        // 1. Default title if not provided
        String title = (dto.getTitle() != null && !dto.getTitle().isBlank())
                ? dto.getTitle()
                : "Relief Request: " + dto.getLocation();

        // 2. Pre-process items — mirrors double-defense fallback in requests.py
        List<RequestItem> processedItems = dto.getItems().stream().map(item -> {
            // Fallback: if current_stock not set, use quantity
            if ((item.getCurrentStock() == null || item.getCurrentStock() == 0) && item.getQuantity() > 0) {
                item.setCurrentStock(item.getQuantity());
            }
            // Dynamic prolog_item_key generation from item name
            if (item.getPrologItemKey() == null || item.getPrologItemKey().isBlank()) {
                String cleaned = item.getItemName()
                        .toLowerCase()
                        .replaceAll("[^a-z0-9]", "_")
                        .replaceAll("_+", "_")
                        .replaceAll("^_|_$", "");
                item.setPrologItemKey(cleaned.isBlank() ? null : cleaned);
            }
            return item;
        }).collect(Collectors.toList());

        // 3. Build and save request document
        ReliefRequest request = ReliefRequest.builder()
                .title(title)
                .description(dto.getDescription())
                .location(dto.getLocation())
                .items(processedItems)
                .roadStatus(dto.getRoadStatus())
                .populationSize(dto.getPopulationSize())
                .isPublic(dto.isPublic())
                .creatorId(currentUser.getId())
                .status("pending")
                .createdAt(Instant.now())
                .priorityLevel("Standard")
                .build();

        ReliefRequest saved = requestRepository.save(request);

        // 4. Trigger AI analysis in background — replaces background_tasks.add_task(analyze_request, id)
        analysisService.analyzeRequest(saved.getId());

        return saved;
    }

    /**
     * Returns all requests, sorted by creation date descending.
     */
    public List<ReliefRequest> getAllRequests() {
        return requestRepository.findAll().stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .collect(Collectors.toList());
    }

    /**
     * Returns all requests created by the current user.
     */
    public List<ReliefRequest> getMyRequests(User currentUser) {
        return requestRepository.findAll().stream()
                .filter(r -> currentUser.getId().equals(r.getCreatorId()))
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .collect(Collectors.toList());
    }

    /**
     * Updates the status of a request.
     * Only accessible by gn_officer or super_admin (enforced at controller level).
     */
    public ReliefRequest updateStatus(String id, UpdateStatusDto dto) {
        ReliefRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        request.setStatus(dto.getStatus());
        return requestRepository.save(request);
    }
}

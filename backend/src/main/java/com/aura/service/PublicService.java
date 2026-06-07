package com.aura.service;

import com.aura.dto.BookingCreateDto;
import com.aura.dto.ContributionDto;
import com.aura.dto.PublicStatsDto;
import com.aura.schema.Booking;
import com.aura.schema.ReliefRequest;
import com.aura.schema.User;
import com.aura.repository.BookingRepository;
import com.aura.repository.RequestRepository;
import com.aura.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class PublicService {

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Gets all public relief requests, ordered by creation date descending.
     */
    public List<ReliefRequest> getBoard() {
        return requestRepository.findByIsPublicTrueOrderByCreatedAtDesc();
    }

    /**
     * Calculates stats for the public dashboard.
     */
    public PublicStatsDto getStats() {
        long totalReq = requestRepository.count();
        long totalDonors = userRepository.countByRole("donor");
        long completedReq = requestRepository.countByStatus("completed");
        long itemsDistributed = completedReq * 50;

        long activeZones = requestRepository.findAll().stream()
                .map(ReliefRequest::getLocation)
                .filter(Objects::nonNull)
                .filter(loc -> !loc.isBlank())
                .distinct()
                .count();

        return PublicStatsDto.builder()
                .totalRequests(totalReq)
                .activeReliefZones(activeZones)
                .totalDonors(totalDonors)
                .itemsDistributed(itemsDistributed)
                .build();
    }

    /**
     * Books a request for donation.
     */
    public Booking bookRequest(BookingCreateDto dto, User currentUser) {
        ReliefRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        // Save booking
        Booking booking = Booking.builder()
                .requestId(dto.getRequestId())
                .notes(dto.getNotes())
                .donorId(currentUser.getId())
                .bookedAt(Instant.now())
                .build();
        Booking savedBooking = bookingRepository.save(booking);

        // Update request status to "ongoing"
        request.setStatus("ongoing");
        requestRepository.save(request);

        return savedBooking;
    }

    /**
     * Retrieves all contributions (bookings) made by the current user.
     */
    public List<ContributionDto> getMyContributions(User currentUser) {
        List<Booking> bookings = bookingRepository.findByDonorIdOrderByBookedAtDesc(currentUser.getId());
        List<ContributionDto> results = new ArrayList<>();

        for (Booking b : bookings) {
            if (b.getRequestId() == null) {
                // Skip inventory bookings
                continue;
            }
            requestRepository.findById(b.getRequestId()).ifPresent(req -> {
                results.add(ContributionDto.builder()
                        .bookingId(b.getId())
                        .requestId(req.getId())
                        .title(req.getTitle() != null ? req.getTitle() : "Relief Request")
                        .location(req.getLocation() != null ? req.getLocation() : "Unknown")
                        .status(req.getStatus() != null ? req.getStatus() : "pending")
                        .priorityLevel(req.getPriorityLevel() != null ? req.getPriorityLevel() : "Standard")
                        .bookedAt(b.getBookedAt())
                        .items(req.getItems())
                        .notes(b.getNotes())
                        .build());
            });
        }
        return results;
    }
}

package com.aura.repository;

import com.aura.schema.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByDonorIdOrderByBookedAtDesc(String donorId);
}

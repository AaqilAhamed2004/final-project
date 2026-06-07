package com.aura.repository;

import com.aura.schema.ReliefRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RequestRepository extends MongoRepository<ReliefRequest, String> {
    List<ReliefRequest> findByIsPublicTrueOrderByCreatedAtDesc();
    long countByStatus(String status);
}

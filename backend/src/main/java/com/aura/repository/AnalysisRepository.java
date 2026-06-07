package com.aura.repository;

import com.aura.schema.PrologAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface AnalysisRepository extends MongoRepository<PrologAnalysis, String> {
    Optional<PrologAnalysis> findByRequestId(String requestId);
}

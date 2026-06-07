# AURA — Mentor's Migration & Architecture Guide
### Python/FastAPI + Prolog → Java/Spring Boot + TypeScript/Next.js

---

## 1. Your Overall Approach — My Honest Assessment

**Short answer: This is an excellent decision, and your instincts are correct.**

Here's why each choice makes professional sense:

| Your Choice | Why It's The Right Call |
|---|---|
| Java + Spring Boot | The industry standard for enterprise-grade backends. Every large bank, logistics system, and government platform uses it. It's a highly valued skill on a CV. |
| TypeScript + Next.js | A massive upgrade over plain React/Vite. TypeScript prevents entire categories of runtime bugs. Next.js adds SSR, file-based routing, and built-in API routes — all professional-level features. |
| Prolog logic → Java service layer | Correct. Embedding logic directly in a typed Java service is far more maintainable than calling an external process via a subprocess shell (as the current `prolog_worker_cli.py` does). |

> **One word of caution:** The Prolog-to-Java translation is the hardest part. Prolog's strength is *backtracking* — it can explore multiple rule branches automatically. In Java, you must implement this branching manually using `if/else` chains or a rules engine. You will not "lose" any logic — you just have to write it out explicitly. I'll show you exactly how below.

---

## 2. New System Architecture

Here is what the new AURA will look like:

```
[ USER / BROWSER ]
        |
        v
+----------------------------------+
|       NEXT.JS FRONTEND           |  TypeScript, App Router, Tailwind
|  /app — file-based pages         |  Axios/Fetch for API calls
|  /components — reusable UI       |  Zod for client-side validation
+----------------------------------+
        |
   (REST API via HTTP/JSON)
        |
        v
+----------------------------------+      +----------------------------------+
|   SPRING BOOT BACKEND            |      |  PRIORITY ENGINE SERVICE         |
|  Java 21, Maven                  |----> |  (Pure Java — replaces Prolog)   |
|  Spring Security (JWT)           |      |  PriorityRulesService.java       |
|  Spring Data MongoDB             |      |  RiskAssessmentService.java      |
+----------------------------------+      |  MedicineKnowledgeBase.java      |
        |                                 +----------------------------------+
  (MongoDB Driver)
        |
        v
+----------------------------------+
|      MONGODB DATABASE            |  Same collections, same schema
+----------------------------------+
```

**Key change:** The Prolog engine is completely removed. Its three `.pl` files are re-implemented as plain Java classes inside the Spring Boot service layer. The frontend talks to Spring Boot exactly the same way it talked to FastAPI — via REST + JSON + JWT.

---

## 3. Translating the Prolog Logic to Java

This is the most critical section. Here is a direct, rule-by-rule translation of each `.pl` file.

### 3a. `priority_rules.pl` → `PriorityRulesService.java`

**The original Prolog rule (blocked medicine = RED):**
```prolog
assign_priority(medicine, blocked, _, _, red) :- !.
```

**The Java equivalent — read this like a direct translation:**
```java
// In Java, we implement the same ordered rule list.
// The KEY is: order matters. Check the most specific rules FIRST,
// exactly like Prolog checks its clauses top-to-bottom.

public String assignPriority(String category, String roadStatus,
                              String popSize, String stockLevel) {

    // ── RED RULES ─────────────────────────────────────────────
    // Rule: medicine + blocked roads → RED (patients can't reach hospital)
    if (category.equals("medicine") && roadStatus.equals("blocked")) return "red";

    // Rule: medicine + zero stock → RED (no supply at all)
    if (category.equals("medicine") && stockLevel.equals("empty")) return "red";

    // Rule: medicine + large population + low stock → RED (will run out fast)
    if (category.equals("medicine") && popSize.equals("large") && stockLevel.equals("low")) return "red";

    // Rule: food + blocked roads + large population → RED (mass starvation)
    if (category.equals("food") && roadStatus.equals("blocked") && popSize.equals("large")) return "red";

    // Rule: any category + blocked roads + zero stock → RED
    if (roadStatus.equals("blocked") && stockLevel.equals("empty")) return "red";

    // ── ORANGE RULES ──────────────────────────────────────────
    if (category.equals("medicine") && stockLevel.equals("low")) return "orange";
    if (category.equals("medicine") && isDegradedRoad(roadStatus)) return "orange";
    if (category.equals("food") && popSize.equals("large")) return "orange";
    if (category.equals("food") && roadStatus.equals("blocked")) return "orange";
    if (category.equals("food") && isDegradedRoad(roadStatus)) return "orange";
    if (category.equals("shelter") && (roadStatus.equals("blocked") || isDegradedRoad(roadStatus))) return "orange";
    if (isDegradedRoad(roadStatus) && stockLevel.equals("empty")) return "orange";

    // ── YELLOW (default) ──────────────────────────────────────
    return "yellow";
}

// Prolog helper: degraded_road(partial). degraded_road(flooded).
private boolean isDegradedRoad(String road) {
    return road.equals("partial") || road.equals("flooded");
}
```

> **Why this works:** Prolog uses "first match wins" with `!` (cut). Java's `if/return` pattern achieves identical behaviour — once a rule matches and returns, no further rules are evaluated.

---

### 3b. `risk_assessment.pl` → `RiskAssessmentService.java`

The critical difference from `priority_rules.pl`: Risk flags use **no cut (`!`)**. Multiple flags can fire simultaneously. In Java, this means we use a `List` and add all matching flags.

```java
public List<String> getAllFlags(String road, String pop,
                                 String category, String stock) {
    List<String> flags = new ArrayList<>();

    if (road.equals("blocked"))
        flags.add("ROAD BLOCKED: Consider aerial drop or boat delivery.");

    if (pop.equals("large") && category.equals("medicine"))
        flags.add("LARGE POPULATION + MEDICINE: Coordinate multiple distribution points.");

    if (stock.equals("empty"))
        flags.add("ZERO STOCK: Raise immediate resupply order — do not wait.");

    if (isDegradedRoad(road) && pop.equals("large"))
        flags.add("PARTIAL/FLOODED ACCESS + LARGE CROWD: Deploy motorbike couriers for last mile.");

    if (pop.equals("large") && category.equals("food") && stock.equals("empty"))
        flags.add("FOOD SHORTAGE (LARGE): Risk of civil unrest — prioritise security escort.");

    if (road.equals("blocked") && pop.equals("large"))
        flags.add("LARGE ISOLATED POPULATION: Notify District Secretariat and NDRRMC immediately.");

    if (road.equals("blocked") && category.equals("medicine"))
        flags.add("MEDICINE + BLOCKED ROADS: Coordinate with nearest hospital for emergency dispatch.");

    return flags;
}
```

---

### 3c. `medicine_kb.pl` → `MedicineKnowledgeBase.java`

The knowledge base is a simple lookup table. In Java, a `Map` is the perfect data structure.

```java
@Component
public class MedicineKnowledgeBase {

    // substitute(paracetamol, ibuprofen, "Ibuprofen reduces fever...")
    // → stored as: Map<DrugName, SubstituteInfo>
    private static final Map<String, String[]> SUBSTITUTES = Map.of(
        "paracetamol",           new String[]{"ibuprofen",    "Ibuprofen reduces fever and pain similarly. Avoid in children under 6 months."},
        "ibuprofen",             new String[]{"paracetamol",  "Paracetamol is safer for children and those with stomach sensitivity."},
        "amoxicillin",           new String[]{"ampicillin",   "Ampicillin covers a similar spectrum of bacterial infections."},
        "ampicillin",            new String[]{"amoxicillin",  "Amoxicillin is better absorbed orally and has similar coverage."},
        "oral_rehydration_salts",new String[]{"coconut_water","Emergency hydration alternative. Also prepare home ORS: 1L water, 6 tsp sugar, 0.5 tsp salt."},
        "metronidazole",         new String[]{"tinidazole",   "Tinidazole is effective against similar anaerobic and parasitic infections."},
        "chloroquine",           new String[]{"artemether",   "Artemether-based therapy is recommended for malaria in Sri Lanka where resistance is present."},
        "cetirizine",            new String[]{"loratadine",   "Loratadine is a non-drowsy antihistamine effective for similar allergy symptoms."},
        "omeprazole",            new String[]{"ranitidine",   "Ranitidine reduces stomach acid through a different mechanism but is a viable short-term substitute."}
    );

    // no_substitute(insulin). no_substitute(epinephrine). etc.
    private static final Set<String> NO_SUBSTITUTE = Set.of("insulin", "epinephrine", "morphine", "warfarin");

    public SubstituteResult getSubstitute(String drug) {
        String key = drug.toLowerCase().replace(" ", "_");
        if (SUBSTITUTES.containsKey(key)) {
            String[] info = SUBSTITUTES.get(key);
            return SubstituteResult.found(info[0], info[1]);
        }
        return SubstituteResult.none(drug); // covers no_substitute AND unknown drugs
    }
}
```

---

## 4. Spring Boot Project Structure

This is the recommended package layout that mirrors the current FastAPI routers:

```
backend/
└── src/main/java/com/aura/
    ├── AuraApplication.java              ← Entry point (replaces main.py)
    │
    ├── config/
    │   ├── SecurityConfig.java           ← JWT filter, CORS config, role guards
    │   └── MongoConfig.java              ← MongoDB connection (replaces database.py)
    │
    ├── controller/                       ← Replaces app/routers/
    │   ├── AuthController.java           ← /api/auth/** (replaces auth.py router)
    │   ├── RequestController.java        ← /api/requests/**
    │   ├── InventoryController.java      ← /api/inventory/**
    │   ├── LogicController.java          ← /api/logic/** (triggers AI analysis)
    │   └── PublicController.java         ← /api/public/**
    │
    ├── service/                          ← Business logic layer (NEW — FastAPI had none)
    │   ├── AuthService.java
    │   ├── RequestService.java
    │   ├── InventoryService.java
    │   ├── AnalysisService.java          ← Orchestrates the AI pipeline
    │   ├── PriorityRulesService.java     ← Replaces priority_rules.pl
    │   ├── RiskAssessmentService.java    ← Replaces risk_assessment.pl
    │   └── MedicineKnowledgeBase.java    ← Replaces medicine_kb.pl
    │
    ├── model/                            ← Replaces models.py (Pydantic → Java classes)
    │   ├── User.java
    │   ├── ReliefRequest.java
    │   ├── InventoryItem.java
    │   ├── PrologAnalysis.java
    │   └── Booking.java
    │
    ├── dto/                              ← Data Transfer Objects (request/response shapes)
    │   ├── LoginRequest.java
    │   ├── RegisterRequest.java
    │   ├── ReliefRequestCreateDto.java
    │   └── ...
    │
    ├── repository/                       ← Spring Data MongoDB repos (replaces PyMongo)
    │   ├── UserRepository.java
    │   ├── RequestRepository.java
    │   ├── InventoryRepository.java
    │   └── AnalysisRepository.java
    │
    └── security/
        ├── JwtUtil.java                  ← JWT generation & validation
        └── JwtAuthFilter.java            ← Request interceptor (replaces dependencies.py)
```

---

## 5. Key Technology Mappings (FastAPI → Spring Boot)

| FastAPI/Python Concept | Spring Boot/Java Equivalent | Notes |
|---|---|---|
| `BaseModel` (Pydantic) | `@Document` (Spring Data) + DTO classes | Mongo docs are `@Document`, request bodies are DTOs |
| `@router.get(...)` | `@GetMapping(...)` on a `@RestController` | Same concept, different annotation |
| `Depends(get_current_user)` | `@PreAuthorize("hasRole('ADMIN')")` | Spring Security handles this automatically |
| `BackgroundTasks` | `@Async` method or a `TaskExecutor` | Spring's async is cleaner and more robust |
| `PyMongo` direct | `MongoRepository<T, ID>` interface | Spring auto-generates all CRUD methods |
| `bcrypt` (passlib) | `BCryptPasswordEncoder` (Spring Security built-in) | Already included in the dependency |
| `python-jose` (JWT) | `io.jsonwebtoken:jjwt` library | Add to `pom.xml` |
| `CORS middleware` | `@CrossOrigin` or `WebMvcConfigurer` | Configured globally in `SecurityConfig.java` |

---

## 6. Maven Dependencies (`pom.xml`)

```xml
<dependencies>
    <!-- Core Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- MongoDB -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-mongodb</artifactId>
    </dependency>

    <!-- Security (JWT Auth, BCrypt, Role Guards) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- JWT Library -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Validation (replaces Pydantic) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- Lombok (eliminates boilerplate getters/setters) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

## 7. Next.js Frontend Structure

```
frontend/
├── app/                          ← Next.js App Router (replaces src/pages/)
│   ├── layout.tsx                ← Root layout (Navbar, Providers)
│   ├── page.tsx                  ← Public landing / donor board
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── admin/
│   │   │   └── page.tsx          ← Super Admin Dashboard
│   │   ├── gn-officer/
│   │   │   └── page.tsx          ← GN Officer Dashboard
│   │   └── donor/
│   │       └── page.tsx          ← Donor Board
│
├── components/                   ← Same structure as current /src/components/
│   ├── common/
│   ├── donor/
│   ├── gn-officer/
│   └── super-admin/
│
├── lib/
│   ├── api.ts                    ← Replaces api/index.js (typed with TypeScript)
│   ├── auth.ts                   ← JWT handling
│   └── utils.ts                  ← priorityHelpers, etc.
│
├── types/                        ← TypeScript interfaces (the big upgrade)
│   ├── user.ts
│   ├── request.ts
│   ├── inventory.ts
│   └── analysis.ts
│
├── context/
│   └── AuthContext.tsx            ← Same as current AuthContext.jsx, but typed
│
└── middleware.ts                  ← Next.js middleware for protected routes
                                   (replaces ProtectedRoute.jsx)
```

### The TypeScript upgrade in practice

**Before (JavaScript — current code):**
```javascript
// No idea what `request` contains. Runtime crashes possible.
function RequestCard({ request }) {
    return <div>{request.locaiton}</div>; // Typo! No error shown.
}
```

**After (TypeScript — new code):**
```typescript
// types/request.ts
interface ReliefRequest {
    id: string;
    location: string;
    status: "pending" | "approved" | "ongoing" | "completed";
    priorityLevel: "CRITICAL" | "MODERATE" | "LOW";
    items: RequestItem[];
}

// Component is now fully type-safe. The typo above would be a compile error.
function RequestCard({ request }: { request: ReliefRequest }) {
    return <div>{request.locaiton}</div>; // ❌ TypeScript error: "locaiton" does not exist
}
```

---

## 8. Recommended Migration Order

Work in this sequence to avoid getting stuck:

```
Phase 1 — Backend Foundation (Week 1)
  [ ] Create Spring Boot project (Spring Initializr)
  [ ] Configure MongoDB connection (application.properties)
  [ ] Create @Document model classes (User, ReliefRequest, etc.)
  [ ] Create MongoRepository interfaces
  [ ] Implement JWT security (JwtUtil, JwtAuthFilter, SecurityConfig)
  [ ] Implement AuthController (register, login, /me endpoints)

Phase 2 — Core API (Week 2)
  [ ] Implement RequestController + RequestService
  [ ] Implement InventoryController + InventoryService
  [ ] Implement PublicController (public board, stats, bookings)

Phase 3 — AI Service Layer (Week 3)
  [ ] Translate priority_rules.pl → PriorityRulesService.java
  [ ] Translate risk_assessment.pl → RiskAssessmentService.java
  [ ] Translate medicine_kb.pl → MedicineKnowledgeBase.java
  [ ] Wire them together in AnalysisService.java
  [ ] Implement LogicController (/api/logic/analyze/{id})
  [ ] Run async analysis on request submit (@Async)

Phase 4 — Frontend (Week 4)
  [ ] Create Next.js project with TypeScript
  [ ] Define all TypeScript interfaces in /types/
  [ ] Implement typed API client in /lib/api.ts
  [ ] Implement AuthContext and middleware.ts (protected routes)
  [ ] Migrate pages one by one (Login → GN Officer → Admin → Donor)
  [ ] Migrate components, update all prop types

Phase 5 — Polish & Testing
  [ ] Write JUnit 5 unit tests for PriorityRulesService
  [ ] Write integration tests for Auth endpoints
  [ ] Test all role-based access scenarios
  [ ] Verify end-to-end flow (submit request → AI analysis → UI update)
```

---

## 9. Important Concepts You Will Encounter

### Spring Security's Filter Chain
In FastAPI, you had a `dependencies.py` file with a `get_current_user` function. In Spring Boot, this is replaced by a `JwtAuthFilter` — a class that intercepts **every single HTTP request** before it reaches any controller. It reads the `Authorization` header, validates the JWT, and loads the user into a `SecurityContext`. Your controllers then have access to the current user automatically.

### `@Transactional` (replaces manual try/catch in Python)
In your Python routers, you manually handled rollbacks. In Spring Boot, annotating a service method with `@Transactional` means: "If anything inside this method throws an exception, automatically undo all database changes." This is a significant reliability upgrade.

### DTOs vs. `@Document` Models
A common Spring Boot pattern is to **never return your database model directly** from a controller. Instead:
- `@Document` classes map to MongoDB collections (internal use only)
- `DTO` (Data Transfer Object) classes define exactly what JSON gets sent to and from the frontend

This directly replaces Pydantic's `UserRegister` (input DTO) and `UserResponse` (output DTO) pattern.

### Lombok
Add `@Data` to any Java class and Lombok automatically generates all getters, setters, `equals()`, `hashCode()`, and `toString()` methods at compile time. This eliminates 80% of Java's traditional boilerplate and makes your model classes as clean as Python's.

---

## 10. My Final Mentor Opinion

Your plan is sound. The only thing I would add is this: **don't try to build everything at once.** 

Start with getting the backend running with just the Auth endpoints (`/register`, `/login`, `/me`). Once you can issue a JWT from Java and validate it, the rest of the system follows the exact same pattern. The AI service layer in Java will be cleaner and more readable than the subprocess-based Python approach — and much easier to unit test.

The TypeScript frontend is the most immediately satisfying upgrade. The moment you define your `ReliefRequest` interface and the editor starts autocompleting field names across every component, you'll immediately feel the quality-of-life improvement TypeScript provides.

You have a solid academic project. This migration turns it into a professional portfolio piece.

# AURA Platform — Enterprise Security & Workflow Overhaul

## Problem Statement

The current AURA system has **critical security and workflow vulnerabilities** that make it unsuitable for enterprise/production use:

1. **Open Registration Vulnerability**: Anyone can register as a `gn_officer` or `super_admin` and submit fake requests or manipulate inventory — no identity verification exists.
2. **Insufficient Booking Information**: The "Book This Request" confirmation modal shows only the item name — no location, stock levels, or contact details for the requesting officer.
3. **No Donation Verification**: Once a donor books a request, the status flips to `ongoing` with zero confirmation from the admin. GN Officers could misuse donated supplies with no audit trail.
4. **Single-Donor Lock-In**: When one donor books a request, it becomes `ongoing` and no other donor can contribute, even if the first donor can only partially fulfill the need.

---

## User Review Required

> [!IMPORTANT]
> **File Upload Strategy**: The registration form will require document uploads (NIC, GN Officer ID, etc.). We need to decide where to store uploaded files:
> - **Option A (Recommended)**: Store files on the local filesystem in a `uploads/` directory inside the backend, and save the file path in MongoDB. Simple, no external dependency.
> - **Option B**: Use a cloud storage service like AWS S3 or Cloudinary. More scalable but requires external service setup.
> - For this plan, I'll proceed with **Option A** (local filesystem storage) which is simpler and works well for your current scale.

> [!WARNING]
> **Breaking Change — Registration Flow**: After these changes, new `gn_officer` and `donor` registrations will **NOT** be able to log in immediately. They will be in `pending` status until a Super Admin approves them. This is a fundamental behavior change. The `super_admin` role will only be assignable by existing super admins (removed from the public registration form).

> [!IMPORTANT]
> **Existing Users**: All users currently in the database will retain `is_active = true` and won't be affected. Only newly registered users after this change will go through the approval workflow.

## Open Questions

> [!IMPORTANT]
> **Q1**: Should we set a maximum file size for document uploads? I recommend **5MB per file** and **max 3 files** per registration. Please confirm.

> [!IMPORTANT]
> **Q2**: For the partial donation feature — should there be a minimum donation amount (e.g., at least 1 unit), or can a donor donate any quantity they choose? I'll proceed with minimum 1 unit.

> [!IMPORTANT]
> **Q3**: When multiple donors have partially fulfilled a request and the total donated reaches the needed amount, should the request auto-complete, or should the Super Admin still need to manually confirm each donation and mark it complete?

---

## Proposed Changes

The changes are organized into **4 phases** matching the 4 features. Each phase is independent but they share some schema changes.

---

### Phase 1: Secure Registration with Admin Approval

This is the most critical security change. We'll add identity verification fields to registration, hold users in `pending` status, and give Super Admin the power to approve/reject them.

---

#### [MODIFY] [User.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/schema/User.java)

Add new fields to the `User` document for identity verification:

```diff
 public class User {
     @Id
     private String id;
     private String email;
     private String password;
     private String fullName;
     private String role;
+
+    @Field("phone_number")
+    private String phoneNumber;
+
+    private String address;
+
+    @Field("documents")
+    @Builder.Default
+    private List<String> documents = new ArrayList<>();  // File paths to uploaded docs
+
+    @Field("approval_status")
+    @Builder.Default
+    private String approvalStatus = "pending";  // pending, approved, rejected
+
+    @Field("rejection_reason")
+    private String rejectionReason;
+
+    @Field("approved_by")
+    private String approvedBy;  // Admin ID who approved
+
+    @Field("approved_at")
+    private Instant approvedAt;
+
+    @Field("registered_at")
+    private Instant registeredAt;

     @Field("is_active")
     @Builder.Default
-    private boolean isActive = true;
+    private boolean isActive = false;  // Default FALSE — only true after admin approval
 }
```

**Key Design Decision**: `isActive` defaults to `false` for new registrations. Only after admin approval does it become `true`. This provides a security gate at the database level — even if someone bypasses the frontend, the backend will reject their JWT because `isActive == false`.

---

#### [MODIFY] [RegisterRequest.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/dto/RegisterRequest.java)

Expand the registration DTO with new required fields:

```diff
 public class RegisterRequest {
     @NotBlank private String email;
     @NotBlank @Size(min = 6) private String password;
     @NotBlank private String fullName;
+    @NotBlank(message = "Phone number is required")
+    private String phoneNumber;
+    @NotBlank(message = "Address is required")
+    private String address;
     private String role = "donor";
 }
```

> Note: Document file paths are NOT in this DTO — they come from a multipart file upload handled separately.

---

#### [NEW] [FileUploadService.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/service/FileUploadService.java)

New service class to handle document file uploads during registration:

- Validates file type (images: JPEG/PNG, documents: PDF)
- Validates file size (max 5MB per file)
- Stores files in `backend/uploads/documents/{userId}/` directory
- Returns the relative file paths to be stored in the `User.documents` array
- Includes a method to serve files back (for admin review)

---

#### [NEW] [FileController.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/controller/FileController.java)

New controller for file operations:

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/files/upload` | Public | Upload document(s) during registration |
| `GET` | `/api/files/{userId}/{filename}` | Super Admin | View/download uploaded documents |

---

#### [MODIFY] [AuthController.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/controller/AuthController.java)

Change the `/register` endpoint to accept `multipart/form-data` instead of JSON, so it can handle both form fields and file uploads in a single request:

```diff
-    @PostMapping("/register")
-    public UserResponseDto register(@Valid @RequestBody RegisterRequest request) {
-        return authService.register(request);
+    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
+    public UserResponseDto register(
+            @Valid @ModelAttribute RegisterRequest request,
+            @RequestParam(value = "documents", required = false) List<MultipartFile> documents) {
+        return authService.register(request, documents);
     }
```

---

#### [MODIFY] [AuthService.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/service/AuthService.java)

Major changes to both `register()` and `login()`:

**Registration changes:**
- Accept and validate document files
- Save files via `FileUploadService`
- Set `isActive = false` and `approvalStatus = "pending"` for new users
- Remove `super_admin` as a selectable role during public registration
- Store phone number, address, document paths

**Login changes:**
- Add check for `approvalStatus`: if `pending`, throw `403 Forbidden` with message "Your account is pending approval. Please wait for admin verification."
- Add check for `approvalStatus`: if `rejected`, throw `403 Forbidden` with message "Your registration has been rejected. Reason: {rejectionReason}"
- Existing check for `isActive` already prevents deactivated accounts

---

#### [NEW] [AdminUserController.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/controller/AdminUserController.java)

New controller dedicated to admin user management operations:

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/admin/users` | Super Admin | List all users with filters (role, status) |
| `GET` | `/api/admin/users/pending` | Super Admin | List users awaiting approval |
| `GET` | `/api/admin/users/{id}` | Super Admin | Get full user details including documents |
| `POST` | `/api/admin/users/{id}/approve` | Super Admin | Approve a pending user |
| `POST` | `/api/admin/users/{id}/reject` | Super Admin | Reject a pending user with reason |
| `PATCH` | `/api/admin/users/{id}/deactivate` | Super Admin | Deactivate an existing user |

---

#### [NEW] [AdminUserService.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/service/AdminUserService.java)

Service layer for admin user management:

- `getAllUsers(role, approvalStatus)` — filtered user listing
- `getPendingUsers()` — shortcut for pending approvals
- `approveUser(userId, adminId)` — sets `isActive = true`, `approvalStatus = "approved"`, `approvedBy`, `approvedAt`
- `rejectUser(userId, adminId, reason)` — sets `approvalStatus = "rejected"`, `rejectionReason`
- `deactivateUser(userId)` — sets `isActive = false`

---

#### [NEW] [ApprovalActionDto.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/dto/ApprovalActionDto.java)

```java
@Data
public class ApprovalActionDto {
    private String reason; // Required for rejection, optional for approval
}
```

---

#### [MODIFY] [UserResponseDto.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/dto/UserResponseDto.java)

Expand to include the new fields for admin review:

```diff
 public class UserResponseDto {
     private String id;
     private String email;
     private String fullName;
     private String role;
     private boolean isActive;
+    private String phoneNumber;
+    private String address;
+    private List<String> documents;
+    private String approvalStatus;
+    private String rejectionReason;
+    private String approvedBy;
+    private Instant approvedAt;
+    private Instant registeredAt;
 }
```

---

#### [MODIFY] [UserRepository.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/repository/UserRepository.java)

Add new query methods:

```diff
 public interface UserRepository extends MongoRepository<User, String> {
     Optional<User> findByEmail(String email);
     long countByRole(String role);
+    List<User> findByApprovalStatus(String approvalStatus);
+    List<User> findByRoleAndApprovalStatus(String role, String approvalStatus);
+    List<User> findByRole(String role);
+    long countByApprovalStatus(String approvalStatus);
 }
```

---

#### [MODIFY] [SecurityConfig.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/config/SecurityConfig.java)

Update security rules:

```diff
 .authorizeHttpRequests(auth -> auth
     .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
+    .requestMatchers("/api/files/upload").permitAll()  // Registration file upload
     .requestMatchers("/api/public/**").permitAll()
+    .requestMatchers("/api/admin/**").hasRole("SUPER_ADMIN")
+    .requestMatchers("/api/files/**").hasRole("SUPER_ADMIN") // Only admin can view docs
     .requestMatchers("/").permitAll()
     .anyRequest().authenticated()
 )
```

Also add a multipart file size config in `application.properties`:

```properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=15MB
```

---

#### [MODIFY] [LoginPage.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/pages/LoginPage.jsx)

Major updates to the registration form:

1. **Remove `Super Admin`** from the role selector (admins are only created internally)
2. **Add new form fields**:
   - Phone Number (text input with validation)
   - Address (textarea)
   - Document Upload (file input accepting images & PDFs, max 3 files)
3. **Change the registration success behavior**: Instead of "Credentials initialized", show a clear message: "Registration submitted. Your account is pending verification by an administrator. You will be notified once approved."
4. **Handle 403 on login**: If login returns 403 with a pending/rejected message, show it clearly with the appropriate styling

---

#### [MODIFY] [api/index.js](file:///d:/Projects/Project%20AURA/final-project/frontend/src/api/index.js)

Update `registerUser` to use `FormData` (multipart) instead of JSON:

```diff
-export const registerUser = (data) =>
-  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) })
+export const registerUser = (formData) => {
+  const token = localStorage.getItem('aura_token')
+  return fetch(`${BASE_URL}/api/auth/register`, {
+    method: 'POST',
+    headers: token ? { Authorization: `Bearer ${token}` } : {},
+    body: formData, // FormData — browser sets Content-Type automatically with boundary
+  }).then(res => {
+    if (!res.ok) return res.json().then(d => { throw new Error(d.detail || d.message || 'Registration failed') })
+    return res.json()
+  })
+}
```

Add new admin user management API functions:

```javascript
// Admin User Management
export const getAdminUsers = (filters) => apiFetch(`/api/admin/users?${new URLSearchParams(filters)}`)
export const getPendingUsers = () => apiFetch('/api/admin/users/pending')
export const getUserDetails = (id) => apiFetch(`/api/admin/users/${id}`)
export const approveUser = (id) => apiFetch(`/api/admin/users/${id}/approve`, { method: 'POST' })
export const rejectUser = (id, reason) => apiFetch(`/api/admin/users/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
export const deactivateUser = (id) => apiFetch(`/api/admin/users/${id}/deactivate`, { method: 'PATCH' })
```

---

#### [MODIFY] [AdminUsersPage.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/pages/AdminUsersPage.jsx)

Complete overhaul — currently uses **hardcoded mock data**. Changes:

1. **Fetch real user data** from `/api/admin/users` on mount
2. **Add tab filters**: "All Users", "Pending Approval", "GN Officers", "Donors", "Rejected"
3. **Add Pending Approval section** with prominent visual treatment:
   - Show user's name, email, phone number, address, role, registration date
   - Document preview (click to view uploaded NIC/ID images)
   - **Approve** and **Reject** action buttons
   - Reject requires entering a reason
4. **Update the stats strip** with real counts from the API
5. **Update the activity log** with real approval/rejection events

---

### Phase 2: Enhanced Booking Confirmation Modal

Improve the "Book This Request" popup to show comprehensive information about the request and the requesting officer.

---

#### [MODIFY] [Booking.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/schema/Booking.java)

Add new fields to track donation quantities:

```diff
 public class Booking {
     @Id private String id;
     private String requestId;
     private String notes;
     private String donorId;
     private Instant bookedAt;
+
+    @Field("donated_quantity")
+    private Integer donatedQuantity;  // How many units the donor is contributing
+
+    @Field("confirmation_status")
+    @Builder.Default
+    private String confirmationStatus = "pending";  // pending, confirmed, rejected
+
+    @Field("confirmed_by")
+    private String confirmedBy;  // Admin ID who confirmed
+
+    @Field("confirmed_at")
+    private Instant confirmedAt;
+
+    @Field("donor_name")
+    private String donorName;
+
+    @Field("donor_phone")
+    private String donorPhone;
     // ... existing inventory booking fields
 }
```

---

#### [NEW] [RequestDetailDto.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/dto/RequestDetailDto.java)

A rich DTO that the booking modal will use, containing all the information a donor needs:

```java
@Data @Builder
public class RequestDetailDto {
    private String id;
    private String title;
    private String location;
    private String description;
    private String status;
    private String priorityLevel;
    private List<RequestItem> items;
    private String roadStatus;
    private String populationSize;
    private Instant createdAt;

    // Creator (GN Officer / Admin) info
    private String creatorName;
    private String creatorRole;
    private String creatorPhone;

    // Stock summary
    private int totalStockNeeded;
    private int totalAvailableStock;
    private int totalDonatedSoFar;     // Sum of all confirmed/pending donations
    private int remainingNeed;          // stockNeeded - availableStock - donatedSoFar

    // Existing donations on this request
    private List<DonationSummaryDto> donations;
}
```

---

#### [NEW] [DonationSummaryDto.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/dto/DonationSummaryDto.java)

```java
@Data @Builder
public class DonationSummaryDto {
    private String donorName;
    private int quantity;
    private String status;  // pending, confirmed
    private Instant bookedAt;
}
```

---

#### [MODIFY] [PublicController.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/controller/PublicController.java)

Add a new endpoint for fetching rich request details:

```diff
+    /** GET /api/public/request/{id}/details — Rich request info for booking modal */
+    @GetMapping("/request/{id}/details")
+    public RequestDetailDto getRequestDetails(@PathVariable String id) {
+        return publicService.getRequestDetails(id);
+    }
```

---

#### [MODIFY] [PublicService.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/service/PublicService.java)

Add `getRequestDetails(id)` method that:

1. Fetches the `ReliefRequest` document
2. Fetches the creator `User` to get their name, role, and phone number
3. Fetches all `Booking` documents for this request to calculate donated-so-far
4. Computes `remainingNeed = quantityNeeded - currentStock - donatedSoFar`
5. Returns a fully populated `RequestDetailDto`

---

#### [MODIFY] [DonorReliefBoard.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/pages/DonorReliefBoard.jsx)

Completely redesign the booking confirmation modal:

**Current state**: Simple modal with just item name + Confirm/Cancel
**New state**: Rich modal with:

```
┌─────────────────────────────────────────────┐
│             📋 Request Details              │
│                                             │
│  Item: Water Bottles                        │
│  Location: Puttalam                         │
│  Priority: 🔴 CRITICAL                     │
│  Road Status: Blocked                       │
│                                             │
│  ────── Stock Information ──────            │
│  Stock Needed:    300                       │
│  Available Stock: 56                        │
│  Already Donated: 50 (by 2 donors)         │
│  Remaining Need:  194                       │
│                                             │
│  ────── Requesting Officer ──────           │
│  Name: K. Perera (GN Officer)               │
│  Phone: +94 77 123 4567                     │
│                                             │
│  ────── Your Donation ──────                │
│  Quantity: [___________] (max: 194)         │
│                                             │
│  [ Cancel ]              [ Confirm ]        │
└─────────────────────────────────────────────┘
```

- Fetch request details from `/api/public/request/{id}/details` when modal opens
- Add a quantity input field for partial donations
- Show stock breakdown (needed / available / donated / remaining)
- Show creator contact info

---

#### [MODIFY] [api/index.js](file:///d:/Projects/Project%20AURA/final-project/frontend/src/api/index.js)

Add function for fetching request details:

```javascript
export const getRequestDetails = (id) => apiFetch(`/api/public/request/${id}/details`)
```

---

### Phase 3: Admin-Controlled Donation Confirmation

Add a verification layer where donations stay in `pending` status until the Super Admin confirms them, preventing misuse by GN Officers.

---

#### [MODIFY] [BookingCreateDto.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/dto/BookingCreateDto.java)

Add donation quantity:

```diff
 public class BookingCreateDto {
     private String requestId;
     private String notes;
+    @JsonProperty("donated_quantity")
+    private Integer donatedQuantity;
 }
```

---

#### [MODIFY] [PublicService.java — bookRequest()](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/service/PublicService.java)

Major changes to the booking logic:

```diff
 public Booking bookRequest(BookingCreateDto dto, User currentUser) {
     ReliefRequest request = requestRepository.findById(dto.getRequestId())...;

+    // Validate donated quantity
+    int donatedQty = dto.getDonatedQuantity() != null ? dto.getDonatedQuantity() : 1;
+    // Calculate remaining need (total needed - available - already donated)
+    int remaining = calculateRemainingNeed(request);
+    if (donatedQty > remaining || donatedQty < 1) {
+        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid donation quantity");
+    }

     Booking booking = Booking.builder()
         .requestId(dto.getRequestId())
         .notes(dto.getNotes())
         .donorId(currentUser.getId())
+        .donorName(currentUser.getFullName())
+        .donorPhone(currentUser.getPhoneNumber())
+        .donatedQuantity(donatedQty)
+        .confirmationStatus("pending")  // NOT confirmed until admin approves
         .bookedAt(Instant.now())
         .build();

-    // Update request status to "ongoing"
-    request.setStatus("ongoing");
-    requestRepository.save(request);
+    // Do NOT change status to "ongoing" — keep it visible for other donors
+    // Status only changes when admin confirms donations OR total need is met

     return bookingRepository.save(booking);
 }
```

---

#### [NEW] [AdminDonationController.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/controller/AdminDonationController.java)

New controller for admin donation management:

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/admin/donations` | Super Admin | List all donations with filter (pending/confirmed/all) |
| `GET` | `/api/admin/donations/pending` | Super Admin | List pending donations awaiting confirmation |
| `POST` | `/api/admin/donations/{id}/confirm` | Super Admin | Confirm a donation |
| `POST` | `/api/admin/donations/{id}/reject` | Super Admin | Reject a donation |

---

#### [NEW] [AdminDonationService.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/service/AdminDonationService.java)

Service for admin donation management:

- `getPendingDonations()` — list all bookings with `confirmationStatus = "pending"`
- `confirmDonation(bookingId, adminId)`:
  1. Set `confirmationStatus = "confirmed"`, `confirmedBy = adminId`, `confirmedAt = now()`
  2. Recalculate total confirmed donations for the request
  3. If total confirmed donations + available stock ≥ stock needed → auto-update request status to `"ongoing"` or `"completed"`
- `rejectDonation(bookingId, adminId, reason)`:
  1. Set `confirmationStatus = "rejected"`
  2. Free up the donated quantity back into the remaining need pool

---

#### [MODIFY] [BookingRepository.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/repository/BookingRepository.java)

Add new query methods:

```diff
 public interface BookingRepository extends MongoRepository<Booking, String> {
     List<Booking> findByDonorIdOrderByBookedAtDesc(String donorId);
+    List<Booking> findByRequestId(String requestId);
+    List<Booking> findByConfirmationStatus(String confirmationStatus);
+    List<Booking> findByConfirmationStatusOrderByBookedAtDesc(String confirmationStatus);
+    List<Booking> findByRequestIdAndConfirmationStatus(String requestId, String confirmationStatus);
 }
```

---

#### [NEW] [AdminDonationsPage.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/pages/AdminDonationsPage.jsx)

New admin page for managing donations:

- **Pending Donations Tab**: Cards showing each pending donation with:
  - Donor name, phone number
  - Request title, location
  - Donated quantity
  - Date of donation
  - **Confirm** / **Reject** action buttons
- **Confirmed Donations Tab**: History of confirmed donations
- **Stats**: Total pending, confirmed today, total value confirmed

---

#### [MODIFY] [App.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/App.jsx)

Add route for new admin donations page:

```diff
+import AdminDonationsPage from './pages/AdminDonationsPage'
 ...
+            <Route path="/donations" element={
+              <ProtectedRoute allowedRoles={['super_admin']}>
+                <AdminDonationsPage />
+              </ProtectedRoute>
+            } />
```

---

#### [MODIFY] [Sidebar.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/components/common/Sidebar.jsx)

The sidebar nav items are passed as props from each page component. We need to add "Donations" to the admin nav items in the pages that use the sidebar. This will be done in:
- [SuperAdminDashboard.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/pages/SuperAdminDashboard.jsx)
- [AdminRequestsPage.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/pages/AdminRequestsPage.jsx)
- [AdminInventoryPage.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/pages/AdminInventoryPage.jsx)
- [AdminLogisticsPage.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/pages/AdminLogisticsPage.jsx)
- [AdminUsersPage.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/pages/AdminUsersPage.jsx)

Add to each page's navItems array:
```javascript
{ path: '/donations', label: 'Donations', icon: HeartHandshake },
```

---

### Phase 4: Partial Donation Support (Multiple Donors per Request)

Allow multiple donors to contribute to the same request with specific quantities, instead of one donor locking the entire request.

---

#### [MODIFY] [ReliefRequest.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/schema/ReliefRequest.java)

Add a field to track the total donated quantity:

```diff
 public class ReliefRequest {
     // ... existing fields
+    @Field("total_donated")
+    @Builder.Default
+    private int totalDonated = 0;  // Sum of all confirmed donation quantities
 }
```

---

#### [MODIFY] [RequestItem.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/schema/RequestItem.java)

Add a donated quantity tracker at the item level:

```diff
 public class RequestItem {
     private String itemName;
     private String category;
     private int quantity;
     private Integer quantityNeeded;
     private Integer currentStock;
+    @Field("donated_quantity")
+    @Builder.Default
+    private Integer donatedQuantity = 0;  // How much has been donated for this specific item
     private String prologItemKey;
 }
```

---

#### [MODIFY] [RequestCard.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/components/donor/RequestCard.jsx)

Update the donor request card to show stock information:

1. Show **Available Stock**, **Stock Needed**, and **Donated So Far** on each card
2. Show a **progress bar** indicating fulfillment percentage: `(availableStock + donatedSoFar) / stockNeeded`
3. Change the button text based on state:
   - "Book This Request" → if no donations yet
   - "Contribute More" → if partial donations exist
   - "Fully Pledged" (disabled) → if `donatedSoFar + availableStock >= stockNeeded`
4. Remove the `status === 'ongoing'` disabled state — requests stay bookable until fully fulfilled

```
┌────────────────────────────────────┐
│ 🔴 CRITICAL         REQ #d145e9   │
│                                    │
│ Water Bottles                      │
│ 📍 Puttalam                       │
│                                    │
│ ▰▰▰▰▰▰▰░░░░░  56%               │
│ Needed: 300 | Available: 56        │
│ Donated: 112 | Remaining: 132      │
│                                    │
│ 👤 GN Officer K. Perera            │
│                                    │
│ [ Contribute More ]                │
└────────────────────────────────────┘
```

---

#### [MODIFY] [PublicService.java — getBoard()](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/service/PublicService.java)

Update the board query to **NOT filter out `ongoing` requests**. Instead, requests are only hidden when `status === 'completed'`:

```diff
 public List<ReliefRequest> getBoard() {
-    return requestRepository.findByIsPublicTrueOrderByCreatedAtDesc();
+    // Show all public requests that are not completed
+    return requestRepository.findByIsPublicTrueAndStatusNotOrderByCreatedAtDesc("completed");
 }
```

---

#### [MODIFY] [RequestRepository.java](file:///d:/Projects/Project%20AURA/final-project/backend/src/main/java/com/aura/repository/RequestRepository.java)

Add new query:

```diff
 public interface RequestRepository extends MongoRepository<ReliefRequest, String> {
     List<ReliefRequest> findByIsPublicTrueOrderByCreatedAtDesc();
+    List<ReliefRequest> findByIsPublicTrueAndStatusNotOrderByCreatedAtDesc(String status);
     long countByStatus(String status);
 }
```

---

#### [MODIFY] [DonorContributionsPage.jsx](file:///d:/Projects/Project%20AURA/final-project/frontend/src/pages/DonorContributionsPage.jsx)

Update to show the new donation fields:

1. Show `donatedQuantity` for each contribution
2. Show `confirmationStatus` (pending / confirmed / rejected) with appropriate badges
3. Add visual differentiation between pending and confirmed donations

---

## Summary of New/Modified Files

### Backend (Spring Boot + MongoDB)

| Type | File | Change |
|------|------|--------|
| MODIFY | `schema/User.java` | Add phoneNumber, address, documents, approvalStatus, rejectionReason, approvedBy, approvedAt, registeredAt |
| MODIFY | `schema/Booking.java` | Add donatedQuantity, confirmationStatus, confirmedBy, confirmedAt, donorName, donorPhone |
| MODIFY | `schema/ReliefRequest.java` | Add totalDonated field |
| MODIFY | `schema/RequestItem.java` | Add donatedQuantity field |
| MODIFY | `dto/RegisterRequest.java` | Add phoneNumber, address |
| MODIFY | `dto/BookingCreateDto.java` | Add donatedQuantity |
| MODIFY | `dto/UserResponseDto.java` | Add all new user fields |
| NEW | `dto/RequestDetailDto.java` | Rich request details for booking modal |
| NEW | `dto/DonationSummaryDto.java` | Summary of donations on a request |
| NEW | `dto/ApprovalActionDto.java` | Admin approve/reject actions |
| MODIFY | `repository/UserRepository.java` | Add findByApprovalStatus, findByRole queries |
| MODIFY | `repository/BookingRepository.java` | Add findByRequestId, findByConfirmationStatus queries |
| MODIFY | `repository/RequestRepository.java` | Add findByIsPublicTrueAndStatusNot query |
| NEW | `service/FileUploadService.java` | Document upload handling |
| NEW | `service/AdminUserService.java` | Admin user management |
| NEW | `service/AdminDonationService.java` | Admin donation confirmation |
| MODIFY | `service/AuthService.java` | Secure registration + approval-gated login |
| MODIFY | `service/PublicService.java` | Rich request details + partial donation booking |
| NEW | `controller/FileController.java` | File upload/download |
| NEW | `controller/AdminUserController.java` | Admin user management |
| NEW | `controller/AdminDonationController.java` | Admin donation confirmation |
| MODIFY | `controller/AuthController.java` | Multipart registration |
| MODIFY | `controller/PublicController.java` | Add request details endpoint |
| MODIFY | `config/SecurityConfig.java` | New endpoint permissions |
| MODIFY | `application.properties` | File upload limits |

### Frontend (React + Vite + Tailwind)

| Type | File | Change |
|------|------|--------|
| MODIFY | `api/index.js` | FormData registration, admin APIs, request details |
| MODIFY | `pages/LoginPage.jsx` | New registration form with file upload |
| MODIFY | `pages/DonorReliefBoard.jsx` | Enhanced booking modal with quantity + details |
| MODIFY | `pages/AdminUsersPage.jsx` | Real data, pending approvals, approve/reject actions |
| MODIFY | `pages/DonorContributionsPage.jsx` | Show donation quantity + confirmation status |
| NEW | `pages/AdminDonationsPage.jsx` | Admin donation management page |
| MODIFY | `components/donor/RequestCard.jsx` | Progress bar, stock info, partial donation UI |
| MODIFY | `App.jsx` | Add /donations route |
| MODIFY | Multiple admin pages | Add "Donations" to sidebar nav |

### Database (MongoDB)

| Collection | Change |
|------------|--------|
| `users` | Add fields: `phone_number`, `address`, `documents`, `approval_status`, `rejection_reason`, `approved_by`, `approved_at`, `registered_at`. Default `is_active` to `false` |
| `donor_bookings` | Add fields: `donated_quantity`, `confirmation_status`, `confirmed_by`, `confirmed_at`, `donor_name`, `donor_phone` |
| `requests` | Add field: `total_donated` |

---

## Verification Plan

### Automated Tests

```bash
# Run all backend unit tests
cd backend
./mvnw test
```

- Update existing `RequestControllerTest` and `AnalysisServiceTest` for new fields
- Add new test classes:
  - `AdminUserControllerTest` — test approve/reject/list endpoints
  - `AdminDonationControllerTest` — test donation confirmation flow
  - `AuthServiceTest` — test registration with documents, approval-gated login

### Manual Verification

1. **Registration Flow**:
   - Register as a GN Officer with phone, address, and document uploads
   - Verify login is blocked with "pending approval" message
   - Log in as Super Admin → go to User Management → see pending user
   - View uploaded documents → Approve the user
   - Log in as the newly approved GN Officer → verify dashboard access

2. **Booking Modal**:
   - As a donor, click "Book This Request" on any request
   - Verify the modal shows: location, stock needed, available stock, donated so far, creator name + phone
   - Enter a donation quantity and confirm

3. **Donation Confirmation**:
   - After a donor books, verify the donation shows as "pending"
   - Log in as Super Admin → go to Donations page → see pending donation
   - Confirm the donation → verify status updates
   - Check that the donor's contribution page reflects "confirmed"

4. **Partial Donations**:
   - Have Donor A contribute 100 units to a request needing 300
   - Verify the request still shows on the board with updated progress
   - Have Donor B contribute 144 more units
   - Verify progress bar updates and remaining need decreases
   - Once total reaches needed amount, verify request shows "Fully Pledged"

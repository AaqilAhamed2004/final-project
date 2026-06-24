# AURA Platform — Multi-Tenant SaaS, Security Overhaul & Cloudflare R2 Integration

This implementation plan outlines the architecture, database schema, API design, and frontend flow for transitioning AURA into a multi-tenant white-label Platform-as-a-Service (SaaS). 

The key features of this design are:
1. **Multi-Tenancy Isolation**: Each organization (Super Admin) operates in complete isolation with a unique `tenant_id`. All resources (users, requests, bookings, inventory, analyses) are scoped.
2. **Cloudflare R2 Object Storage**: Documents are uploaded securely to R2 and served using timed pre-signed URLs.
3. **Platform Owner Role**: A central system admin role that approves registering organizations (Super Admins) after confirming payments, but cannot view private tenant documents.
4. **Verified Onboarding Flow**: Requesters (formerly GN Officers) and Donors register under their specific organization, staying in a `pending` status until the organization's Super Admin approves them.
5. **Partial Donation Workflow**: Secure confirmation loop where the Super Admin confirms receipt of partial donations before updating status.

---

## 1. System Architecture

```
                                  +-----------------------+
                                  | Central Landing Page  |
                                  | (SaaS Org Sign-up)    |
                                  +-----------+-----------+
                                              |
                                              v
+-------------------------+       +-----------+-----------+       +------------------------+
|      Tenant Domain      |       |  Aura API Gateway /   |       |  Platform Owner Board  |
|  (e.g., charity-a.org)  +------>|     Spring Boot       |<------+  (Manage Orgs, Pay)    |
+-------------------------+       +-----+-----------+-----+       +------------------------+
                                        |           |
                                        v           v
                          +-------------+--+     +--+-------------+
                          | MongoDB Atlas  |     |  Cloudflare R2 |
                          | (aura_db)      |     | (Docs bucket)  |
                          +----------------+     +----------------+
```

### 1.1 Tenant Identification
*   **Authenticated Requests**: The backend resolves the tenant from the authenticated user's `tenantId` (encoded in the JWT claims) to ensure absolute security and prevent cross-tenant spoofing.
*   **Public Requests (Landing / Sign-up / Registration)**: The frontend sends the tenant identifier in a custom request header: `X-Tenant-ID`. The frontend reads this value from a localized environment variable (e.g., `VITE_TENANT_ID` for single-tenant white-label hosting) or detects it dynamically from the URL subdomain/host.

### 1.2 Data Isolation Design
All collections in MongoDB include a `tenant_id` field. We will apply indices on `{ tenant_id: 1 }` and ensure all query operations include this field.

---

## 2. Platform Roles & Onboarding Flows

We define a hierarchical structure with 4 key roles:

```
                  +--------------------------------+
                  |  Platform Owner (Root Admin)   |
                  +---------------+----------------+
                                  |
                                  v
                  +---------------+----------------+
                  |  Organization Super Admin     |
                  +---------------+----------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
+-----------+------------+                  +-----------+------------+
|   Representative       |                  |         Donor          |
| (Formerly GN Officer)  |                  +------------------------+
+------------------------+
```

### Flow 1: Organization Onboarding (Super Admin)
1.  **Register**: The organization's representative goes to the SaaS central landing page and registers the organization. They provide:
    *   Organization Name, Business Registry Number, Email, Password, and contact details.
2.  **State**: The organization is created with status `approvalStatus = "pending"` and `isActive = false`. A unique `tenantId` is generated (format: `TEN-XXXXXXXX`).
3.  **Review & Approve**: The Platform Owner (Root Admin) logs in at `/platform-owner` and reviews pending organizations. After verifying payment/legitimacy, they approve the organization.
4.  **Activation**: Status changes to `approved` and `isActive = true`. The organization's Super Admin can now log in to their dashboard.

### Flow 2: Tenant Representative (GN Officer) & Donor Onboarding
1.  **Registration**: Users register on the organization's dedicated site (single-tenant frontend).
    *   **Donors**: Provide name, email, password, phone, address, and verification document (NIC or Passport).
    *   **Representatives**: Provide name, email, password, phone, address, organization designation, and verification document (NIC + Representative ID card).
2.  **Upload to R2**: The frontend uploads their documents via a multipart registration request. The backend streams these to Cloudflare R2 at path: `documents/{tenantId}/{userId}/{filename}`.
3.  **State**: Users are created with `approvalStatus = "pending"` and `isActive = false` under the tenant.
4.  **Super Admin Review**: The organization's Super Admin reviews users on the "User Management" page.
    *   **Document Preview**: The backend generates secure Cloudflare R2 pre-signed GET URLs valid for 10 minutes so the Super Admin can view the documents.
    *   **Platform Owner Privacy**: The Platform Owner has NO interface or API access to view representative or donor documents.
5.  **Activation**: Upon Super Admin approval, the user's status changes to `approved` and `isActive = true`.

---

## 3. Database Schema Updates

### 3.1 `users` collection
```json
{
  "_id": "ObjectId",
  "tenant_id": "String",
  "email": "String",
  "hashed_password": "String",
  "full_name": "String",
  "role": "String", // "super_admin", "gn_officer", "donor", "platform_owner"
  "phone_number": "String",
  "address": "String",
  "documents": ["String"], // Stores secure R2 file keys
  "approval_status": "String", // "pending", "approved", "rejected"
  "rejection_reason": "String",
  "approved_by": "String", // User ID of approving admin
  "approved_at": "ISODate",
  "registered_at": "ISODate",
  "is_active": "Boolean"
}
```

### 3.2 `requests` collection
```json
{
  "_id": "ObjectId",
  "tenant_id": "String",
  "creator_id": "String",
  "title": "String",
  "description": "String",
  "location": "String",
  "items": [
    {
      "item_name": "String",
      "category": "String",
      "quantity": "Int",
      "quantity_needed": "Int",
      "current_stock": "Int",
      "donated_quantity": "Int",
      "prolog_item_key": "String"
    }
  ],
  "status": "String", // "pending", "approved", "ongoing", "completed"
  "road_status": "String",
  "population_size": "String",
  "is_public": "Boolean",
  "created_at": "ISODate",
  "priority_level": "String",
  "total_donated": "Int"
}
```

### 3.3 `donor_bookings` collection
```json
{
  "_id": "ObjectId",
  "tenant_id": "String",
  "request_id": "String",
  "notes": "String",
  "donor_id": "String",
  "donor_name": "String",
  "donor_phone": "String",
  "donated_quantity": "Int",
  "confirmation_status": "String", // "pending", "confirmed", "rejected"
  "confirmed_by": "String", // Super Admin user ID
  "confirmed_at": "ISODate",
  "booked_at": "ISODate",
  "type": "String", // "donor_booking" or "inventory_booking"
  "item_id": "String",
  "item_name": "String",
  "quantity_booked": "Int"
}
```

### 3.4 `inventory` collection
```json
{
  "_id": "ObjectId",
  "tenant_id": "String",
  "item_name": "String",
  "category": "String",
  "quantity": "Int",
  "prolog_item_key": "String",
  "location": "String"
}
```

### 3.5 `prolog_analysis` collection
```json
{
  "_id": "ObjectId",
  "tenant_id": "String",
  "request_id": "String",
  "priority_level": "String",
  "priority_color": "String",
  "priority_score": "Int",
  "risk_flags": ["String"],
  "analyzed_at": "ISODate"
}
```

---

## 4. Backend (Spring Boot) Implementation Details

### 4.1 Maven Dependencies
Update `pom.xml` to include the AWS SDK for S3-compatible Cloudflare R2 storage:
```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.25.15</version>
</dependency>
```

### 4.2 S3/R2 Configuration
Create a configuration class to initialize the S3 client using Cloudflare R2 credentials:
```java
@Configuration
public class R2Config {
    @Value("${r2.endpoint}")
    private String endpoint;

    @Value("${r2.access-key}")
    private String accessKey;

    @Value("${r2.secret-key}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.US_EAST_1) // Cloudflare R2 requires region set, though bypassed
                .build();
    }
}
```

### 4.3 S3/R2 Service for Document Uploads
```java
@Service
public class CloudflareR2Service {
    @Autowired
    private S3Client s3Client;

    @Value("${r2.bucket-name}")
    private String bucketName;

    public String uploadDocument(String tenantId, String userId, MultipartFile file) throws IOException {
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        String key = String.format("documents/%s/%s/%s-%s", tenantId, userId, UUID.randomUUID(), filename);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        return key;
    }

    public String generatePreSignedUrl(String key) {
        // Generates pre-signed GET URL for document viewing (10 min expiry)
        S3Presigner presigner = S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.US_EAST_1)
                .build();

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .getObjectRequest(getObjectRequest)
                .build();

        return presigner.presignGetObject(presignRequest).url().toString();
    }
}
```

### 4.4 Tenant Thread-Local Scoping
We extract the tenant ID from the custom `X-Tenant-ID` header (for public requests) or from the JWT claims (for authenticated requests) and set it in a thread-local context.

```java
public class TenantContext {
    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public static void setTenantId(String tenantId) {
        currentTenant.set(tenantId);
    }

    public static String getTenantId() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
```

Update `JwtAuthFilter.java` to set the tenant context for authenticated requests:
```java
// Inside filter:
if (user.isActive()) {
    TenantContext.setTenantId(user.getTenantId());
    // ... config authentication context ...
}
```

We will create a `TenantFilter` to intercept public requests and capture the `X-Tenant-ID` header:
```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TenantFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String tenantHeader = httpRequest.getHeader("X-Tenant-ID");
        if (tenantHeader != null) {
            TenantContext.setTenantId(tenantHeader);
        }
        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
```

---

## 5. Platform Owner API Configuration

Create a dedicated controller for Platform Owner management tasks.

### 5.1 Platform Owner Endpoints
These endpoints are secured and accessible only by users with the `PLATFORM_OWNER` role.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/platform/tenants` | Platform Owner | List all tenant organizations with activation status |
| `POST` | `/api/platform/tenants/{tenantId}/approve` | Platform Owner | Approve and activate organization (status -> approved) |
| `POST` | `/api/platform/tenants/{tenantId}/deactivate`| Platform Owner | Deactivate an active organization |

### 5.2 Document Security Rule
The Platform Owner's endpoints do **not** provide options to generate pre-signed document URLs. Document previewing is restricted to `AdminUserController` which requires the `SUPER_ADMIN` role belonging to the exact matching `tenant_id`.

---

## 6. Frontend (Vite + React) Implementation Details

### 6.1 Tenant Scoping Configuration
*   We'll configure the application using environment variables: `VITE_TENANT_ID`.
*   We will update the axios/fetch interceptor in `api/index.js` to automatically attach the header `X-Tenant-ID` to all outgoing API requests.

```javascript
// api/index.js
const VITE_TENANT_ID = import.meta.env.VITE_TENANT_ID || '';

export const apiFetch = async (url, options = {}) => {
  const headers = {
    ...options.headers,
    'X-Tenant-ID': VITE_TENANT_ID,
  };
  
  const token = localStorage.getItem('aura_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ... rest of API fetching wrapper ...
};
```

### 6.2 New Onboarding Landing Pages
1.  **Platform Landing Page (`/saas-signup`)**:
    *   Landing page explaining the AURA Platform for disaster relief management.
    *   Form: Register your Organization (Organization Name, Admin Email, Admin Password, Registry Number).
    *   Login: Sign-in interface for Platform Owner.
2.  **Platform Owner Dashboard (`/platform-owner`)**:
    *   List all registering organizations with details (Name, Registry Number, Date).
    *   Approve / Deactivate buttons.
3.  **Tenant Main Landing Page (`/`)**:
    *   The localized organization landing page.
    *   "Register as Donor" and "Register as Trusted Representative" links.
    *   Includes login modal.
4.  **Register Representative/Donor Forms (`/register`)**:
    *   Document upload input fields (max 3 files, max 5MB).
    *   Files are uploaded as `multipart/form-data` to the backend.

---

## 7. Verification Plan

### 7.1 Automated Unit Tests
We will add/modify tests under `backend/src/test`:
-   `CloudflareR2ServiceTest`: Mocking AWS S3 Client response to verify PUT uploads and signed URL generation.
-   `TenantFilterTest`: Ensuring that requests with `X-Tenant-ID` correctly set the thread-local context.
-   `PlatformOwnerControllerTest`: Authenticating as Root Admin to verify tenant activation/deactivation endpoints.
-   `SecurityConfigTest`: Verification that endpoints for user documents cannot be accessed by other tenants or Platform Owners.

### 7.2 Manual Verification Scenario
1.  **Register Organization**:
    *   Register organization "Red Cross LK" at `/saas-signup`.
    *   Attempt login -> Verify login is blocked.
2.  **Approve Organization**:
    *   Log in as Platform Owner.
    *   Approve "Red Cross LK".
    *   Verify Super Admin for "Red Cross LK" can now log in.
3.  **Tenant Member Sign-up**:
    *   Go to tenant portal. Register a Representative and a Donor uploading NIC/ID card scans.
    *   Verify registration creates a `pending` account.
4.  **Super Admin Approval**:
    *   Super Admin logs in. Navigates to User Management.
    *   Clicks "View Documents". Verify pre-signed URL allows downloading/displaying documents.
    *   Approve Representative and Donor.
5.  **Data Isolation**:
    *   Create a second tenant organization "Heart LK".
    *   Verify "Heart LK" Super Admin cannot see "Red Cross LK" inventory, users, or requests.

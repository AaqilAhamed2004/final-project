# AURA Platform — Production Deployment Guide

> **Version**: 2.0 (Comprehensive)
> **Date**: June 2026

---

## Table of Contents
1. [MongoDB Atlas Setup](#1-mongodb-atlas-setup)
2. [Cloudflare R2 Setup](#2-cloudflare-r2-setup)
3. [Spring Boot Backend Deployment](#3-spring-boot-backend-deployment)
4. [React/Vite Frontend Deployment](#4-reactvite-frontend-deployment)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Pre-Deployment Checklist](#6-pre-deployment-checklist)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. MongoDB Atlas Setup

### 1.1 Create Account & Project

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up with email or Google account
3. On the dashboard, click **New Project**
4. Name: `AURA Platform`
5. Click **Create Project**

### 1.2 Deploy a Database Cluster

1. Click **Build a Database** (or **Create** if you already have clusters)
2. Choose your deployment type:

| Tier | Cost | Use Case |
|------|------|----------|
| **M0 (Free)** | $0/mo | Development & testing (512MB, shared) |
| **M10** | ~$57/mo | Small production (10GB, dedicated) |
| **M20** | ~$140/mo | Medium production (20GB, dedicated) |

3. Select **Cloud Provider**: AWS (recommended for Cloudflare R2 compatibility)
4. Select **Region**: Choose the region closest to your backend server
   - If backend is in Singapore → choose `ap-southeast-1`
   - If backend is in US → choose `us-east-1`
5. Cluster Name: `aura-cluster-0`
6. Click **Create Deployment**
7. Wait 3-5 minutes for cluster provisioning

### 1.3 Create Database User

1. In the left sidebar, click **Database Access**
2. Click **Add New Database User**
3. Authentication Method: **Password**
4. Username: `aura-app-user`
5. Password: Click **Autogenerate Secure Password** → **Copy and save it securely**
6. Database User Privileges: Select **Built-in Role** → `Read and write to any database`
7. Click **Add User**

> [!CAUTION]
> Save the password immediately. You won't be able to see it again. If lost, you'll need to create a new user.

### 1.4 Configure Network Access

1. In the left sidebar, click **Network Access**
2. Click **Add IP Address**

**For Development:**
```
0.0.0.0/0  (Allow access from anywhere)
```
> [!WARNING]
> `0.0.0.0/0` is acceptable for development but **must be restricted** in production.

**For Production:**
```
YOUR_BACKEND_SERVER_IP/32  (Only allow your server)
```
- If using Vercel/Railway/Render, check their docs for static IPs
- Some services (e.g., Railway) require `0.0.0.0/0` because they don't provide static IPs

3. Click **Confirm**

### 1.5 Get Connection String

1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Drivers**
3. Select Driver: **Java** → Version: **5.1 or later**
4. Copy the connection string:
```
mongodb+srv://aura-app-user:<db_password>@aura-cluster-0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=aura-cluster-0
```
5. **Modify the string** — add `/aura_db` before the `?`:
```
mongodb+srv://aura-app-user:YOUR_PASSWORD@aura-cluster-0.xxxxx.mongodb.net/aura_db?retryWrites=true&w=majority&appName=aura-cluster-0
```
6. Replace `YOUR_PASSWORD` with the actual password from Step 1.3

### 1.6 Create Database Indexes

Go to **Database** → Click your cluster name → **Browse Collections** → Select `aura_db` → Open the **Indexes** tab for each collection and create:

Or connect via MongoDB Shell / Compass and run:
```javascript
// Switch to aura_db
use aura_db

// Users collection indexes
db.users.createIndex({ "tenant_id": 1 })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "tenant_id": 1, "approval_status": 1 })
db.users.createIndex({ "tenant_id": 1, "role": 1 })

// Requests collection indexes
db.requests.createIndex({ "tenant_id": 1 })
db.requests.createIndex({ "tenant_id": 1, "is_public": 1, "status": 1 })
db.requests.createIndex({ "tenant_id": 1, "creator_id": 1 })

// Bookings collection indexes
db.donor_bookings.createIndex({ "tenant_id": 1 })
db.donor_bookings.createIndex({ "tenant_id": 1, "confirmation_status": 1 })
db.donor_bookings.createIndex({ "tenant_id": 1, "donor_id": 1 })

// Inventory collection index
db.inventory.createIndex({ "tenant_id": 1 })

// Analysis collection indexes
db.prolog_analysis.createIndex({ "tenant_id": 1 })
db.prolog_analysis.createIndex({ "request_id": 1 }, { unique: true })
```

### 1.7 Seed Platform Owner (First-Time Setup)

Connect via Compass or Shell and insert the Platform Owner user:
```javascript
db.users.insertOne({
    email: "owner@aura-platform.com",
    hashed_password: "$2a$10$...",  // BCrypt hash of your chosen password
    full_name: "Platform Owner",
    role: "platform_owner",
    tenant_id: "PLATFORM",
    is_active: true,
    approval_status: "approved",
    registered_at: new Date()
})
```

To generate the BCrypt hash, use this command:
```bash
# Using Spring Boot's BCryptPasswordEncoder
# Or use an online BCrypt generator (e.g., https://bcrypt-generator.com)
# Password: your_secure_password → Hash: $2a$10$...
```

---

## 2. Cloudflare R2 Setup

### 2.1 Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. In the left sidebar, click **R2 Object Storage**
4. Click **Create Bucket**
5. Bucket name: `aura-documents`
6. Location: **Automatic** (or choose region closest to your backend)
7. Click **Create Bucket**

### 2.2 Create API Token

1. On the R2 page, click **Manage R2 API Tokens** (right side)
2. Click **Create API token**
3. Token name: `aura-backend-rw`
4. Permissions: **Object Read & Write**
5. Specify bucket: Select **Apply to specific buckets only** → Choose `aura-documents`
6. TTL: Leave as default (no expiry) or set based on security policy
7. Click **Create API Token**

> [!CAUTION]
> **Copy all three values immediately. You will NOT see them again:**

| Field | Example Value |
|-------|---------------|
| **Access Key ID** | `a1b2c3d4e5f6g7h8i9j0` |
| **Secret Access Key** | `abc123def456ghi789jkl012mno345pqr678stu` |
| **Endpoint URL** | `https://1234567890abcdef.r2.cloudflarestorage.com` |

### 2.3 Configure Bucket CORS (Optional)

If you need direct browser access to pre-signed URLs, add CORS rules:

1. Go to your bucket → **Settings** → **CORS Policy**
2. Add rule:
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

> Note: Since we're using pre-signed URLs and the backend proxies uploads, CORS is only needed for the browser to load pre-signed GET URLs (document previews).

### 2.4 Verify Bucket Works

Test with AWS CLI (R2 is S3-compatible):
```bash
# Configure AWS CLI with R2 credentials
aws configure --profile r2
# Access Key ID: your R2 access key
# Secret Access Key: your R2 secret key
# Region: auto
# Output format: json

# Test upload
echo "test" > test.txt
aws s3 cp test.txt s3://aura-documents/test.txt \
  --endpoint-url https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com \
  --profile r2

# Test list
aws s3 ls s3://aura-documents/ \
  --endpoint-url https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com \
  --profile r2
```

---

## 3. Spring Boot Backend Deployment

### 3.1 Application Properties

The `application.properties` file should reference environment variables for all secrets:

```properties
spring.application.name=aura-backend
server.port=8000

# MongoDB Atlas
spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/aura_db}

# JWT
aura.jwt.secret=${JWT_SECRET:aura-secret-change-this-to-a-long-random-string-minimum-32-chars}
aura.jwt.expiration-minutes=${JWT_EXPIRATION_MINUTES:480}

# Cloudflare R2
r2.endpoint=${R2_ENDPOINT:https://your-account-id.r2.cloudflarestorage.com}
r2.access-key=${R2_ACCESS_KEY:your-access-key}
r2.secret-key=${R2_SECRET_KEY:your-secret-key}
r2.bucket-name=${R2_BUCKET_NAME:aura-documents}

# File Upload Limits
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=15MB

# Jackson
spring.jackson.property-naming-strategy=SNAKE_CASE
spring.jackson.default-property-inclusion=non_null

# Async
spring.task.execution.pool.core-size=4
spring.task.execution.pool.max-size=8
spring.task.execution.pool.queue-capacity=100
```

### 3.2 Build Production JAR

```bash
cd backend

# Clean build (skip tests for faster build)
./mvnw clean package -DskipTests

# The JAR is at:
# target/aura-backend-0.0.1-SNAPSHOT.jar
```

### 3.3 Run with Environment Variables

```bash
# Set environment variables
export MONGODB_URI="mongodb+srv://aura-app-user:YOUR_PASS@aura-cluster-0.xxxxx.mongodb.net/aura_db?retryWrites=true&w=majority"
export JWT_SECRET="your-super-long-random-secret-at-least-32-characters-long"
export R2_ENDPOINT="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
export R2_ACCESS_KEY="your-r2-access-key"
export R2_SECRET_KEY="your-r2-secret-key"
export R2_BUCKET_NAME="aura-documents"

# Run the server
java -jar target/aura-backend-0.0.1-SNAPSHOT.jar
```

### 3.4 Docker Deployment (Optional)

Create `backend/Dockerfile`:
```dockerfile
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY target/aura-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
cd backend
./mvnw clean package -DskipTests
docker build -t aura-backend .
docker run -p 8000:8000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="..." \
  -e R2_ENDPOINT="..." \
  -e R2_ACCESS_KEY="..." \
  -e R2_SECRET_KEY="..." \
  -e R2_BUCKET_NAME="aura-documents" \
  aura-backend
```

### 3.5 Platform Hosting Options

| Platform | Method | Estimated Cost |
|----------|--------|---------------|
| **Railway** | Push Docker or connect GitHub | $5/mo hobby, $20/mo pro |
| **Render** | Connect GitHub, auto-deploy | Free (spin down), $7/mo always-on |
| **AWS EC2** | Run JAR on t3.micro | $8-15/mo |
| **DigitalOcean Droplet** | Run JAR on basic droplet | $6/mo |
| **Google Cloud Run** | Deploy Docker container | Pay per request |

---

## 4. React/Vite Frontend Deployment

### 4.1 Environment Variables

Create `.env.production` in the `frontend/` root:
```env
VITE_API_URL=https://api.your-domain.com
VITE_TENANT_ID=TEN-XXXXXXXX
```

> [!IMPORTANT]
> **`VITE_TENANT_ID`** is unique per tenant deployment. When you sell the white-label app to Organization A, you deploy a frontend instance with Organization A's tenant ID. Organization B gets a separate deployment with their own ID.

### 4.2 Build for Production

```bash
cd frontend
npm install
npm run build
# Output: dist/ directory with static files
```

### 4.3 Deploy to Vercel

1. Push your `frontend/` code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import Project → Select your repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL` = `https://api.your-domain.com`
   - `VITE_TENANT_ID` = `TEN-XXXXXXXX` (unique per organization)
5. Click **Deploy**

**For each new organization:**
1. Create a new Vercel project (or use Vercel's **Environment Variable overrides per branch**)
2. Set the same `VITE_API_URL` (all orgs share the same backend)
3. Set a different `VITE_TENANT_ID` for each org
4. Optionally configure a custom domain for each org

### 4.4 Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Add Environment Variables in **Site settings** → **Environment variables**
5. Deploy

### 4.5 Deploy to Cloudflare Pages

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Create application** → **Pages**
2. Connect your GitHub repo
3. Configure:
   - **Project name**: `aura-org-a` (or whatever you want)
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
4. Add environment variables (`VITE_API_URL`, `VITE_TENANT_ID`)
5. Deploy

> [!TIP]
> Cloudflare Pages gives you a free `.pages.dev` domain and unlimited bandwidth. Combined with R2 and Workers, it's the most cost-effective option for hosting multiple tenant frontends.

---

## 5. Environment Variables Reference

### Backend (Spring Boot)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/aura_db` | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | `a-very-long-random-string-min-32-chars` | JWT signing secret (min 32 chars) |
| `R2_ENDPOINT` | ✅ | `https://abc123.r2.cloudflarestorage.com` | Cloudflare R2 S3-compatible endpoint |
| `R2_ACCESS_KEY` | ✅ | `your-access-key-id` | R2 API token access key |
| `R2_SECRET_KEY` | ✅ | `your-secret-access-key` | R2 API token secret key |
| `R2_BUCKET_NAME` | ✅ | `aura-documents` | R2 bucket name |
| `JWT_EXPIRATION_MINUTES` | ❌ | `480` | Token expiry (default: 8 hours) |

### Frontend (Vite)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ | `https://api.aura-platform.com` | Backend API URL |
| `VITE_TENANT_ID` | ✅ | `TEN-A1B2C3D4` | Organization's tenant ID |

---

## 6. Pre-Deployment Checklist

```
[ ] MongoDB Atlas cluster created and accessible
[ ] Database user created with read/write permissions
[ ] Network access configured (IP whitelist)
[ ] Connection string tested (connect via Compass)
[ ] Indexes created on all collections
[ ] Platform Owner user seeded in database

[ ] Cloudflare R2 bucket created
[ ] R2 API token created with read/write permissions
[ ] R2 credentials saved securely
[ ] Test upload/download via CLI or code works

[ ] Backend builds successfully: ./mvnw clean package
[ ] All environment variables set on hosting platform
[ ] Backend starts and connects to Atlas (check logs for "MongoDB connected")
[ ] CORS configured to allow frontend origin

[ ] Frontend builds successfully: npm run build
[ ] VITE_API_URL points to correct backend URL
[ ] VITE_TENANT_ID set for each organization
[ ] Frontend deployed and accessible

[ ] End-to-end test: Register → Login → Create Request → Book → Confirm
[ ] Cross-tenant isolation verified
[ ] Document upload to R2 verified
[ ] Pre-signed URL viewing verified
```

---

## 7. Troubleshooting

### MongoDB Atlas Connection Fails
```
com.mongodb.MongoTimeoutException: Timed out after 30000 ms
```
**Fix**: Check Network Access in Atlas. Your backend's IP must be whitelisted. If using a cloud hosting platform, check if they provide static IPs.

### R2 Upload Returns 403 Forbidden
**Fix**: 
1. Verify the API token has **Object Read & Write** permission
2. Verify the token is scoped to the correct bucket
3. Verify the endpoint URL format is correct (no trailing slash)

### CORS Errors in Browser
```
Access-Control-Allow-Origin missing
```
**Fix**: Update `SecurityConfig.java` to include your frontend's production domain in `setAllowedOrigins()`:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "https://org-a.your-domain.com",
    "https://org-b.your-domain.com"
));
```

### JWT Token Invalid After Redeployment
**Fix**: If you change `JWT_SECRET` between deployments, all existing tokens become invalid. Users will need to log in again. Keep the secret consistent across deployments.

### Data Appears in Wrong Database (e.g., "test" instead of "aura_db")
**Fix**: Ensure the database name is specified in the connection URI:
```
mongodb+srv://user:pass@cluster.mongodb.net/aura_db?retryWrites=true
                                                ^^^^^^^^
                                           This is crucial!
```
Use `spring.data.mongodb.uri` (NOT `spring.mongodb.uri`) for Spring Boot 3.x/4.x.

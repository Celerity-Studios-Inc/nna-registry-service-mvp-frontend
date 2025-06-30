# NNA Registry Service API Documentation

This document provides details about the API endpoints available in the NNA Registry Service.

## Base URL

```
http://localhost:3000
```

## Authentication

### Register User

Register a new user and get a JWT token.

**URL:** `/auth/register`
**Method:** `POST`
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:** 
- Status: 201 Created
- Content:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response:**
- Status: 400 Bad Request
- Content:
```json
{
  "statusCode": 400,
  "message": "User already exists with this email",
  "error": "Bad Request"
}
```

### Login

Login with existing credentials and get a JWT token.

**URL:** `/auth/login`
**Method:** `POST`
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:** 
- Status: 200 OK
- Content:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response:**
- Status: 401 Unauthorized
- Content:
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Get User Profile

Get the profile of the authenticated user.

**URL:** `/auth/profile`
**Method:** `GET`
**Auth Required:** Yes (JWT Token)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response:** 
- Status: 200 OK
- Content:
```json
{
  "_id": "userId",
  "email": "user@example.com",
  "role": "user"
}
```

**Error Response:**
- Status: 401 Unauthorized
- Content:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Make User Admin

Promote a user to admin role (admin only).

**URL:** `/auth/make-admin`
**Method:** `POST`
**Auth Required:** Yes (JWT Token with admin role)

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response:** 
- Status: 200 OK
- Content:
```json
{
  "_id": "userId",
  "email": "user@example.com",
  "role": "admin"
}
```

**Error Response:**
- Status: 401 Unauthorized
- Content:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Assets

### Create Asset

Register a new asset with file upload.

**URL:** `/assets`
**Method:** `POST`
**Auth Required:** Yes (JWT Token)
**Content-Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Form Data:**
- `file`: Binary file data
- `data`: JSON string with asset details
```json
{
  "layer": "G",
  "category": "POP",
  "subcategory": "TSW",
  "source": "ReViz",
  "tags": ["pop", "taylor swift"],
  "description": "A pop song by Taylor Swift"
}
```

**Success Response:** 
- Status: 201 Created
- Content:
```json
{
  "_id": "assetId",
  "layer": "G",
  "category": "POP",
  "subcategory": "TSW",
  "name": "G-POP-TSW-001",
  "nna_address": "G.POP.TSW.001",
  "gcpStorageUrl": "https://storage.googleapis.com/bucket/G/POP/TSW/file.mp3",
  "source": "ReViz",
  "tags": ["pop", "taylor swift"],
  "description": "A pop song by Taylor Swift",
  "registered_by": "user@example.com",
  "createdAt": "2023-04-10T12:00:00.000Z",
  "updatedAt": "2023-04-10T12:00:00.000Z"
}
```

### Get Asset By Name

Retrieve asset details by Human-Friendly Name.

**URL:** `/assets/:name`
**Method:** `GET`
**Auth Required:** Yes (JWT Token)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
- `name`: The Human-Friendly Name of the asset (e.g., `G-POP-TSW-001`)

**Success Response:** 
- Status: 200 OK
- Content: (Same as Create Asset response)

**Error Response:**
- Status: 404 Not Found
- Content:
```json
{
  "statusCode": 404,
  "message": "Asset not found: G-POP-TSW-001",
  "error": "Not Found"
}
```

### Search Assets

Search for assets with filters and pagination.

**URL:** `/assets`
**Method:** `GET`
**Auth Required:** Yes (JWT Token)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `layer`: Filter by layer (optional)
- `category`: Filter by category (optional)
- `subcategory`: Filter by subcategory (optional)
- `search`: Text search in asset properties (optional)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 10)

**Success Response:** 
- Status: 200 OK
- Content:
```json
{
  "assets": [
    {
      "_id": "assetId1",
      "name": "G-POP-TSW-001",
      "nna_address": "G.POP.TSW.001",
      "layer": "G",
      "category": "POP",
      "subcategory": "TSW",
      "gcpStorageUrl": "https://storage.googleapis.com/bucket/G/POP/TSW/file1.mp3",
      "source": "ReViz",
      "tags": ["pop", "taylor swift"],
      "description": "A pop song by Taylor Swift"
    },
    {
      "_id": "assetId2",
      "name": "G-POP-TSW-002",
      "nna_address": "G.POP.TSW.002",
      "layer": "G",
      "category": "POP",
      "subcategory": "TSW",
      "gcpStorageUrl": "https://storage.googleapis.com/bucket/G/POP/TSW/file2.mp3",
      "source": "ReViz",
      "tags": ["pop", "taylor swift"],
      "description": "Another Taylor Swift pop song"
    }
  ],
  "totalAssets": 5,
  "totalPages": 1,
  "currentPage": 1
}
```

### Update Asset

Update an existing asset's metadata.

**URL:** `/assets/:name`
**Method:** `PUT`
**Auth Required:** Yes (JWT Token)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters:**
- `name`: The Human-Friendly Name of the asset (e.g., `G-POP-TSW-001`)

**Request Body:**
```json
{
  "source": "Updated Source",
  "tags": ["updated", "tags"],
  "description": "Updated description"
}
```

**Success Response:** 
- Status: 200 OK
- Content: Updated asset object

### Delete Asset

Delete an asset (admin only).

**URL:** `/assets/:name`
**Method:** `DELETE`
**Auth Required:** Yes (JWT Token with admin role)

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**URL Parameters:**
- `name`: The Human-Friendly Name of the asset (e.g., `G-POP-TSW-001`)

**Success Response:** 
- Status: 200 OK
- Content:
```json
{
  "message": "Asset deleted successfully"
}
```

### Curate Asset

Curate an asset (admin only).

**URL:** `/assets/:name/curate`
**Method:** `PUT`
**Auth Required:** Yes (JWT Token with admin role)

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**URL Parameters:**
- `name`: The Human-Friendly Name of the asset (e.g., `G-POP-TSW-001`)

**Success Response:** 
- Status: 200 OK
- Content: Curated asset object

## Taxonomy

### Validate Taxonomy

Validate a taxonomy combination.

**URL:** `/taxonomy/validate`
**Method:** `POST`
**Auth Required:** Yes (JWT Token)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "layer": "G",
  "category": "POP",
  "subcategory": "TSW"
}
```

**Success Response:** 
- Status: 200 OK
- Content:
```json
{
  "valid": true
}
```

**Error Response:**
- Status: 400 Bad Request
- Content:
```json
{
  "statusCode": 400,
  "message": "Invalid taxonomy: Layer 'X' not found in taxonomy",
  "error": "Bad Request"
}
```

### Get Taxonomy Layers

Get all available taxonomy layers.

**URL:** `/taxonomy/layers`
**Method:** `GET`
**Auth Required:** Yes (JWT Token)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response:** 
- Status: 200 OK
- Content:
```json
{
  "layers": ["G", "S", "L", "M", "W"]
}
```

## Storage

### Generate Signed URL

Generate a signed URL for direct upload to Google Cloud Storage.

**URL:** `/storage/signed-url`
**Method:** `GET`
**Auth Required:** Yes (JWT Token)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `fileName`: Name of the file to upload
- `contentType`: MIME type of the file

**Success Response:** 
- Status: 200 OK
- Content:
```json
{
  "url": "https://storage.googleapis.com/bucket/path/to/file?X-Goog-Algorithm=...",
  "expiresAt": "2023-04-10T14:00:00.000Z"
}
```
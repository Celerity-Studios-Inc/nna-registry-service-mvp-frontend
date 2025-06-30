# NNA Framework API Specification v1.0.4

**Document Version**: 1.0.4

**Last Updated**: April 6, 2025

**Previous Update**: March 25, 2025

**Status**: Draft

**Document Type**: WhitePaper/API Spec/Implementation Guide/Integration Guide

### Changelog

- **v1.0.4 (2025-04-06)**
    - Updated [Section 1.2.2 - Key Concepts](#section-1.2.2-key-concepts) to include new layers (Audio Effects (E), Transitions (N), Augmented Reality (A), Filters (F), Text (X)) and enhanced Moves (M) layer with biomechanical and cultural classifications. Updated asset addressing format to include `[Version]` suffix.
    - Updated [Section 1.5 - API Summary](#section-1.5-api-summary) to add endpoints for managing new layers (e.g., `/v1/asset/moves/tutorial/{asset_id}`) and updated rate limits for scalability (e.g., increased `/v1/asset/resolve` to 2000/min).
    - Updated [Section 3.1.1 - Single Asset Resolution](#section-3.1.1-single-asset-resolution) to include metadata fields for new layers (e.g., `Font_Style` for Text layer) and enhanced Moves layer (e.g., `Movement_Speed`, `Tutorial_Link`) in the response format.
    - Updated [Section 3.1.2 - Batch Asset Resolution](#section-3.1.2-batch-asset-resolution) to include examples of new layer assets (e.g., Text, AR) and Moves layer metadata in the response format.
    - Updated [Section 3.1.3 - Example Workflow: Music Video Creation](#section-3.1.3-example-workflow-music-video-creation) to include new layers in the composition creation step and demonstrate Moves tutorial video access.
    - Updated [Section 3.1.4 - Asset Search API](#section-3.1.4-asset-search-api) to add filters for new layers (e.g., `Font_Style`) and Moves metadata (e.g., `Movement_Speed`, `Cultural_Origin`), with updated response examples.
    - Updated [Section 3.2.1 - Create Composite Asset](#section-3.2.1-create-composite-asset) to include new layers in the `components` object and updated validation logic for compatibility.
    - Updated [Section 3.3.1 - Rights Verification](#section-3.3.1-rights-verification) to include rights metadata for new layers and Moves layer in the response schema.
    - Updated [Section 11.7.4 - Webhook Event Types](#section-11.7.4-webhook-event-types) to add event categories and types for new layers (e.g., `text.added`) and Moves layer (e.g., `moves.tutorial.updated`).
- **v1.0.3 (2025-03-25)**
    - Completed [Section 3.3.2 - Grant Rights](#section-3.3.2-grant-rights) with implementation example.
    - Streamlined [Section 6.1 - AlgoRhythm AI Integration](#section-6.1-algorhythm-ai-integration) to reference [AlgoRhythm, Section 4](https://algorhythm.md#section-4).
    - Expanded [Section 9.5 - Developer FAQ](#section-9.5-developer-faq) with setup troubleshooting.
- **v1.0.2 (2025-02-23)**
    - Consolidated authentication with examples and error handling.
    - Added Quick Start Guide and improved SDK installation instructions.
    - Standardized error codes with NNA_ prefix and added recovery guidance.
- **v1.0.1 (2025-02-08)**
    - Added batch rights granting (POST /v1/rights/grant/batch).
    - Fixed WebSocket reconnection logic.
    - Improved error code consistency (NNA_ prefix).

### Related Documents:

1. [ReViz NNA Framework WhitePaper](https://celerity.slab.com/posts/nna-framework-whitepaper-0jsj4gsl)
    - System architecture overview
    - Core concepts and principles
1. [NNA Framework API Specification](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa)
    - Detailed API documentation
    - Integration guidelines
1. [NNA Framework Implementation](https://celerity.slab.com/posts/nna-framework-technical-implementation-xfxe04qg)
    - Technical implementation details
    - Best practices and examples
1. [ALGORHYTHM AI-Recommendation Engine](https://celerity.slab.com/posts/a-l-g-o-r-h-y-t-h-m-4w561767)
    - AI/ML integration points
    - Performance optimization
1. [CLEARITY Rights Management](https://celerity.slab.com/posts/clearity-rights-clearance-platform-8ft1v300)
    - Rights management integration
    - Compliance requirements
    - 

## Table of Contents

1. [ Introduction](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#h46p5-1-introduction)
1. [Authentication and Security](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#h1olq-2-authentication-and-security)
1. [Core APIs](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#hrh8i-3-core-ap-is)
1. [Real-time Communication](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#hs2lg-4-web-socket-api)
1. [Advanced Features](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#hc7sz-5-advanced-features)
1. [Integration Guidelines](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#hebkb-6-integration-guidelines)
1. [SDKs and Tools](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#ho3ax-7-sd-ks-and-tools)
1. [Monitoring and Observability](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#h79a8-8-monitoring-and-observability)
1. [Error Handling](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#h3pg2-9-error-handling)
1. [Cache Control and Rate Limiting](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#h3l82-10-cache-control-and-rate-limiting)
1. [Migration and Updates](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#h7j53-11-migration-and-updates)
1. [Cross-Document Index](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#h1b9e-12-cross-document-index)
1. [Appendices](https://celerity.slab.com/posts/nna-framework-api-specification-1fupkzwa#hm2v4-appendices)

# 1. Introduction

## 1.1 Overview

The NNA Framework API (v1.0.2) provides a comprehensive interface for managing layered assets, enabling developers to create, resolve, and remix multimedia content efficiently. This API specification defines the standard interfaces, protocols, and patterns for interacting with the NNA Framework.

### Key Features

- RESTful endpoints for asset management
- Real-time WebSocket updates
- Robust authentication (OAuth 2.0, JWT, API Keys)
- Advanced rights management
- Three-tier caching system
- Comprehensive rate limiting

### Target Use Cases

- Content creation platforms
- AI-powered recommendation systems
- Digital rights management
- Cross-platform content delivery

## 1.2 Getting Started

### 1.2.1 Quick Start Guide

Get up and running with these steps:

1. **Obtain API Credentials**
1. Register at [reviz.studio/developer](https://reviz.studio/developer) to get your API key.

```bash
curl -X POST https://reviz.studio/developer/register \
  -H "Content-Type: application/json" \
  -d '{"email": "developer@example.com"}'
```

1. **Install SDK**

```bash
npm install @reviz/nna-sdk  # JavaScript/TypeScript
pip install nna-framework    # Python
```

1. **Resolve an Asset**

```javascript
const { NNAClient } = require('@reviz/nna-sdk');
const client = new NNAClient({ apiKey: 'YOUR_API_KEY' });
async function resolveAsset() {
    const asset = await client.asset.resolve('S.01.01.001');
    console.log(asset.data);
}
resolveAsset();
```

For a broader onboarding overview, see [Section 1.4 - Getting Started Overview](#new-subsection-1.4). Full setup details are in the [Implementation Guide, Section 1.6](#new-subsection-1.6).

### 1.2.2 Key Concepts

1. **Asset Addressing**
1. The NNA Framework implements a dual addressing system:
- **Human-Friendly Names**: User-facing identifiers using alphabetic codes
    - **Format**: `[Layer].[CategoryCode].[SubCategoryCode].[Sequential].[Type].[Version]`
    - **Example**: `G.POP.TSW.001.mp3.v1` (Song layer, Pop category, Taylor Swift Works subcategory, version 1)
- **NNA Addresses**: System-level identifiers using numeric codes
    - **Format**: `[Layer].[CategoryNum].[SubCategoryNum].[Sequential].[Type].[Version]`
    - **Example**: `G.003.042.001.mp3.v1` (Song layer, category 003, subcategory 042, version 1)
- Both formats are supported in all API endpoints, with automatic conversion handled by the resolution service.
1. **Layer Types: Asset Layer Hierarchy**

├── Song (G)

├── Star (S)

├── Look (L)

├── Moves (M)

├── World (W)

├── Vibe (V)

├── Branded (B)

├── Personalize (P)

├── Training_Data (T)

├── Composites (C)

├── Rights (R)

├── Audio Effects (E)

├── Transitions (N)

├── Augmented Reality (A)

├── Filters (F)

├── Text (X)

3. **Composite Assets**

- Combination of multiple layers
- Generated through layer composition
- Real-time preview capabilities

## 1.3 API Conventions

### 1.3.1 Request Format

- Base URL: `https://api.reviz.studio/v1`
- Content-Type: `application/json`
- Authentication: Bearer token or API key

### 1.3.2 Response Format

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "metadata": {
    "timestamp": "2025-02-23T10:00:00Z",
    "request_id": "req_abc123",
    "version": "1.0.2"
  }
}
```

### 1.3.3 Standard Headers

```
X-Request-ID: req_abc123
X-API-Version: 1.0.2
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 1.4 Getting Started Overview

Begin using the NNA Framework with these resources tailored for developers and integration partners:

- **Conceptual Overview**: Learn the basics in the [Whitepaper, Section 2 - Introduction](#hewv8-2-introduction) for system context.
- **Practical Setup**: Follow the [Implementation Guide, Section 1.6 - Quick Start](#new-subsection-1.6) to set up a local environment.
- **API Integration**: Use the [API Specification, Section 1.2 - Getting Started](#h46p5-1-introduction) for SDK installation and basic usage examples.

Example: Resolve an asset after setup:

```javascript
const { NNAClient } = require('@reviz/nna-sdk');
const client = new NNAClient({ apiKey: 'YOUR_API_KEY' });
const asset = await client.asset.resolve('S.01.01.001');
console.log(asset.data);
```

## 1.5 API Summary

The NNA Framework provides the following API endpoints, organized by functional area:

### 1.5.1 Asset Management

| **Endpoint** | **Method** | **Description** | **Rate Limit** | **Authentication** |
| --- | --- | --- | --- | --- |
| `/v1/asset/resolve/{asset_id}` | GET | Resolve an individual asset by its NNA address | 2000/min | Required |
| `/v1/asset/batch/resolve` | POST | Resolve multiple assets in a single request | 500/min | Required |
| `/v1/asset/search` | GET | Search for assets using various criteria | 1000/min | Required |
| `/v1/asset/moves/tutorial/{asset_id}` | GET | Retrieve tutorial video for a Moves asset | 1000/min | Required |

### 1.5.2 Composition Management

| **Endpoint** | **Method** | **Description** | **Rate Limit** | **Authentication** |
| --- | --- | --- | --- | --- |
| `/v1/composition/create` | POST | Create a new composite asset with support for new layers (E, N, A, F, X) | 1000/min | Required |
| `/v1/composition/{composite_id}/status` | GET | Get current status of a composite asset | 2000/min | Required |
| `/v1/composition/{composite_id}` | PATCH | Update an existing composite asset | 1000/min | Required |
| `/v1/composition/{composite_id}` | DELETE | Delete a composite asset | 500/min | Required |
| `/v1/composition/list` | GET | List compositions created by a user | 600/min | Required |

### 1.5.3 Rights Management

| **Endpoint** | **Method** | **Description** | **Rate Limit** | **Authentication** |
| --- | --- | --- | --- | --- |
| `/v1/rights/verify/{asset_id}` | GET | Verify usage rights for an asset | 4000/min | Required |
| `/v1/rights/grant` | POST | Grant usage rights for an asset | 200/min | Required |
| `/v1/rights/{grant_id}` | DELETE | Revoke previously granted rights | 200/min | Required (Admin) |
| `/v1/rights/user/{user_id}` | GET | List rights granted to a user | 400/min | Required |
| `/v1/rights/grant/batch` | POST | Grant rights to multiple assets/users | 100/min | Required (Admin) |

### 1.5.4 Webhook Management

| **Endpoint** | **Method** | **Description** | **Rate Limit** | **Authentication** |
| --- | --- | --- | --- | --- |
| `/v1/webhooks/create` | POST | Register a new webhook endpoint | 200/min | Required |
| `/v1/webhooks/{webhook_id}` | GET | Get webhook details | 400/min | Required |
| `/v1/webhooks/{webhook_id}` | DELETE | Delete a webhook | 200/min | Required |

### 1.5.5 Analytics

| **Endpoint** | **Method** | **Description** | **Rate Limit** | **Authentication** |
| --- | --- | --- | --- | --- |
| `/v1/analytics/compositions` | GET | Get analytics data for compositions | 400/min | Required |

## 1.6 Interactive API Explorer

The NNA Framework provides an interactive API explorer to help developers understand and test API endpoints in real-time. This tool is available at `https://api.reviz.studio/explorer`.

### 1.6.1 Explorer Features

- Interactive endpoint documentation with request/response examples
- Authentication token management
- Request builder with parameter validation
- Response visualization
- API request history
- Shareable request links

### 1.6.2 Using the API Explorer

To use the API Explorer:

1. Navigate to `https://api.reviz.studio/explorer`
1. Authenticate using your API credentials
1. Select an endpoint from the navigation panel
1. Configure request parameters
1. Execute the request
1. View and analyze the response

### 1.6.3 OpenAPI Specification

The NNA API conforms to the OpenAPI 3.0 specification. The complete specification is available at:

- `https://api.reviz.studio/openapi.json` (JSON format)
- `https://api.reviz.studio/openapi.yaml` (YAML format)

You can import this specification into tools like Postman, Insomnia, or SwaggerUI for local testing and integration.

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "NNA Framework API",
    "version": "1.0.2",
    "description": "API for the NNA Framework"
  },
  "servers": [
    {
      "url": "https://api.reviz.studio/v1",
      "description": "Production API"
    },
    {
      "url": "https://api-sandbox.reviz.studio/v1",
      "description": "Sandbox API"
    }
  ],
  "paths": {
    "/asset/resolve/{asset_id}": {
      "get": {
        "summary": "Resolve asset by ID",
        "parameters": [
          {
            "name": "asset_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "description": "Asset ID to resolve"
          }
        ],
        "responses": {
          "200": {
            "description": "Asset resolved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AssetResponse"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## 1.7 Asset Resolution: Multi-language Code Examples

### 1.7.1 Python Example

```python
import requests

def resolve_asset(asset_id, api_key):
    """Resolve an asset by ID using the NNA API."""
    url = f"https://api.reviz.studio/v1/asset/resolve/{asset_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error resolving asset: {response.status_code}")

# Usage
api_key = "YOUR_API_KEY"
asset = resolve_asset("S.01.01.001", api_key)
print(f"Asset resolved: {asset['data']['friendly_name']}")
```

### 1.7.2 JavaScript / TypeScript Example

```javascript
async function resolveAsset(assetId, apiKey) {
  const url = `https://api.reviz.studio/v1/asset/resolve/${assetId}`;
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to resolve asset: ${error.message}`);
    throw error;
  }
}

// Usage
const apiKey = "YOUR_API_KEY";
resolveAsset("S.01.01.001", apiKey)
  .then(asset => console.log(`Asset resolved: ${asset.data.friendly_name}`))
  .catch(error => console.error(error));
```

### 1.7.3 Java Example

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;

public class AssetResolver {
    private final HttpClient client = HttpClient.newHttpClient();
    private final String apiKey;
    
    public AssetResolver(String apiKey) {
        this.apiKey = apiKey;
    }
    
    public String resolveAsset(String assetId) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.reviz.studio/v1/asset/resolve/" + assetId))
            .header("Authorization", "Bearer " + apiKey)
            .GET()
            .build();
            
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to resolve asset: " + response.statusCode());
        }
        
        return response.body();
    }
    
    public static void main(String[] args) {
        try {
            AssetResolver resolver = new AssetResolver("YOUR_API_KEY");
            String result = resolver.resolveAsset("S.01.01.001");
            System.out.println("Asset resolved: " + result);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 1.7.4 Go Example

```go
package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

type AssetResponse struct {
    Success bool       `json:"success"`
    Data    AssetData  `json:"data"`
}

type AssetData struct {
    AssetID      string `json:"asset_id"`
    FriendlyName string `json:"friendly_name"`
    // Other fields...
}

func resolveAsset(assetID, apiKey string) (*AssetResponse, error) {
    url := fmt.Sprintf("https://api.reviz.studio/v1/asset/resolve/%s", assetID)
    
    client := &http.Client{}
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, err
    }
    
    req.Header.Add("Authorization", "Bearer "+apiKey)
    
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != 200 {
        return nil, fmt.Errorf("error resolving asset: %d", resp.StatusCode)
    }
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }
    
    var assetResp AssetResponse
    err = json.Unmarshal(body, &assetResp)
    if err != nil {
        return nil, err
    }
    
    return &assetResp, nil
}

func main() {
    apiKey := "YOUR_API_KEY"
    asset, err := resolveAsset("S.01.01.001", apiKey)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    
    fmt.Printf("Asset resolved: %s\n", asset.Data.FriendlyName)
}
```

### 1

### 

## 

## 1.8 Changelog Summary

Track the NNA Framework API’s evolution:

- **v1.0.2 (2025-02-23)**:
    - Added tutorials: Real-time Remix (Section 3.4), Webhook Integration (Section 4.4).
    - Enhanced error recovery with circuit breaker (Section 9.3).
    - Introduced Developer FAQ (Section 9.5) and Testing Guide (Section 11.6).
- **v1.0.1 (2025-02-08)**:
    - Added batch rights granting (`POST /v1/rights/grant/batch`, Section 3.3.2).
    - Fixed WebSocket reconnection logic (Section 4.1).
    - Standardized error codes with `NNA_` prefix (Section 9.1).
- **v1.0.0 (Initial Release)**:
    - Core asset management and composition APIs (Section 3).
    - OAuth 2.0, JWT, and API key auth (Section 2).

See [Section 11 - Migration and Updates](#11-migration-and-updates) for detailed migration paths and [Whitepaper, Section 10.2 - Version Control](#10-documentation-standards) for versioning policy.

# 2. Authentication and Security

The NNA API supports multiple authentication methods tailored to different use cases. OAuth 2.0 authentication is recommended for third-party integrations, while JWT-based token validation ensures secure communication between ReViz NNA components. API keys provide long-lived access for backend services, but they should be rotated regularly and scoped to minimal permissions.

## 2.1 Authentication Service

The NNA Framework implements a comprehensive security model with three authentication methods optimized for different integration scenarios:

### 2.1.1 Authentication Methods

| **Method** | **Use Case** | **Lifetime** | **Access Level** | **Refresh Required** |
| --- | --- | --- | --- | --- |
| API Key | Server-to-server integrations | Long-lived (90 days) | Full access with scope limitations | No |
| JWT | Client applications | 1 hour | Granular permission-based | Yes |
| OAuth 2.0 | Third-party integrations | Token-based | Scoped with consent | Yes |

### 2.1.2 Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthService
    participant NNAFramework

    Client->>AuthService: Request Token
    AuthService-->>Client: Issue JWT/OAuth Token
    Client->>NNAFramework: API Request with Token
    NNAFramework->>AuthService: Validate Token
    AuthService-->>NNAFramework: Token Valid
    NNAFramework-->>Client: Access Granted
```

### 2.1.3 Implementation Example

```javascript
// Obtain OAuth token
async function getOAuthToken(clientId, clientSecret) {
    const response = await fetch('https://auth.reviz.studio/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        })
    });
    
    const data = await response.json();
    return data.access_token;
}

// Use token with API
async function fetchAsset(assetId, token) {
    const response = await fetch(`https://api.reviz.studio/v1/asset/resolve/${assetId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return response.json();
}
```

All tokens include appropriate TTL values, with JWTs expiring after 1 hour and requiring refresh through the `/v1/auth/refresh` endpoint.

### 2.1.4 Authentication Methods Overview

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> TokenRequest: Request Token
    
    state TokenRequest {
        [*] --> ValidateCredentials
        ValidateCredentials --> GenerateToken
        GenerateToken --> StoreToken
        StoreToken --> [*]
    }
    
    TokenRequest --> Authenticated: Valid Credentials
    Authenticated --> APIAccess: Token Verification
    
    state APIAccess {
        [*] --> CheckPermissions
        CheckPermissions --> AllowAccess
        CheckPermissions --> DenyAccess
    }
    
    APIAccess --> ResourceAccess: Permissions Verified
    ResourceAccess --> [*]
    
    Authenticated --> TokenRefresh: Expire Near
    TokenRefresh --> Authenticated
    
    Authenticated --> [*]: Logout/Expire
```

### 

### 2.1.5 Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Auth
    participant API
    
    Client->>Auth: Request Authentication
    Auth-->>Client: Issue Token
    Client->>API: Request with Token
    API-->>Client: Response
    
    Note over Client,API: Token included in Authorization header
```

**Authentication Flow:**

1. Client requests token from AuthService.
1. AuthService issues JWT/OAuth token.
1. Client sends API request with token.
1. NNA Framework validates token with AuthService.
1. Access granted if valid.

### 2.1.6 API Key Authentication

**Scopes**: `asset.read`, `asset.write`, `asset.manage`, `cache.manage`, `preview.generate`.

```
Authorization: ApiKey YOUR_API_KEY
```

Example implementation:

```typescript
class APIKeyAuthenticator {
    async authenticate(apiKey: string): Promise<AuthResult> {
        const hashedKey = await this.hashKey(apiKey);
        const keyDetails = await this.validateKey(hashedKey);
        
        if (!keyDetails.active) {
            throw new InvalidKeyError('API key is inactive or invalid');
        }
        
        return {
            authenticated: true,
            permissions: keyDetails.permissions,
            rateLimit: keyDetails.rateLimit
        };
    }
}
```

### 2.1.7 JWT Authentication

```typescript
class JWTAuthenticator {
    async issueToken(credentials: Credentials): Promise<string> {
        const user = await this.validateCredentials(credentials);
        
        return jwt.sign(
            {
                uid: user.id,
                scope: user.permissions,
                exp: Date.now() + 3600000 // 1 hour
            },
            process.env.JWT_SECRET
        );
    }

    async validateToken(token: string): Promise<TokenValidation> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return {
                valid: true,
                user: decoded.uid,
                permissions: decoded.scope
            };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthError('Token expired', 'TOKEN_EXPIRED');
            }
            throw new AuthError('Invalid token', 'TOKEN_INVALID');
        }
    }
}
```

### 2.1.8 OAuth 2.0 Integration

```typescript
class OAuthProvider {
    async handleAuthorization(request: OAuthRequest): Promise<OAuthResponse> {
        // Validate client
        const client = await this.validateClient(request.client_id);
        
        // Generate authorization code
        const code = await this.generateAuthCode({
            client_id: request.client_id,
            scope: request.scope,
            redirect_uri: request.redirect_uri
        });
        
        return {
            code,
            state: request.state,
            redirect_uri: request.redirect_uri
        };
    }

    async exchangeToken(
        code: string,
        clientId: string,
        clientSecret: string
    ): Promise<TokenResponse> {
        // Validate authorization code
        const authInfo = await this.validateAuthCode(code);
        
        // Generate access token
        const accessToken = await this.generateAccessToken(authInfo);
        
        // Generate refresh token
        const refreshToken = await this.generateRefreshToken(authInfo);
        
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            expires_in: 3600
        };
    }
}
```

## 2.2 Security Implementation

### 2.2.1 Request Signing

```typescript
class RequestSigner {
    private readonly apiSecret: string;

    signRequest(request: Request): SignedRequest {
        const timestamp = Date.now().toString();
        const signature = this.generateSignature(request, timestamp);

        return {
            ...request,
            headers: {
                ...request.headers,
                'X-Timestamp': timestamp,
                'X-Signature': signature
            }
        };
    }

    private generateSignature(request: Request, timestamp: string): string {
        const content = [
            request.method,
            request.path,
            timestamp,
            request.body
        ].join('\n');

        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(content)
            .digest('hex');
    }
}
```

### 2.2.2 Security Monitoring

```typescript
class SecurityMonitor {
    async monitorAuthentication(context: AuthContext): Promise<void> {
        // Log authentication attempt
        await this.logAuthAttempt(context);
        
        // Check for suspicious patterns
        if (await this.isUnusualPattern(context)) {
            await this.notifySecurityTeam(context);
        }
        
        // Update metrics
        await this.updateAuthMetrics(context);
    }

    private async isUnusualPattern(context: AuthContext): Promise<boolean> {
        const patterns = await this.analyzePatterns(context);
        return patterns.some(pattern => pattern.suspicious);
    }
}
```

### 2.2.3 Access Control

```typescript
class AccessController {
    async validateAccess(
        user: User,
        resource: Resource,
        action: Action
    ): Promise<AccessValidation> {
        // Check basic permissions
        const hasPermission = await this.checkPermission(user, resource, action);
        if (!hasPermission) {
            throw new AccessDeniedError('Insufficient permissions');
        }
        
        // Validate resource-specific rules
        await this.validateResourceRules(user, resource, action);
        
        // Check rate limits
        await this.checkRateLimits(user, resource);
        
        return { granted: true, limitations: [] };
    }
}
```

## 2.3 Security Best Practices

Secure your NNA API integration with these developer-focused practices:

1. **Key Management**:
    - Rotate API keys every 90 days:

```bash
curl -X POST "https://api.reviz.studio/v1/auth/rotate" -H "Authorization: Bearer YOUR_API_KEY"
```

    - Store in environment variables: export NNA_API_KEY='YOUR_KEY'.
1. **Token Security**:
    - Use short-lived JWTs (1 hour):

```javascript
const token = await client.auth.getToken({ expiresIn: '1h' });
```

    - Refresh via /v1/auth/refresh.
1. **Request Protection**:
    - Sign requests:

```javascript
const signature = crypto.createHmac('sha256', 'YOUR_SECRET').update(JSON.stringify(request)).digest('hex');
```

1. **Error Handling**:
    - Log without exposing internals:

```javascript
try {
    await client.asset.resolve('S.01.01.001');
} catch (e) {
    console.error(`Error: ${e.message}, Code: ${e.code}`);
}
```

For detailed implementations, see [Implementation Guide, Section 5 - Security Implementation](#5-security-implementation).

### 2.3.1 Key Management

- Rotate API keys regularly
- Use environment variables for storage
- Implement key expiration
- Monitor key usage

### 2.3.2 Token Security

- Short-lived access tokens (1 hour)
- Secure token storage
- Implement refresh token rotation
- Include minimal claims

### 2.3.3 Request Protection

- Validate all inputs
- Implement request signing
- Use rate limiting
- Monitor for abuse

### 2.3.4 Error Handling

- Don't expose internal errors
- Log security events
- Implement account lockout
- Use standardized error formats

# 3. Core APIs

## 3.1 Asset Resolution

### 3.1.1 Single Asset Resolution

```xml
GET /v1/asset/resolve/{asset_id}
```

- **Description**: Resolve an individual asset by its NNA Address or Human-Friendly Name
- **Authentication**: Required
- **Rate Limit**: 2000 requests/minute
1. **Request Parameters**

```typescript
interface AssetResolutionRequest {
    // Path Parameters
    asset_id: string;  // Format: NNA Address [Layer].[CategoryNum].[SubCategoryNum].[Sequential].[Type].[Version]
                      // OR Human-Friendly Name [Layer].[CategoryCode].[SubCategoryCode].[Sequential].[Type].[Version]
                      // Examples: G.003.042.001.mp3.v1 or G.POP.TSW.001.mp3.v1

    // Query Parameters
    include_metadata?: boolean;  // Default: false
    version?: string;           // Format: v{major}.{minor}
    format?: string;            // "address" or "friendly" to control response format
}
```

1. **Response Format**

```
{
    "success": true,
    "data": {
        "asset_id": "M.017.002.001.mp4.v1",
        "friendly_name": "M.SMT.WOH.001.mp4.v1",
        "type": "moves",
        "category": "social_media_trending",
        "subcategory": "woah",
        "urls": {
            "preview": "https://cdn.reviz.studio/assets/M.017.002.001/preview.mp4",
            "thumbnail": "https://cdn.reviz.studio/assets/M.017.002.001/thumb.jpg",
            "full": "https://cdn.reviz.studio/assets/M.017.002.001/full.mp4",
            "tutorial": "https://cdn.reviz.studio/tutorials/M.017.002.001/tutorial.mp4"
        },
        "metadata": {
            "duration": "00:00:30",
            "resolution": "1920x1080",
            "format": "mp4",
            "created_at": "2025-02-23T10:30:00Z",
            "modified_at": "2025-02-23T10:30:00Z",
            "Movement_Speed": "Medium",  // Moves layer
            "Energy_Level": "High",      // Moves layer
            "Cultural_Origin": "Social Media",  // Moves layer
            "Tutorial_Available": true,  // Moves layer
            "Tutorial_Link": "https://cdn.reviz.studio/tutorials/M.017.002.001/tutorial.mp4",  // Moves layer
            "Popularity_Score": 85,
            "Social_Media_Format": {
                "TikTok": { "aspect_ratio": "9:16", "max_duration": 60 }
            }
        },
        "relationships": {
            "compatible_with": ["G.POP.*.*", "S.POP.*.*"],
            "requires": ["G.003.042.001.mp3.v1"],
            "versions": ["v1.0", "v1.1"]
        }
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_abc123",
        "cache_hit": true
    }
}
```

### 



### 

### 3.1.2 Batch Asset Resolution

```xml
POST /v1/asset/batch/resolve
```

**Description**: Resolve multiple assets in a single call

**Authentication**: Required

**Rate Limit**: 500 requests/minute

1. **Request Format**

```json
{
    "assets": [
        "M.017.002.001.mp4.v1",
        "X.001.001.001.json.v1",
        "A.001.002.001.mp4.v1"
    ],
    "options": {
        "parallel": true,
        "timeout": 30000,
        "include_metadata": true
    }
}
```

1. **Response Format**

```json
{
  "success": true,
  "data": {
    "total_processed": 3,
    "successful": 3,
    "failed": 0,
    "results": [
      {
        "asset_id": "M.017.002.001.mp4.v1",
        "success": true,
        "data": {
          "friendly_name": "M.SMT.WOH.001.mp4.v1",
          "type": "moves",
          "category": "social_media_trending",
          "subcategory": "woah",
          "urls": {
            "preview": "https://cdn.reviz.studio/assets/M.017.002.001/preview.mp4",
            "thumbnail": "https://cdn.reviz.studio/assets/M.017.002.001/thumb.jpg",
            "full": "https://cdn.reviz.studio/assets/M.017.002.001/full.mp4",
            "tutorial": "https://cdn.reviz.studio/tutorials/M.017.002.001/tutorial.mp4"
          },
          "metadata": {
            "Movement_Speed": "Medium",
            "Energy_Level": "High",
            "Cultural_Origin": "Social Media",
            "Tutorial_Available": true,
            "Tutorial_Link": "https://cdn.reviz.studio/tutorials/M.017.002.001/tutorial.mp4"
          }
        }
      },
      {
        "asset_id": "X.001.001.001.json.v1",
        "success": true,
        "data": {
          "friendly_name": "X.LYR.POP.001.json.v1",
          "type": "text",
          "category": "lyrics",
          "subcategory": "pop",
          "urls": {
            "preview": "https://cdn.reviz.studio/assets/X.001.001.001/preview.png",
            "thumbnail": "https://cdn.reviz.studio/assets/X.001.001.001/thumb.png",
            "full": "https://cdn.reviz.studio/assets/X.001.001.001/full.json"
          },
          "metadata": {
            "Font_Style": "Bold",
            "Text_Content": "Shake it off, shake it off"
          }
        }
      },
      {
        "asset_id": "A.001.002.001.mp4.v1",
        "success": true,
        "data": {
          "friendly_name": "A.FAC.MSK.001.mp4.v1",
          "type": "augmented_reality",
          "category": "face_filters",
          "subcategory": "masks",
          "urls": {
            "preview": "https://cdn.reviz.studio/assets/A.001.002.001/preview.mp4",
            "thumbnail": "https://cdn.reviz.studio/assets/A.001.002.001/thumb.jpg",
            "full": "https://cdn.reviz.studio/assets/A.001.002.001/full.mp4"
          },
          "metadata": {
            "Interaction_Type": "Blink"
          }
        }
      }
    ]
  },
  "metadata": {
    "timestamp": "2025-02-23T10:30:00Z",
    "request_id": "req_batch123",
    "cache_hit_ratio": 0.67
  }
}
```

1. **Implementation Example**

```typescript
class BatchResolver {
    async resolveBatch(
        assets: string[],
        options: BatchOptions
    ): Promise<BatchResult> {
        const batchSize = 100; // Maximum assets per request
        const results: AssetResult[] = [];
        
        for (let i = 0; i < assets.length; i += batchSize) {
            const batch = assets.slice(i, i + batchSize);
            try {
                const batchResults = await this.processBatch(batch, options);
                results.push(...batchResults);
            } catch (error) {
                if (error instanceof BatchProcessingError) {
                    await this.handleFailedBatch(batch, error);
                }
            }
        }
        
        return {
            total_processed: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }

    private async processBatch(
        batch: string[],
        options: BatchOptions
    ): Promise<AssetResult[]> {
        if (options.parallel) {
            return Promise.all(
                batch.map(assetId => this.resolveAsset(assetId, options))
            );
        }

        const results: AssetResult[] = [];
        for (const assetId of batch) {
            try {
                const result = await this.resolveAsset(assetId, options);
                results.push(result);
            } catch (error) {
                results.push({
                    asset_id: assetId,
                    success: false,
                    error: this.formatError(error)
                });
            }
        }
        return results;
    }
}
```

### 3.1.3 Example Workflow: Music Video Creation

Create a music video by combining assets with this workflow:

1. **Resolve Base Song**:

```bash
curl -X GET "https://api.reviz.studio/v1/asset/resolve/G.003.042.001.mp3.v1" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

1. **Get Compatible Moves and Tutorial**:

```bash
curl -X GET "https://api.reviz.studio/v1/asset/search?layer_type=M&compatible_with=G.003.042.001.mp3.v1" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

```bash
curl -X GET "https://api.reviz.studio/v1/asset/moves/tutorial/M.017.002.001.mp4.v1" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

1. **Get Recommendations** (via WebSocket):

```javascript
const ws = new WebSocket('wss://api.reviz.studio/v1/preview');
ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'subscribe_preview',
        data: { composite_id: 'comp_123', quality: 'medium' }
    }));
};
ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'preview.ready') {
        console.log('Preview URL:', msg.data.url);
    }
};
```

1. **Create Composite**:

```bash
curl -X POST "https://api.reviz.studio/v1/composition/create" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
         "components": {
             "song": "G.003.042.001.mp3.v1",
             "star": "S.001.001.001.png.v1",
             "look": "L.006.003.001.png.v1",
             "moves": "M.017.002.001.mp4.v1",
             "world": "W.008.008.001.mp4.v1",
             "vibe": "V.002.006.001.json.v1",
             "audio_effects": "E.001.002.001.mp3.v1",
             "transitions": "N.001.002.001.mp4.v1",
             "augmented_reality": "A.001.002.001.mp4.v1",
             "filters": "F.001.002.001.json.v1",
             "text": "X.001.001.001.json.v1"
         },
         "options": {"resolution": "1920x1080", "format": "mp4"}
     }'
```

1. **Check Status**:

```bash
curl -X GET "https://api.reviz.studio/v1/composition/comp_123/status" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

This integrates [Section 3.1 - Asset Resolution](#3-core-ap-is), [Section 3.2 - Asset Composition](#3-core-ap-is), and [Section 4 - WebSocket API](#4-web-socket-api). See [Whitepaper, Section 7.1.1](#7-use-cases) for the use case context.

### 3.1.4 Asset Search API

```xml
GET /v1/asset/search
```

**Description**: Search for assets using various criteria

**Authentication**: Required

**Rate Limit**: 1000 requests/minute

1. **Request Parameters**

```typescript
interface AssetSearchRequest {
    // Query Parameters
    query?: string;           // Free text search
    layer_type?: string;      // Filter by layer type (G, S, L, M, W, V, B, P, T, C, R, E, N, A, F, X)
    category?: string;        // Filter by category
    subcategory?: string;     // Filter by subcategory
    compatible_with?: string; // Find assets compatible with this asset ID
    created_after?: string;   // ISO 8601 date
    created_before?: string;  // ISO 8601 date
    limit?: number;           // Default: 20, Max: 100
    offset?: number;          // Default: 0
    sort_by?: string;         // Options: "relevance", "created_at", "popularity"
    sort_order?: string;      // Options: "asc", "desc"
    movement_speed?: string;  // Moves layer filter (e.g., "Slow", "Medium", "Fast")
    cultural_origin?: string; // Moves layer filter (e.g., "Social Media", "KPop")
    font_style?: string;      // Text layer filter (e.g., "Bold", "Italic")
}
```

1. **Response Format**

```json
{
    "success": true,
    "data": {
        "total": 342,
        "limit": 20,
        "offset": 0,
        "results": [
            {
                "asset_id": "M.017.002.001.mp4.v1",
                "friendly_name": "M.SMT.WOH.001.mp4.v1",
                "type": "moves",
                "category": "social_media_trending",
                "subcategory": "woah",
                "preview_url": "https://cdn.reviz.studio/assets/M.017.002.001/preview.mp4",
                "thumbnail_url": "https://cdn.reviz.studio/assets/M.017.002.001/thumb.jpg",
                "compatibility_score": 0.95,
                "created_at": "2025-02-23T10:30:00Z",
                "metadata": {
                    "duration": "00:00:30",
                    "resolution": "1920x1080",
                    "tags": ["trending", "dance"],
                    "creator": "ReViz Studios",
                    "Movement_Speed": "Medium",
                    "Cultural_Origin": "Social Media",
                    "Tutorial_Available": true
                }
            },
            {
                "asset_id": "X.001.001.001.json.v1",
                "friendly_name": "X.LYR.POP.001.json.v1",
                "type": "text",
                "category": "lyrics",
                "subcategory": "pop",
                "preview_url": "https://cdn.reviz.studio/assets/X.001.001.001/preview.png",
                "thumbnail_url": "https://cdn.reviz.studio/assets/X.001.001.001/thumb.png",
                "compatibility_score": 0.92,
                "created_at": "2025-02-20T14:15:00Z",
                "metadata": {
                    "duration": "00:00:25",
                    "resolution": "1920x1080",
                    "tags": ["lyrics", "pop"],
                    "creator": "ReViz Studios",
                    "Font_Style": "Bold",
                    "Text_Content": "Shake it off, shake it off"
                }
            }
        ]
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_xyz789",
        "filters_applied": ["layer_type", "compatible_with"],
        "cache_hit": true
    }
}
```

1. **Implementation Example:**

```typescript
class AssetSearcher {
    async searchAssets(
        criteria: SearchCriteria,
        options: SearchOptions = {}
    ): Promise<SearchResults> {
        // Apply filters
        const filters = this.buildFilters(criteria);
        
        // Execute search
        const results = await this.storage.searchAssets(filters, {
            limit: options.limit || 20,
            offset: options.offset || 0,
            sortBy: options.sort_by || 'relevance',
            sortOrder: options.sort_order || 'desc'
        });
        
        // Process compatibility if needed
        if (criteria.compatible_with) {
            await this.enhanceWithCompatibility(results, criteria.compatible_with);
        }
        
        return this.formatResults(results, criteria);
    }
    
    private buildFilters(criteria: SearchCriteria): AssetFilters {
        // Transform search criteria to storage filters
        const filters: AssetFilters = {};
        
        if (criteria.query) {
            filters.textSearch = criteria.query;
        }
        
        if (criteria.layer_type) {
            filters.layerType = criteria.layer_type;
        }
        
        // Add more filter transformations
        
        return filters;
    }
}
```

## 3.2 Asset Composition

### 3.2.1 Create Composite Asset

```
POST /v1/composition/create

Description: Create a new composite asset from multiple layers
Authentication: Required
Rate Limit: 1000 requests/minute
```

Request Format

```json
{
    "components": {
        "song": "G.003.042.001.mp3.v1",      // Shake It Off
        "star": "S.001.001.001.png.v1",      // Pop Star Classic
        "look": "L.006.003.001.png.v1",      // Latin Flair
        "moves": "M.017.002.001.mp4.v1",     // Woah Dance
        "world": "W.008.008.001.mp4.v1",     // Dance Club
        "vibe": "V.002.006.001.json.v1",     // Happy Mood
        "audio_effects": "E.001.002.001.mp3.v1",  // Pitch Shift
        "transitions": "N.001.002.001.mp4.v1",    // Fade Transition
        "augmented_reality": "A.001.002.001.mp4.v1",  // Mask Filter
        "filters": "F.001.002.001.json.v1",       // Warm Filter
        "text": "X.001.001.001.json.v1"           // Lyrics Overlay
    },
    "options": {
        "resolution": "1920x1080",
        "format": "mp4",
        "quality": 85,
        "output_formats": ["portrait", "landscape"]
    }
}
```

Implementation Example

```typescript
class CompositeAssetCreator {
    async createComposite(
        components: Components,
        options: CompositeOptions
    ): Promise<CompositeAsset> {
        // Validate components
        await this.validateComponents(components);

        // Check compatibility
        await this.checkCompatibility(components);

        // Generate composite
        const composite = await this.generateComposite(components, options);

        // Process outputs
        await this.processOutputs(composite, options.output_formats);

        return composite;
    }

    private async validateComponents(components: Components): Promise<void> {
        // Validate required components
        if (components.star && !components.song) {
            throw new ValidationError('Star layer requires Song layer');
        }
        if (components.augmented_reality && !components.star) {
            throw new ValidationError('Augmented Reality layer requires Star layer');
        }
        if (components.text && !components.song) {
            throw new ValidationError('Text layer requires Song layer for timing');
        }

        // Validate component existence
        await Promise.all(
            Object.entries(components).map(async ([layer, id]) => {
                const exists = await this.assetExists(id);
                if (!exists) {
                    throw new AssetNotFoundError(id, layer);
                }
            })
        );
    }
}
```

### 3.2.2 Get Composition Status

```
GET /v1/composition/{composite_id}/status

Description: Get current status of a composite asset
Authentication: Required
Rate Limit: 1000 requests/minute
```

Implementation Example

```typescript
class CompositionStatusManager {
    async getStatus(compositeId: string): Promise<CompositionStatus> {
        const composite = await this.getComposite(compositeId);
        
        return {
            composite_id: compositeId,
            status: composite.status,
            progress: {
                percentage: await this.calculateProgress(composite),
                current_stage: composite.currentStage,
                stages_completed: composite.completedStages,
                stages_remaining: composite.remainingStages,
                remaining_time: await this.estimateRemainingTime(composite)
            },
            components: await this.getComponentStatuses(composite),
            outputs: await this.getOutputStatuses(composite)
        };
    }

    private async calculateProgress(composite: Composite): Promise<number> {
        const stageWeights = {
            'asset_processing': 0.3,
            'face_swap': 0.2,
            'rendering': 0.4,
            'optimization': 0.1
        };

        return composite.stages
            .map(stage => stageWeights[stage.name] * stage.progress)
            .reduce((a, b) => a + b, 0);
    }
}
```

### 3.2.3 Update Composite Asset

```xml
PATCH /v1/composition/{composite_id}
```

**Description**: Update an existing composite asset

**Authentication**: Required

**Rate Limit**: 500 requests/minute

1. **Request Format**

```json
{
    "components": {
        "star": "S.02.01.001",   // Update star component
        "look": "L.07.03.001"    // Update look component
    },
    "options": {
        "resolution": "1920x1080",
        "quality": 90
    }
}
```

1. **Response Format**

```json
{
    "components": {
        "star": "S.02.01.001",   // Update star component
        "look": "L.07.03.001"    // Update look component
    },
    "options": {
        "resolution": "1920x1080",
        "quality": 90
    }
}
```

1. **Implementation Example:**

```typescript
class CompositeUpdater {
    async updateComposite(
        compositeId: string,
        updates: ComponentUpdates,
        options: UpdateOptions = {}
    ): Promise<UpdateResult> {
        // Validate composite
        const composite = await this.getComposite(compositeId);
        if (!composite) {
            throw new CompositeNotFoundError(compositeId);
        }
        
        // Validate update permission
        await this.validateUpdatePermission(composite, options.userId);
        
        // Validate component compatibility
        const updatedComponents = {...composite.components, ...updates.components};
        await this.validateComponentCompatibility(updatedComponents);
        
        // Create update record
        const updateId = this.generateUpdateId();
        await this.createUpdateRecord(compositeId, updateId, updates);
        
        // Queue update job
        await this.queueUpdateJob(composite, updates, updateId);
        
        return {
            composite_id: compositeId,
            update_id: updateId,
            status: 'updating',
            components: updatedComponents,
            estimated_completion: this.estimateCompletionTime(updates)
        };
    }
}
```

### 3.2.4 Delete Composite Asset

```xml
DELETE /v1/composition/{composite_id}
```

**Description**: Delete a  composite asset

**Authentication**: Required

**Rate Limit**: 200 requests/minute

1. **Response Format**

```json
{
    "success": true,
    "data": {
        "composite_id": "comp_abc123",
        "status": "deleted",
        "deleted_at": "2025-02-23T10:30:00Z"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_ghi789"
    }
}
```

1. **Implementation Example:**

```typescript
class CompositeManager {
    async deleteComposite(
        compositeId: string,
        options: DeleteOptions = {}
    ): Promise<DeleteResult> {
        // Validate composite
        const composite = await this.getComposite(compositeId);
        if (!composite) {
            throw new CompositeNotFoundError(compositeId);
        }
        
        // Validate delete permission
        await this.validateDeletePermission(composite, options.userId);
        
        // Mark as deleted
        await this.markAsDeleted(compositeId);
        
        // Queue cleanup job
        if (!options.keepFiles) {
            await this.queueCleanupJob(compositeId);
        }
        
        return {
            composite_id: compositeId,
            status: 'deleted',
            deleted_at: new Date().toISOString()
        };
    }
}
```

### 3.2.5 List User Compositions

```xml
GET /v1/composition/list
```

**Description**: List compositions created by a user

**Authentication**: Required

**Rate Limit**: 300 requests/minute

1. **Request Parameters**

```typescript
interface ListCompositionsRequest {
    // Query Parameters
    status?: string;         // Filter by status: "processing", "ready", "failed"
    created_after?: string;  // ISO 8601 date
    created_before?: string; // ISO 8601 date
    limit?: number;          // Default: 20, Max: 100
    offset?: number;         // Default: 0
    sort_by?: string;        // Options: "created_at", "updated_at"
    sort_order?: string;     // Options: "asc", "desc"
}
```

1. **Response Format**

```json
{
    "success": true,
    "data": {
        "total": 42,
        "limit": 20,
        "offset": 0,
        "compositions": [
            {
                "composite_id": "comp_abc123",
                "status": "ready",
                "components": {
                    "song": "G.01.TSW.001",
                    "star": "S.01.01.001"
                },
                "created_at": "2025-02-22T15:30:00Z",
                "updated_at": "2025-02-22T15:35:00Z",
                "thumbnail_url": "https://cdn.reviz.studio/compositions/comp_abc123/thumb.jpg"
            },
            // Additional compositions...
        ]
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_jkl012"
    }
}
```

1. **Implementation Example:**

```typescript
class CompositionLister {
    async listCompositions(
        userId: string,
        filters: CompositionFilters = {},
        options: ListOptions = {}
    ): Promise<CompositionList> {
        // Apply user filter (always filter by user)
        const compositionFilters = {
            ...filters,
            userId
        };
        
        // Get total count
        const total = await this.getFilteredCount(compositionFilters);
        
        // Get compositions
        const compositions = await this.getFilteredCompositions(
            compositionFilters,
            {
                limit: options.limit || 20,
                offset: options.offset || 0,
                sortBy: options.sort_by || 'created_at',
                sortOrder: options.sort_order || 'desc'
            }
        );
        
        // Process for display
        const processedCompositions = await this.processForDisplay(compositions);
        
        return {
            total,
            limit: options.limit || 20,
            offset: options.offset || 0,
            compositions: processedCompositions
        };
    }
}
```

## 3.3 Rights Management APIs

### 3.3.1 Rights Verification

```json
GET /v1/rights/verify/{asset_id}
```

```typescript
GET /v1/rights/verify/{asset_id}

Description: Verify usage rights for an asset
Authentication: Required
Rate Limit: 4000 requests/minute

Path Parameters:
- asset_id: string (required)
  Format: [Layer].[Category].[SubCategory].[Sequential].[Type].[Version]

Query Parameters:
- territory: string (optional)
  Format: ISO 3166-1 alpha-2
  Example: US
- usage_type: string (optional)
  Enum: ["personal", "commercial", "educational"]

Response Schema:
{
    "success": true,
    "data": {
        "has_rights": true,
        "rights_type": "full",
        "expiration": "2025-12-31T23:59:59Z",
        "restrictions": {
            "territories": ["US", "EU"],
            "usage_types": ["personal", "commercial"],
            "platforms": ["TikTok", "Instagram"]
        },
        "required_attributions": ["ReViz Studios"],
        "asset_metadata": {
            "Movement_Speed": "Medium",  // Moves layer
            "Cultural_Origin": "Social Media",  // Moves layer
            "Interaction_Type": "Blink",  // AR layer
            "Font_Style": "Bold"  // Text layer
        }
    }
}
```

### 3.3.2 Grant Rights 

```xml
POST /v1/rights/grant
```

**Description**: Grant usage rights for an asset

**Authentication**: Required

**Rate Limit**: 100 requests/minute

1. **Request Format:** [See full schema in Appendix A](#appendix-a-complete-requestresponse-examples)

```json
Request Body:
{
    "asset_id": string,
    "user_id": string,
    "rights_type": "full" | "limited",
    "duration": string,  // ISO 8601 duration
    "restrictions": {
        "territories": string[],
        "usage_types": string[],
        "platforms": string[]
    }
}
```

1. **Response Schema:** [See full schema in Appendix A](#appendix-a-complete-requestresponse-examples)

```json
{
    "success": true,
    "data": {
        "grant_id": string,
        "status": "active",
        "expiration": string,  // ISO 8601 date
        "rights_details": {
            "asset_id": string,
            "user_id": string,
            "rights_type": string,
            "restrictions": object
        }
    }
}
```

1. **Implementation Example:**

```typescript
class RightsGranter {
    async grantRights(
        grantRequest: GrantRequest,
        options: GrantOptions = {}
    ): Promise<Grant> {
        // Validate asset
        const asset = await this.getAsset(grantRequest.asset_id);
        if (!asset) {
            throw new AssetNotFoundError(grantRequest.asset_id);
        }
        
        // Validate user
        const user = await this.getUser(grantRequest.user_id);
        if (!user) {
            throw new UserNotFoundError(grantRequest.user_id);
        }
        
        // Check if granter has permission
        await this.validateGrantPermission(asset, options.granterId);
        
        // Check for existing grants
        const existingGrant = await this.findExistingGrant(
            grantRequest.asset_id,
            grantRequest.user_id
        );
        
        if (existingGrant && !options.overwrite) {
            throw new RightsConflictError(
                'Rights already granted for this asset',
                grantRequest.asset_id,
                existingGrant.grant_id
            );
        }
        
        // Create grant
        const grant = {
            grant_id: this.generateGrantId(),
            asset_id: grantRequest.asset_id,
            user_id: grantRequest.user_id,
            rights_type: grantRequest.rights_type,
            status: 'active',
            granted_at: new Date().toISOString(),
            expiration: this.calculateExpiration(grantRequest.duration),
            restrictions: grantRequest.restrictions || {},
            granted_by: options.granterId,
            territory: grantRequest.territory || 'global',
            platforms: grantRequest.platforms || ['all']
        };
        
        // Store grant
        await this.storeGrant(grant);
        
        // Log grant activity
        await this.logGrantActivity(grant);
        
        // Invalidate cache for this asset/user combination
        await this.invalidateRightsCache(grantRequest.asset_id, grantRequest.user_id);
        
        return grant;
    }
    
    private calculateExpiration(duration: string): string {
        // Parse ISO 8601 duration and add to current date
        // Example: 'P30D' = 30 days
        const now = new Date();
        
        // Simple implementation for common durations
        if (duration === 'P30D') {
            now.setDate(now.getDate() + 30);
        } else if (duration === 'P1Y') {
            now.setFullYear(now.getFullYear() + 1);
        } else {
            // Default to 30 days if duration format is not recognized
            now.setDate(now.getDate() + 30);
        }
        
        return now.toISOString();
    }
    
    private generateGrantId(): string {
        return `grant_${crypto.randomUUID().replace(/-/g, '')}`;
    }
}
```

1. **Grants Rights Implementation Example:**

```json
POST /v1/rights/grant
{
  "asset_id": "G.01.TSW.001",
  "user_id": "usr_123",
  "rights": ["use", "remix"],
  "territory": "US",
  "expiry": "2026-03-20T00:00:00Z"
}
Response:
{
  "status": "success",
  "rights_id": "rgt_456"
}
```

### 3.3.3 Revoke Rights

```json
DELETE /v1/rights/{grant_id}
```

1. **Response Format**

```json
{
    "success": true,
    "data": {
        "grant_id": "grant_abc123",
        "status": "revoked",
        "revoked_at": "2025-02-23T10:30:00Z",
        "asset_id": "S.01.01.001",
        "user_id": "u123456"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_mno345"
    }
}
```

1. **Implementation Example:**

```typescript
class RightsManager {
    async revokeRights(
        grantId: string,
        options: RevokeOptions = {}
    ): Promise<RevokeResult> {
        // Validate grant
        const grant = await this.getGrant(grantId);
        if (!grant) {
            throw new GrantNotFoundError(grantId);
        }
        
        // Validate revoke permission
        await this.validateRevokePermission(grant, options.requesterId);
        
        // Revoke grant
        await this.revokeGrant(grantId);
        
        // Log revocation
        await this.logRevocation(grant, options.reason);
        
        return {
            grant_id: grantId,
            status: 'revoked',
            revoked_at: new Date().toISOString(),
            asset_id: grant.assetId,
            user_id: grant.userId
        };
    }
}
```

### 3.3.4 List User Rights

```xml
GET /v1/rights/user/{user_id}
```

**Description**: List rights granted to a user

**Authentication**: Required (Admin or same user only)

**Rate Limit**: 200 requests/minute

1. **Request Parameters**

```typescript
interface ListRightsRequest {
    // Query Parameters
    status?: string;         // Filter by status: "active", "expired", "revoked"
    asset_type?: string;     // Filter by asset type
    limit?: number;          // Default: 20, Max: 100
    offset?: number;         // Default: 0
}
```

1. **Response Format**

```json
{
    "success": true,
    "data": {
        "total": 15,
        "limit": 20,
        "offset": 0,
        "rights": [
            {
                "grant_id": "grant_abc123",
                "asset_id": "S.01.01.001",
                "status": "active",
                "rights_type": "full",
                "granted_at": "2025-02-01T10:30:00Z",
                "expiration": "2025-03-01T10:30:00Z",
                "restrictions": {
                    "territories": ["US", "EU"],
                    "usage_types": ["personal", "commercial"],
                    "platforms": ["all"]
                }
            },
            // Additional rights...
        ]
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_pqr678"
    }
}
```

1. **Implementation Example:**

```typescript
class RightsLister {
    async listUserRights(
        userId: string,
        filters: RightsFilters = {},
        options: ListOptions = {}
    ): Promise<RightsList> {
        // Validate access
        await this.validateAccess(userId, options.requesterId);
        
        // Get total count
        const total = await this.getFilteredCount(userId, filters);
        
        // Get rights
        const rights = await this.getFilteredRights(
            userId,
            filters,
            {
                limit: options.limit || 20,
                offset: options.offset || 0
            }
        );
        
        // Process rights
        const processedRights = await this.processRights(rights);
        
        return {
            total,
            limit: options.limit || 20,
            offset: options.offset || 0,
            rights: processedRights
        };
    }
}
```

## 

## 3.4 Tutorial: Real-time Video Remix

Build a real-time remix feature with this tutorial:

1. **Setup Client**:

```javascript
const { NNAClient } = require('@reviz/nna-sdk');
const client = new NNAClient({ apiKey: 'YOUR_API_KEY' });
```

1. **Resolve Base Asset**:

```javascript
async function getSong() {
    const song = await client.asset.resolve('G.01.TSW.001');
    return song.data;
}
```

1. **Subscribe to Previews:**

```javascript
const ws = new WebSocket('wss://api.reviz.studio/v1/preview');
ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'subscribe_preview',
        data: { composite_id: 'comp_123', quality: 'medium' }
    }));
};
ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'preview.ready') {
        console.log('Preview ready:', msg.data.url);
    }
};
```

1. **Create and Monitor Composite**:

```javascript
async function createRemix(song) {
    const composite = await client.composition.create({
        components: { song: song.asset_id, star: 'S.01.01.001' },
        options: { resolution: '1920x1080', format: 'mp4' }
    });
    const status = await client.composition.status(composite.composite_id);
    console.log(`Status: ${status.status}`);
    return composite;
}
```

1. **Run It:**

```javascript
javascriptCopy(async () => {
    const song = await getSong();
    const composite = await createRemix(song);
})().catch(console.error);
```

This uses [Section 3.1 - Asset Resolution](#3-core-ap-is) and [Section 4 - WebSocket API](#4-web-socket-api). For setup, see [Implementation Guide, Section 1.7](#1-introduction-and-setup).

## 3.3.5 Rights Resolution Error Handling

The Rights Management API provides structured error handling for various failure scenarios during rights resolution.

### 3.3.5.1 Error Response Format

When a rights verification fails, the API returns a standardized error response with details about the failure:

```json
{
  "success": false,
  "error": {
    "code": "NNA_RIGHTS_ERROR",
    "message": "Failed to verify rights for the requested asset",
    "details": {
      "error_type": "TERRITORIAL_RESTRICTION",
      "asset_id": "S.01.01.001", 
      "requested_territory": "JP",
      "allowed_territories": ["US", "EU"],
      "resolution_id": "res_456def"
    },
    "trace_id": "trace_abc123"
  },
  "metadata": {
    "timestamp": "2025-02-23T10:30:00Z",
    "path": "/v1/rights/verify/S.01.01.001",
    "method": "GET",
    "version": "1.0.2"
  }
}
```

### 3.3.5.2 Rights Error Codes

| **Error Code** | **Description** | **HTTP Status** | **Recovery Strategy** |
| --- | --- | --- | --- |
| `NNA_RIGHTS_NOT_FOUND` | No rights record exists for the asset | 404 | Request rights grant |
| `NNA_RIGHTS_EXPIRED` | Rights have expired | 403 | Request rights renewal |
| `NNA_TERRITORIAL_RESTRICTION` | Usage not allowed in requested territory | 403 | Request territory-specific rights |
| `NNA_USAGE_RESTRICTION` | Requested usage type not permitted | 403 | Request usage-specific rights |
| `NNA_PLATFORM_RESTRICTION` | Usage not allowed on requested platform | 403 | Request platform-specific rights |
| `NNA_RIGHTS_CONFLICT` | Conflicting rights records exist | 409 | Request rights reconciliation |
| `NNA_RIGHTS_SERVICE_UNAVAILABLE` | Rights service temporarily unavailable | 503 | Retry with exponential backoff |

### 3.3.5.3 Recovery Patterns

When encountering rights errors, clients should implement appropriate recovery strategies:

1. **Automatic Retries**
1. For transient errors (e.g., `NNA_RIGHTS_SERVICE_UNAVAILABLE`), implement exponential backoff:

```javascript
async function verifyRightsWithRetry(assetId, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await client.rights.verify(assetId);
    } catch (error) {
      if (error.code === 'NNA_RIGHTS_SERVICE_UNAVAILABLE' && retries < maxRetries - 1) {
        retries++;
        const delayMs = Math.pow(2, retries) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
}
```

1. **Fallback to Cached Rights**
1. When rights verification fails, clients may fallback to cached rights with clear indication:

```javascript
async function getRightsWithFallback(assetId) {
  try {
    return await client.rights.verify(assetId);
  } catch (error) {
    if (cachedRights = await cache.get(`rights:${assetId}`)) {
      return {
        ...cachedRights,
        metadata: {
          ...cachedRights.metadata,
          from_cache: true,
          cache_time: cachedRights.metadata.timestamp
        }
      };
    }
    throw error;
  }
}
```

1. **Rights Request Flow**
1. When rights are unavailable, clients can implement a rights request flow:

```javascript
javascriptCopyasync function ensureRights(assetId, userId) {
  try {
    return await client.rights.verify(assetId);
  } catch (error) {
    if (error.code === 'NNA_RIGHTS_NOT_FOUND' || error.code === 'NNA_RIGHTS_EXPIRED') {
      // Initiate rights request
      return await client.rights.request({
        asset_id: assetId,
        user_id: userId,
        request_type: 'standard'
      });
    }
    throw error;
  }
}
```

### 3.3.5.4 Error Logging Requirements

Clients should log rights errors with the following information:

- Error code and message
- Asset ID and user ID
- Requested territory and usage type
- Timestamp of the request
- Trace ID for correlation

This logging enables effective troubleshooting and audit trail maintenance for rights-related issues.

# 4. WebSocket API (Real-time Communication)

## 4.1 Connection Management

### 4.1.1 Connection Establishment

```typescript
interface WebSocketConfig {
    endpoint: string;
    protocols?: string[];
    heartbeatInterval: number;
    reconnectOptions: {
        maxAttempts: number;
        baseDelay: number;
        maxDelay: number;
    };
}

class NNAWebSocketClient {
    private ws: WebSocket;
    private heartbeatInterval: NodeJS.Timeout;
    private reconnectAttempts: number = 0;

    constructor(private readonly config: WebSocketConfig) {
        this.connect();
    }

    private connect(): void {
        this.ws = new WebSocket(this.config.endpoint, this.config.protocols);
        
        this.ws.onopen = () => {
            this.onConnected();
            this.startHeartbeat();
            this.reconnectAttempts = 0;
        };

        this.ws.onclose = () => {
            this.handleDisconnect();
        };

        this.ws.onerror = (error) => {
            this.handleError(error);
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(event);
        };
    }

    private handleDisconnect(): void {
        this.stopHeartbeat();

        if (this.reconnectAttempts < this.config.reconnectOptions.maxAttempts) {
            const delay = Math.min(
                this.config.reconnectOptions.baseDelay * 
                Math.pow(2, this.reconnectAttempts),
                this.config.reconnectOptions.maxDelay
            );

            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, delay);
        } else {
            this.emit('permanent_disconnect', {
                attempts: this.reconnectAttempts,
                final: true
            });
        }
    }
}
```

### 4.1.2 Authentication Flow

```typescript
interface AuthenticationMessage {
    type: 'auth';
    data: {
        api_key: string;
        client_id: string;
        protocol_version: string;
    };
}

class WebSocketAuthenticator {
    async authenticate(ws: WebSocket, credentials: Credentials): Promise<void> {
        const authMessage: AuthenticationMessage = {
            type: 'auth',
            data: {
                api_key: credentials.apiKey,
                client_id: credentials.clientId,
                protocol_version: '1.0'
            }
        };

        return new Promise((resolve, reject) => {
            const authTimeout = setTimeout(() => {
                reject(new Error('Authentication timeout'));
            }, 5000);

            ws.send(JSON.stringify(authMessage));

            ws.once('message', (response) => {
                clearTimeout(authTimeout);
                const authResponse = JSON.parse(response.data);

                if (authResponse.success) {
                    resolve();
                } else {
                    reject(new Error(authResponse.error.message));
                }
            });
        });
    }
}
```

### 4.1.3 Heartbeat Management

```typescript
class HeartbeatManager {
    private heartbeatInterval: NodeJS.Timeout;
    private readonly interval: number = 30000; // 30 seconds
    private readonly timeout: number = 5000;   // 5 seconds

    startHeartbeat(ws: WebSocket): void {
        this.heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                // Check if WebSocket implementation supports ping
                // Fall back to a message-based ping if not
                if (typeof ws.ping === 'function') {
                    const pingTimeout = setTimeout(() => {
                        ws.close(1000, 'Heartbeat timeout');
                    }, this.timeout);

                    ws.ping(() => {
                        clearTimeout(pingTimeout);
                    });
                } else {
                    // Fallback for WebSocket implementations without ping
                    const pingTimeout = setTimeout(() => {
                        ws.close(1000, 'Heartbeat timeout');
                    }, this.timeout);

                    // Send a ping message
                    ws.send(JSON.stringify({
                        type: 'ping',
                        timestamp: Date.now()
                    }));

                    // Define onmessage handler to catch pong response
                    // This needs to be set up separately when initializing the WebSocket
                    // ws.onmessage = (event) => {
                    //    const data = JSON.parse(event.data);
                    //    if (data.type === 'pong') {
                    //        clearTimeout(pingTimeout);
                    //    }
                    // };
                }
            }
        }, this.interval);
    }

    stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }
    
    // Use this method to set up message-based ping/pong
    setupPingPongHandlers(ws: WebSocket): void {
        const originalOnMessage = ws.onmessage;
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'ping') {
                    // Respond to ping with pong
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: Date.now(),
                        echo: data.timestamp
                    }));
                } else if (data.type === 'pong') {
                    // Pong received, could measure latency here
                    const latency = Date.now() - data.echo;
                    console.log(`WebSocket latency: ${latency}ms`);
                } else if (originalOnMessage) {
                    // Pass other messages to original handler
                    originalOnMessage(event);
                }
            } catch (e) {
                // Not a JSON message or not a ping/pong
                if (originalOnMessage) {
                    originalOnMessage(event);
                }
            }
        };
    }
}
```

### 4.1.4 Message Size and Limitations

```typescript
interface WebSocketLimits {
    maxMessageSize: number;        // 1MB
    maxSubscriptions: number;      // 10 per connection
    maxConcurrentConnections: number; // 5 per user
    keepAliveTimeout: number;      // 60 seconds
}

class MessageSizeValidator {
    validate(message: string): ValidationResult {
        const size = new TextEncoder().encode(message).length;
        
        if (size > this.config.maxMessageSize) {
            return {
                valid: false,
                error: {
                    code: 'MESSAGE_TOO_LARGE',
                    message: `Message size ${size} exceeds maximum allowed size ${this.config.maxMessageSize}`,
                    current: size,
                    maximum: this.config.maxMessageSize
                }
            };
        }
        
        return { valid: true };
    }
}
```

### 4.1.5 Connection Pooling

```typescript
class ConnectionPoolManager {
    private readonly pool: Map<string, PooledConnection[]>;
    
    async getConnection(userId: string): Promise<WebSocket> {
        // Check existing connections
        const userConnections = this.pool.get(userId) || [];
        
        // Find available connection
        const availableConnection = userConnections.find(
            conn => conn.activeRequests < this.config.maxRequestsPerConnection
        );
        
        if (availableConnection) {
            availableConnection.activeRequests++;
            return availableConnection.socket;
        }
        
        // Create new connection if below limit
        if (userConnections.length < this.config.maxConnectionsPerUser) {
            const newConnection = await this.createConnection(userId);
            
            // Store in pool
            userConnections.push({
                socket: newConnection,
                activeRequests: 1,
                created: Date.now()
            });
            
            this.pool.set(userId, userConnections);
            return newConnection;
        }
        
        // No available connections
        throw new ConnectionLimitExceededError(
            `User ${userId} has reached maximum connection limit`
        );
    }
    
    async releaseConnection(userId: string, socket: WebSocket): Promise<void> {
        const userConnections = this.pool.get(userId);
        if (!userConnections) return;
        
        const connectionIndex = userConnections.findIndex(
            conn => conn.socket === socket
        );
        
        if (connectionIndex >= 0) {
            userConnections[connectionIndex].activeRequests--;
        }
    }
}
```

## 4.2 Event System

### 4.2.1 Event Types

```typescript
type EventType = 
    | 'asset.updated'
    | 'asset.deleted'
    | 'rights.changed'
    | 'cache.invalidated'
    | 'preview.ready';

interface EventMessage<T = any> {
    type: EventType;
    data: T;
    timestamp: number;
    metadata?: Record<string, any>;
}

interface PreviewReadyEvent {
    type: 'preview.ready';
    data: {
        composite_id: string;
        url: string;
        duration: number;
        format: string;
        resolution: string;
    };
}
```

### 4.2.2 Event Handling

```typescript
class EventHandler {
    private subscriptions: Map<string, EventSubscription>;

    async handleEvent(event: EventMessage): Promise<void> {
        const relevantSubscriptions = this.findRelevantSubscriptions(event);
        
        await Promise.all(
            relevantSubscriptions.map(subscription =>
                this.processEventForSubscription(event, subscription)
            )
        );
    }

    private async processEventForSubscription(
        event: EventMessage,
        subscription: EventSubscription
    ): Promise<void> {
        try {
            // Apply event filters
            if (!this.matchesFilters(event, subscription.filters)) {
                return;
            }

            // Transform event if needed
            const transformedEvent = await this.transformEvent(
                event,
                subscription.transformations
            );

            // Deliver event
            await this.deliverEvent(transformedEvent, subscription);
        } catch (error) {
            await this.handleEventError(error, event, subscription);
        }
    }
}
```

### 4.2.3 Subscription Management

```typescript
interface SubscriptionRequest {
    events: EventType[];
    filters?: {
        asset_types?: string[];
        categories?: string[];
        layers?: string[];
    };
    options?: {
        batch_size?: number;
        batch_interval?: number;
        retry_policy?: RetryPolicy;
    };
}

class SubscriptionManager {
    private readonly subscriptions = new Map<string, Subscription>();

    async subscribe(
        request: SubscriptionRequest,
        ws: WebSocket
    ): Promise<string> {
        // Generate subscription ID
        const subscriptionId = this.generateSubscriptionId();

        // Create subscription
        const subscription = await this.createSubscription(request, ws);

        // Store subscription
        this.subscriptions.set(subscriptionId, subscription);

        // Configure event handlers
        this.setupEventHandlers(subscription);

        // Start event processing
        await this.startEventProcessing(subscription);

        return subscriptionId;
    }

    private async createSubscription(
        request: SubscriptionRequest,
        ws: WebSocket
    ): Promise<Subscription> {
        return {
            id: this.generateSubscriptionId(),
            events: request.events,
            filters: request.filters || {},
            options: {
                batch_size: request.options?.batch_size || 100,
                batch_interval: request.options?.batch_interval || 1000,
                retry_policy: request.options?.retry_policy || defaultRetryPolicy
            },
            websocket: ws,
            status: 'active',
            created_at: new Date()
        };
    }

    private setupEventHandlers(subscription: Subscription): void {
        const batchProcessor = new BatchEventProcessor(
            subscription.options.batch_size,
            subscription.options.batch_interval
        );

        subscription.websocket.on('close', () => {
            this.handleSubscriptionClose(subscription);
        });

        batchProcessor.on('batch', async (events) => {
            await this.processBatch(subscription, events);
        });
    }
}

class BatchEventProcessor {
    private eventQueue: EventMessage[] = [];
    private readonly flushInterval: NodeJS.Timeout;

    constructor(
        private readonly batchSize: number,
        private readonly interval: number
    ) {
        this.flushInterval = setInterval(() => {
            this.flush();
        }, interval);
    }

    addEvent(event: EventMessage): void {
        this.eventQueue.push(event);
        if (this.eventQueue.length >= this.batchSize) {
            this.flush();
        }
    }

    private flush(): void {
        if (this.eventQueue.length > 0) {
            this.emit('batch', this.eventQueue);
            this.eventQueue = [];
        }
    }
}
```

### 4.2.4 Event Delivery and Retry

```typescript
interface RetryPolicy {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
}

class EventDeliveryManager {
    async deliverEvent(
        event: EventMessage,
        subscription: Subscription
    ): Promise<void> {
        let attempt = 0;
        const policy = subscription.options.retry_policy;

        while (attempt < policy.maxAttempts) {
            try {
                await this.sendEvent(event, subscription);
                return;
            } catch (error) {
                attempt++;
                if (attempt === policy.maxAttempts) {
                    throw new EventDeliveryError(
                        'Max delivery attempts reached',
                        { event, subscription, attempts: attempt }
                    );
                }
                await this.delay(this.calculateDelay(attempt, policy));
            }
        }
    }

    private calculateDelay(attempt: number, policy: RetryPolicy): number {
        return Math.min(
            policy.baseDelay * Math.pow(2, attempt),
            policy.maxDelay
        );
    }

    private async sendEvent(
        event: EventMessage,
        subscription: Subscription
    ): Promise<void> {
        if (subscription.websocket.readyState === WebSocket.OPEN) {
            subscription.websocket.send(JSON.stringify(event));
        } else {
            throw new WebSocketNotOpenError('WebSocket connection not open');
        }
    }
}
```

## 4.3 Preview Generation WebSocket

### 4.3.1 Preview Connection Setup

```typescript
interface PreviewRequest {
    type: 'subscribe_preview';
    data: {
        composite_id: string;
        quality: 'low' | 'medium' | 'high';
        headshot_url?: string;
        options?: {
            resolution: string;
            format: string;
            fps: number;
        };
    };
}

class PreviewSocketManager {
    private readonly previewSockets = new Map<string, WebSocket>();

    async setupPreviewSocket(
        compositeId: string,
        options: PreviewOptions
    ): Promise<WebSocket> {
        const ws = new WebSocket('wss://api.reviz.studio/v1/preview');
        
        // Configure socket
        await this.configurePreviewSocket(ws, compositeId, options);
        
        // Store socket reference
        this.previewSockets.set(compositeId, ws);
        
        return ws;
    }

    private async configurePreviewSocket(
        ws: WebSocket,
        compositeId: string,
        options: PreviewOptions
    ): Promise<void> {
        // Handle connection open
        ws.onopen = () => {
            this.sendPreviewRequest(ws, compositeId, options);
        };

        // Handle preview chunks
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handlePreviewMessage(message, compositeId);
        };

        // Handle errors
        ws.onerror = (error) => {
            this.handlePreviewError(error, compositeId);
        };
    }
}
```

### 4.3.2 Preview Data Handling

```typescript
interface PreviewChunk {
    type: 'preview_chunk';
    data: {
        composite_id: string;
        chunk_index: number;
        total_chunks: number;
        chunk_data: string;  // Base64 encoded video chunk
        timestamp: number;
        metadata: {
            duration: number;
            current_time: number;
            format: string;
        };
    };
}

class PreviewDataHandler {
    private readonly chunks = new Map<string, Map<number, PreviewChunk>>();

    handlePreviewChunk(chunk: PreviewChunk): void {
        const { composite_id, chunk_index } = chunk.data;
        
        // Store chunk
        if (!this.chunks.has(composite_id)) {
            this.chunks.set(composite_id, new Map());
        }
        this.chunks.get(composite_id).set(chunk_index, chunk);

        // Process complete segments if available
        this.processCompleteSegments(composite_id);
    }

    private processCompleteSegments(compositeId: string): void {
        const compositeChunks = this.chunks.get(compositeId);
        let processedIndex = 0;

        while (true) {
            const chunk = compositeChunks.get(processedIndex);
            if (!chunk) break;

            // Process chunk
            this.processChunk(chunk);
            
            // Remove processed chunk
            compositeChunks.delete(processedIndex);
            processedIndex++;
        }
    }

    private processChunk(chunk: PreviewChunk): void {
        // Decode chunk data
        const videoData = Buffer.from(chunk.data.chunk_data, 'base64');
        
        // Append to video buffer
        this.appendToVideoBuffer(
            chunk.data.composite_id,
            videoData,
            chunk.data.metadata
        );

        // Update progress
        this.updateProgress(chunk);
    }
}
```

### 4.3.3 Preview Completion Handling

```typescript
interface PreviewComplete {
    type: 'preview_complete';
    data: {
        composite_id: string;
        total_chunks: number;
        duration: number;
        urls: {
            preview: string;
            thumbnail: string;
        };
        metadata: {
            format: string;
            resolution: string;
            fps: number;
        };
    };
}

class PreviewCompletionHandler {
    async handlePreviewComplete(
        data: PreviewComplete['data']
    ): Promise<void> {
        // Validate preview completion
        await this.validatePreviewCompletion(data);

        // Generate final assets
        await this.generateFinalAssets(data);

        // Clean up preview resources
        await this.cleanupPreviewResources(data.composite_id);

        // Notify completion
        await this.notifyPreviewComplete(data);
    }

    private async validatePreviewCompletion(
        data: PreviewComplete['data']
    ): Promise<void> {
        // Verify all chunks received
        await this.verifyChunksComplete(data);

        // Validate preview quality
        await this.validatePreviewQuality(data);

        // Check resource availability
        await this.checkResourceAvailability(data);
    }

    private async notifyPreviewComplete(
        data: PreviewComplete['data']
    ): Promise<void> {
        const event: PreviewReadyEvent = {
            type: 'preview.ready',
            data: {
                composite_id: data.composite_id,
                url: data.urls.preview,
                duration: data.duration,
                format: data.metadata.format,
                resolution: data.metadata.resolution
            }
        };

        await this.eventBus.emit('preview.ready', event);
    }
}
```

### 4.3.4 Handling Partial or Corrupted Messages

```typescript
class MessageIntegrityHandler {
    private readonly fragmentedMessages: Map<string, MessageFragment[]>;
    
    handleMessage(data: WebSocketData, context: ConnectionContext): void {
        try {
            // Try to parse as complete message
            const message = this.parseMessage(data);
            this.processMessage(message, context);
        } catch (error) {
            // Check if it's a fragmented message
            if (this.isFragmentedMessage(data)) {
                this.handleFragmentedMessage(data, context);
            } else {
                // Handle corrupted message
                this.handleCorruptedMessage(data, error, context);
            }
        }
    }
    
    private handleFragmentedMessage(
        data: WebSocketData, 
        context: ConnectionContext
    ): void {
        const fragment = this.parseFragment(data);
        const messageId = fragment.messageId;
        
        // Store fragment
        if (!this.fragmentedMessages.has(messageId)) {
            this.fragmentedMessages.set(messageId, []);
        }
        
        this.fragmentedMessages.get(messageId).push(fragment);
        
        // Check if all fragments received
        if (this.isMessageComplete(messageId)) {
            const completeMessage = this.assembleMessage(messageId);
            this.processMessage(completeMessage, context);
            this.fragmentedMessages.delete(messageId);
        }
    }
    
    private handleCorruptedMessage(
        data: WebSocketData,
        error: Error,
        context: ConnectionContext
    ): void {
        // Log corrupted message
        this.logger.warn('Received corrupted message', {
            connectionId: context.connectionId,
            error: error.message,
            dataSize: data.length
        });
        
        // Notify client
        context.socket.send(JSON.stringify({
            type: 'error',
            data: {
                code: 'CORRUPTED_MESSAGE',
                message: 'The message could not be processed due to corruption'
            }
        }));
    }
}
```

## 4.4 Tutorial: Webhook Integration

Set up a webhook to receive real-time NNA events (e.g., composition completion) with this tutorial:

1. **Register Webhook**:

```bash
curl -X POST "https://api.reviz.studio/v1/webhook/register" \
        -H "Authorization: Bearer YOUR_TOKEN" \
        -d '{
            "url": "https://your-app.com/webhook",
            "events": ["composition.complete", "preview.ready"],
            "secret": "YOUR_SECRET"
        }'
```

1. **Handle Events** (Node.js example):

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
    const signature = req.headers['x-nna-signature'];
    const computed = crypto.createHmac('sha256', 'YOUR_SECRET')
                          .update(JSON.stringify(req.body))
                          .digest('hex');
    if (signature !== computed) {
        return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    if (event.type === 'composition.complete') {
        console.log(`Composition ${event.data.composite_id} completed: ${event.data.url}`);
    }
    res.status(200).send('OK');
});

app.listen(3000, () => console.log('Webhook server running'));
```

1. **Test It**:
- Create a composite (Section 3.2.1) and verify your endpoint receives the composition.complete event.

This uses [Section 11.7 - Webhook Integration API](#11-migration-and-updates) for setup and [Section 4 - WebSocket API](#4-web-socket-api) for event specs. See [Implementation Guide, Section 9.4](#9-deployment-and-operations) for deployment tips.

## 4.6 WebSocket Error Handling

### 4.6.1 Error Types and Codes

| **Category** | **Code** | **Description** | **Recovery Action** |
| --- | --- | --- | --- |
| **Connection** | `NNA_WS_CONNECTION_FAILED` | Failed to establish connection | Client should retry with exponential backoff |
| **Connection** | `NNA_WS_CONNECTION_CLOSED` | Connection closed unexpectedly | Reconnect with new connection |
| **Authentication** | `NNA_WS_AUTH_FAILED` | Authentication failed | Refresh credentials and reconnect |
| **Authentication** | `NNA_WS_AUTH_EXPIRED` | Authentication token expired | Refresh token and reconnect |
| **Message** | `NNA_WS_INVALID_MESSAGE` | Invalid message format | Correct format and resend |
| **Message** | `NNA_WS_MESSAGE_TOO_LARGE` | Message exceeds size limit | Break into smaller messages |
| **Subscription** | `NNA_WS_SUB_FAILED` | Subscription failed | Check subscription parameters |
| **Subscription** | `NNA_WS_SUB_LIMIT` | Too many subscriptions | Reduce subscription count |
| **Server** | `NNA_WS_SERVER_ERROR` | Internal server error | Report to support and retry |
| **Server** | `NNA_WS_MAINTENANCE` | Server in maintenance mode | Retry after maintenance window |

### 4.6.2 Error Response Format

```json
{
  "type": "error",
  "data": {
    "code": "NNA_WS_SUB_FAILED",
    "message": "Failed to subscribe to asset updates",
    "details": {
      "reason": "Invalid asset format",
      "provided": "X.01.01.001",
      "expected": "One of: G, S, L, M, W, V"
    },
    "request_id": "req_abc123",
    "timestamp": "2025-02-23T10:30:00Z"
  }
}
```

### 4.6.3 Handling Connection Failures

When a WebSocket connection fails, clients should implement the following recovery strategy: - ****Reconnection Logic****: Use exponential backoff with initial delay of 1s, max delay of 30s, and multiplier of 2 (e.g., 1s, 2s, 4s, etc.).

- **Example**:

```javascript
  let attempts = 0;
  const reconnect = () => {
    const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
    setTimeout(() => {
      ws.connect(); // Retry connection
      attempts++;
    }, delay);
  };
  ws.on('close', reconnect);
```

- **Recovery strategy:**

```javascript
class RobustWebSocketClient {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            maxReconnectAttempts: 10,
            baseDelay: 1000,
            maxDelay: 30000,
            ...options
        };
        this.reconnectAttempts = 0;
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
    }
    
    onClose(event) {
        if (event.code !== 1000) { // Not a clean close
            this.attemptReconnect();
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            this.emit('permanent_disconnect', {
                attempts: this.reconnectAttempts,
                message: 'Max reconnection attempts reached'
            });
            return;
        }
        
        const delay = Math.min(
            this.options.baseDelay * Math.pow(2, this.reconnectAttempts),
            this.options.maxDelay
        );
        
        setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }
    
    // Handle an error response from the server
    handleErrorMessage(errorData) {
        switch(errorData.code) {
            case 'NNA_WS_AUTH_EXPIRED':
                // Refresh authentication and reconnect
                this.refreshAuth().then(() => this.reconnect());
                break;
                
            case 'NNA_WS_SUB_LIMIT':
                // Clean up existing subscriptions before adding new ones
                this.cleanupSubscriptions().then(() => {
                    this.emit('subscription_limit', errorData);
                });
                break;
                
            case 'NNA_WS_MAINTENANCE':
                // Schedule a reconnection after the maintenance window
                const retryAfter = errorData.details?.retryAfter || 300000; // Default 5 min
                setTimeout(() => this.reconnect(), retryAfter);
                break;
                
            default:
                // For other errors, emit an event for the application to handle
                this.emit('error', errorData);
        }
    }
}
```

### 4.6.4 Subscription Error Recovery

When subscription errors occur, clients should handle them based on the specific error code:

```javascript
// Example subscription error handling
websocket.on('message', (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'error') {
        const { code, details } = message.data;
        
        switch(code) {
            case 'NNA_WS_SUB_FAILED':
                // Fix the subscription parameters and retry
                if (details.reason === 'Invalid asset format') {
                    const correctedAsset = correctAssetFormat(details.provided);
                    sendSubscription(correctedAsset);
                }
                break;
                
            case 'NNA_WS_SUB_LIMIT':
                // Unsubscribe from less important topics to make room
                unsubscribeLowPriorityTopics().then(() => {
                    // Retry the subscription
                    sendSubscription(originalSubscription);
                });
                break;
        }
    }
});
```

### 4.6.5 Server-Side Error Logging

Server-side, the NNA Framework logs all WebSocket errors with the following structure:

```typescript
interface WebSocketErrorLog {
    code: string;               // Error code
    message: string;            // Human-readable message
    connectionId: string;       // Unique connection identifier
    userId?: string;            // User ID if authenticated
    timestamp: string;          // ISO timestamp
    requestId?: string;         // Request ID if available
    subscriptionId?: string;    // Subscription ID if relevant
    clientInfo: {
        ip: string;             // Client IP address
        userAgent: string;      // User agent string
        connectionDuration: number; // Connection duration in ms
    };
    errorDetails: any;          // Error-specific details
}
```

This structured logging enables efficient troubleshooting and pattern recognition for WebSocket-related issues.

### 4.6.6 WebSocket Error Metrics

The NNA Framework tracks the following metrics for WebSocket errors:

- `websocket_errors_total{code="<error_code>"}`: Total count of errors by code
- `websocket_connection_failures_total`: Total connection failures
- `websocket_reconnect_attempts_total`: Total reconnection attempts
- `websocket_subscription_failures_total`: Total subscription failures
- `websocket_message_errors_total`: Total message-related errors

These metrics can be used to set up alerts and monitor the health of WebSocket connections across the platform.

For more details on WebSocket implementation, see the [NNA Framework Technical Implementation Guide](https://celerity.slab.com/posts/xfxe04qg#hs2lg-4-web-socket-api).

# 5. Advanced Features

## 5.1 Version Management

### 5.1.1 Version Control System

```typescript
interface VersionMetadata {
    version: string;
    created_at: string;
    created_by: string;
    changes: VersionChange[];
    metadata: {
        release_notes: string;
        compatibility: string[];
    };
}

class VersionManager {
    async createVersion(
        assetId: string,
        versionData: VersionData
    ): Promise<Version> {
        // Validate version data
        await this.validateVersion(versionData);

        // Create version record
        const version = await this.createVersionRecord(assetId, versionData);

        // Apply changes
        await this.applyVersionChanges(version);

        // Update relationships
        await this.updateVersionRelationships(version);

        return version;
    }

    private async validateVersion(versionData: VersionData): Promise<void> {
        // Check version format
        if (!this.isValidVersionFormat(versionData.version)) {
            throw new ValidationError('Invalid version format');
        }

        // Validate changes
        await this.validateVersionChanges(versionData.changes);

        // Check compatibility
        await this.checkVersionCompatibility(versionData);
    }
}
```

### 5.1.2 Version Migration

```typescript
class VersionMigration {
    async migrateToVersion(
        assetId: string,
        targetVersion: string
    ): Promise<MigrationResult> {
        // Get migration path
        const migrationPath = await this.calculateMigrationPath(
            assetId,
            targetVersion
        );

        // Validate migration
        await this.validateMigration(migrationPath);

        // Execute migration steps
        const results = await this.executeMigration(migrationPath);

        // Verify migration
        await this.verifyMigration(results);

        return results;
    }

    private async calculateMigrationPath(
        assetId: string,
        targetVersion: string
    ): Promise<MigrationStep[]> {
        const currentVersion = await this.getCurrentVersion(assetId);
        return this.getMigrationSteps(currentVersion, targetVersion);
    }
}
```

## 5.2 Bulk Operations

### 5.2.1 Batch Processing System

```typescript
interface BatchOperation<T> {
    operation: 'create' | 'update' | 'delete';
    items: T[];
    options: BatchOptions;
}

class BatchProcessor {
    async processBatch<T>(
        operation: BatchOperation<T>
    ): Promise<BatchResult<T>> {
        // Initialize batch
        const batch = await this.initializeBatch(operation);

        try {
            // Process items in chunks
            const results = await this.processInChunks(batch);

            // Handle failures
            await this.handleFailures(results);

            return this.formatBatchResults(results);
        } catch (error) {
            await this.handleBatchError(error, batch);
            throw error;
        }
    }

    private async processInChunks<T>(
        batch: BatchOperation<T>
    ): Promise<ProcessingResult[]> {
        const chunkSize = this.calculateOptimalChunkSize(batch);
        const chunks = this.splitIntoChunks(batch.items, chunkSize);

        return Promise.all(
            chunks.map(chunk => this.processChunk(chunk, batch.options))
        );
    }
}
```

### 5.2.2 Bulk Rights Management

```typescript
interface BulkRightsUpdate {
    assets: string[];
    rights: RightsUpdate;
    validation: ValidationOptions;
}

class BulkRightsManager {
    async updateRights(
        update: BulkRightsUpdate
    ): Promise<BulkRightsResult> {
        // Validate rights update
        await this.validateRightsUpdate(update);

        // Process in batches
        const results = await this.processBatchedRightsUpdates(update);

        // Handle conflicts
        await this.handleRightsConflicts(results);

        return this.consolidateResults(results);
    }

    private async processBatchedRightsUpdates(
        update: BulkRightsUpdate
    ): Promise<RightsUpdateResult[]> {
        const batches = this.createRightsBatches(update);
        
        return Promise.all(
            batches.map(batch => this.processRightsBatch(batch))
        );
    }
}
```

## 5.3 Dynamic Asset Generation

### 5.3.1 Asset Generation Pipeline

```typescript
interface GenerationConfig {
    baseAsset: string;
    variations: VariationParams[];
    constraints: GenerationConstraints;
}

class DynamicAssetGenerator {
    async generateAssets(
        config: GenerationConfig
    ): Promise<GenerationResult> {
        // Initialize generation context
        const context = await this.createGenerationContext(config);

        // Generate variations
        const variations = await this.generateVariations(context);

        // Apply constraints
        const validVariations = await this.applyConstraints(
            variations,
            config.constraints
        );

        // Process outputs
        return this.processGeneratedAssets(validVariations);
    }

    private async generateVariations(
        context: GenerationContext
    ): Promise<AssetVariation[]> {
        return Promise.all(
            context.variations.map(params => 
                this.generateVariation(context.baseAsset, params)
            )
        );
    }
}
```

### 5.3.2 ML Integration

```typescript
class MLIntegration {
    async analyzeAsset(assetId: string): Promise<MLAnalysis> {
        return {
            style_analysis: await this.analyzeStyle(assetId),
            movement_analysis: await this.analyzeMovement(assetId),
            compatibility_scores: await this.generateCompatibilityScores(assetId)
        };
    }

    private async analyzeStyle(assetId: string): Promise<StyleAnalysis> {
        const asset = await this.loadAsset(assetId);
        
        return {
            primary_style: await this.detectPrimaryStyle(asset),
            style_elements: await this.extractStyleElements(asset),
            confidence_scores: await this.calculateStyleConfidence(asset)
        };
    }
}
```

## 5.4 Advanced Caching

### 5.4.1 Multi-tier Cache Implementation

```typescript
class MultiTierCache {
    private readonly caches: Map<CacheTier, Cache>;

    async get<T>(key: string): Promise<T | null> {
        // Try each cache tier
        for (const tier of this.getTiers()) {
            const result = await this.getFromTier<T>(tier, key);
            if (result) {
                // Propagate to higher tiers
                await this.propagateToHigherTiers(tier, key, result);
                return result;
            }
        }
        return null;
    }

    private async propagateToHigherTiers<T>(
        fromTier: CacheTier,
        key: string,
        value: T
    ): Promise<void> {
        const tiers = this.getHigherTiers(fromTier);
        await Promise.all(
            tiers.map(tier => this.caches.get(tier).set(key, value))
        );
    }
}
```

## 5.5 Advanced Use Case: Batch Video Processing

Process multiple videos efficiently using batch APIs:

1. **Batch Resolve Assets**:

```bash
curl -X POST "https://api.reviz.studio/v1/asset/batch/resolve" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
         "assets": ["G.01.TSW.001", "S.01.01.001", "L.06.03.001"],
         "options": {"parallel": true, "include_metadata": true}
     }'
```

1. **Create Composites**:

```javascript
const { NNAClient } = require('@reviz/nna-sdk');
const client = new NNAClient({ apiKey: 'YOUR_API_KEY' });

async function batchProcess() {
    const assets = await client.asset.batch(['G.01.TSW.001', 'S.01.01.001', 'L.06.03.001']);
    const composites = await Promise.all(
        assets.results.map(asset =>
            client.composition.create({
                components: { song: asset.data.asset_id, star: 'S.01.01.001' },
                options: { resolution: '1920x1080', format: 'mp4' }
            })
        )
    );
    return composites;
}

batchProcess().then(console.log).catch(console.error);
```

1. **Monitor Status**:
    - Use WebSocket (Section 4) or poll /v1/composition/{composite_id}/status.

This builds on [Section 5.2 - Bulk Operations](#5-advanced-features) and [Implementation Guide, Section 3.1 - Asset Resolution](#3-service-layer-implementation).

# 6. Integration Guidelines

## 6.1 AlgoRhythm AI Integration

Integrate with AlgoRhythm to fetch AI-powered asset recommendations using REST and WebSocket APIs. AlgoRhythm provides content analysis, compatibility scoring, and personalized suggestions, enhancing NNA’s asset management. For detailed integration workflows, architecture, and examples, see [AlgoRhythm, Section 4](https://algorhythm.md#section-4). Configuration specifics are in [NNA Technical Implementation Guide, Section 4.2](https://nna-technical-implementation-guide.md#section-4.2), with WebSocket event details in [Section 4 - WebSocket API](#section-4-websocket-api-real-time-communication).

Below is an example workflow:

1. **Resolve Base Asset**:

```bash
curl -X GET "https://api.reviz.studio/v1/asset/resolve/G.01.TSW.001" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

1. **Create Composition with Recommendations**
1. Use AlgoRhythm’s suggestions via WebSocket:

```typescript
const ws = new WebSocket('wss://api.reviz.studio/v1/preview');
ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'subscribe_preview',
        data: { composite_id: 'comp_123', quality: 'medium' }
    }));
};
ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'preview.ready') {
        console.log('Recommended preview:', msg.data.url);
    }
};
```

1. **Submit composition:**

```bash
curl -X POST "https://api.reviz.studio/v1/composition/create" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"components": {"song": "G.01.TSW.001", "star": "S.01.01.001"}, "options": {"resolution": "1920x1080"}}'
```

```typescript
class AlgoRhythmClient {
    async getRecommendations(assetId: string): Promise<Recommendations> {
        const response = await fetch(`https://api.reviz.studio/v1/asset/resolve/${assetId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const asset = await response.json();
        // Assume AlgoRhythm processes internally and triggers WebSocket
        return { suggestions: [{ assetId: 'S.01.01.001', score: 0.95 }] };
    }
}
```

For configuration details, see [NNA Technical Implementation Guide, Section 4.2](https://celerity.slab.com/posts/nna-framework-technical-implementation-guide-xfxe04qg#hlcdp-4-2-cross-platform-integration).

Full WebSocket event specs are in [Section 4](#hs2lg-4-web-socket-api).

### 6.1.1 Recommendation Engine Integration

```typescript
class AlgoRhythmIntegration {
    async getRecommendations(
        context: RecommendationContext
    ): Promise<Recommendations> {
        // Initialize AI client
        const aiClient = await this.initializeAIClient({
            modelVersion: 'v2.1',
            features: ['content-based', 'collaborative']
        });

        // Get recommendations
        const recommendations = await aiClient.recommend({
            userId: context.userId,
            assetId: context.assetId,
            layer: context.layer,
            limit: context.limit
        });

        // Enrich recommendations
        return this.enrichRecommendations(recommendations);
    }

    private async enrichRecommendations(
        recommendations: AIRecommendation[]
    ): Promise<EnrichedRecommendation[]> {
        return Promise.all(
            recommendations.map(async rec => ({
                ...rec,
                metadata: await this.getAssetMetadata(rec.assetId),
                compatibility: await this.checkCompatibility(rec.assetId),
                preview: await this.generatePreview(rec.assetId)
            }))
        );
    }
}
```

### 6.1.2 Model Integration

```typescript
class ModelIntegration {
    async integrateModel(
        modelConfig: ModelConfig
    ): Promise<ModelIntegrationResult> {
        // Validate model
        await this.validateModel(modelConfig);

        // Set up model endpoints
        const endpoints = await this.setupModelEndpoints(modelConfig);

        // Configure integration
        await this.configureIntegration(modelConfig, endpoints);

        // Test integration
        await this.testIntegration(endpoints);

        return {
            status: 'active',
            endpoints,
            configuration: modelConfig
        };
    }
}
```

## 6.2 External System Integration

### 6.2.1 Platform Adapters

```typescript
interface PlatformConfig {
    name: string;
    version: string;
    capabilities: Set<string>;
    constraints: {
        maxFileSize: number;
        supportedFormats: string[];
        maxResolution: Resolution;
    };
}

class PlatformAdapter {
    async adaptContent(
        content: Content,
        platform: string
    ): Promise<AdaptedContent> {
        const config = await this.getPlatformConfig(platform);
        
        // Adapt content based on platform capabilities
        return {
            ...content,
            format: await this.adaptFormat(content, config),
            resolution: await this.adaptResolution(content, config),
            metadata: await this.adaptMetadata(content, config)
        };
    }

    private async adaptFormat(
        content: Content,
        config: PlatformConfig
    ): Promise<string> {
        if (config.constraints.supportedFormats.includes(content.format)) {
            return content.format;
        }
        return this.convertFormat(
            content,
            config.constraints.supportedFormats[0]
        );
    }
}
```

### 6.2.2 Data Synchronization

```typescript
class DataSyncManager {
    async synchronize(
        source: ExternalSystem,
        options: SyncOptions
    ): Promise<SyncResult> {
        // Start sync transaction
        const transaction = await this.startSyncTransaction(source);

        try {
            // Fetch external data
            const externalData = await this.fetchExternalData(source);

            // Apply transformations
            const transformed = await this.transformData(
                externalData,
                options.mappings
            );

            // Validate data
            await this.validateData(transformed);

            // Apply changes
            const result = await this.applyChanges(transformed);

            // Commit transaction
            await transaction.commit();

            return result;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
```

## 6.3 CDN Integration

```typescript
class CDNIntegration {
    async configureCDN(
        config: CDNConfig
    ): Promise<CDNConfigurationResult> {
        // Validate configuration
        await this.validateConfig(config);
        
        // Set up CDN routes
        const routes = await this.setupCDNRoutes(config);
        
        // Configure caching rules
        const cachingRules = await this.configureCaching(config.caching);
        
        // Set up security
        const security = await this.configureSecurity(config.security);
        
        return {
            status: 'configured',
            endpoints: this.generateEndpoints(routes),
            caching: cachingRules,
            security,
            performance: await this.estimatePerformance(config)
        };
    }
    
    private async setupCDNRoutes(
        config: CDNConfig
    ): Promise<CDNRoute[]> {
        return [
            await this.setupAssetRoute(config),
            await this.setupPreviewRoute(config),
            await this.setupCompositesRoute(config)
        ];
    }
    
    private async configureCaching(
        config: CachingConfig
    ): Promise<CachingRules> {
        return {
            assets: {
                ttl: config.assetTTL || 86400, // 24 hours
                cacheable: this.getCacheableStatuses(),
                invalidation: await this.setupInvalidation(config)
            },
            previews: {
                ttl: config.previewTTL || 3600, // 1 hour
                cacheable: ['ready'],
                invalidation: await this.setupInvalidation(config)
            }
        };
    }
}
```

## 6.4 Mobile SDK Integration

```typescript
class MobileSDKIntegration {
    async integrateMobile(
        config: MobileConfig
    ): Promise<MobileIntegrationResult> {
        // Set up platform-specific configurations
        const platforms = await Promise.all([
            this.configureIOS(config.ios),
            this.configureAndroid(config.android)
        ]);
        
        // Set up offline capabilities
        const offlineCapabilities = await this.configureOffline(config.offline);
        
        // Configure performance optimizations
        const performanceOptimizations = await this.configurePerformance(config.performance);
        
        return {
            platforms,
            offlineCapabilities,
            performanceOptimizations,
            initialization: this.generateInitializationCode(platforms)
        };
    }
    
    private async configureIOS(
        config: IOSConfig
    ): Promise<IOSConfiguration> {
        return {
            minimumVersion: config.minimumVersion || '14.0',
            frameworks: this.getRequiredFrameworks(),
            podDependencies: this.generatePodfile(),
            permissions: this.getRequiredPermissions(),
            capabilities: await this.configureCapabilities(config)
        };
    }
    
    private async configureAndroid(
        config: AndroidConfig
    ): Promise<AndroidConfiguration> {
        return {
            minimumSDK: config.minimumSDK || 23,
            targetSDK: config.targetSDK || 33,
            dependencies: this.generateGradleDependencies(),
            permissions: this.getRequiredPermissions(),
            proguardRules: this.generateProguardRules()
        };
    }
    
    private async configureOffline(
        config: OfflineConfig
    ): Promise<OfflineCapabilities> {
        return {
            cacheStrategy: config.strategy || 'network-first',
            persistenceOptions: await this.configurePersistence(config),
            syncBehavior: config.syncBehavior || 'automatic',
            maxOfflineSize: config.maxSize || '100MB'
        };
    }
}
```

### 6.4.1 Swift Code for iOS

```swift
// Example iOS SDK integration
import NNAFramework

class VideoRemixViewController: UIViewController {
    private let nnaClient = NNAClient(apiKey: "YOUR_API_KEY")
    private let assetCollectionView: UICollectionView!
    private var assets: [NNAAsset] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupCollectionView()
        loadAssets()
    }
    
    private func loadAssets() {
        // Configure offline support
        let offlineConfig = NNAOfflineConfig(
            cacheStrategy: .networkFirst,
            maxCacheSize: 100 * 1024 * 1024, // 100MB
            ttl: 3600 // 1 hour
        )
        
        // Set up mobile-optimized request
        let request = NNAAssetRequest(
            layer: .song,
            category: "pop",
            limit: 20,
            offlineConfig: offlineConfig,
            optimizeForMobile: true
        )
        
        // Load assets with mobile optimization
        nnaClient.getAssets(request) { [weak self] result in
            switch result {
            case .success(let assets):
                DispatchQueue.main.async {
                    self?.assets = assets
                    self?.assetCollectionView.reloadData()
                }
            case .failure(let error):
                self?.handleError(error)
            }
        }
    }
    
    private func createRemix(baseAsset: NNAAsset) {
        // Create composition with mobile optimization
        let compositionRequest = NNACompositionRequest(
            baseAsset: baseAsset,
            options: NNACompositionOptions(
                resolution: "720p",
                format: "mp4",
                optimizeForMobile: true
            )
        )
        
        nnaClient.createComposition(compositionRequest) { [weak self] result in
            switch result {
            case .success(let composition):
                self?.presentComposition(composition)
            case .failure(let error):
                self?.handleError(error)
            }
        }
    }
    
    // Set up WebSocket for real-time preview
    private func setupRealtimePreview(compositionId: String) {
        nnaClient.connectToPreviewSocket(compositionId) { [weak self] event in
            switch event {
            case .connected:
                print("Preview socket connected")
            case .previewReady(let url):
                self?.updatePreviewPlayer(url: url)
            case .progressUpdate(let progress):
                self?.updateProgressBar(progress: progress)
            case .error(let error):
                self?.handleSocketError(error)
            }
        }
    }
}
```

## 6.5 Web Client Integration

```typescript
class WebClientIntegration {
    async integrateWebClient(
        config: WebClientConfig
    ): Promise<WebIntegrationResult> {
        // Configure bundles
        const bundles = await this.configureBundles(config.bundling);
        
        // Set up lazy loading
        const lazyLoading = await this.configureLazyLoading(config.lazyLoading);
        
        // Initialize authentication
        const auth = await this.configureAuth(config.auth);
        
        return {
            bundles,
            lazyLoading,
            auth,
            initialization: this.generateInitCode(config),
            responsive: await this.configureResponsive(config.responsive)
        };
    }
    
    private async configureBundles(
        config: BundlingConfig
    ): Promise<BundleConfig> {
        return {
            core: {
                size: '45KB',
                includes: ['auth', 'core', 'events']
            },
            asset: {
                size: '30KB',
                includes: ['asset-resolution', 'search']
            },
            composer: {
                size: '120KB',
                includes: ['composition', 'preview', 'websocket']
            }
        };
    }
    
    private generateInitCode(config: WebClientConfig): string {
        return `
// Initialize NNA Web Client
import { NNAClient } from '@reviz/nna-web';

const client = new NNAClient({
    apiKey: '${config.apiKey || 'YOUR_API_KEY'}',
    environment: '${config.environment || 'production'}',
    bundleMode: '${config.bundling?.mode || 'auto'}',
    auth: {
        type: '${config.auth?.type || 'implicit'}',
        redirectUri: '${config.auth?.redirectUri || 'https://your-app.com/callback'}'
    }
});

// Example asset resolution
client.asset.resolve('S.01.01.001')
    .then(asset => console.log(asset))
    .catch(error => console.error(error));
`;
    }
}
```

## 6.6 Security Integration

### 6.6.1 Authentication Integration

```typescript
class SecurityProvider {
    async integrateSecurity(
        provider: string,
        options: SecurityOptions
    ): Promise<SecurityContext> {
        const implementation = this.getSecurityImplementation(provider);
        
        // Initialize security context
        const context = await implementation.initialize(options);

        // Set up security handlers
        await this.setupSecurityHandlers(context);

        // Configure monitoring
        await this.configureSecurityMonitoring(context);

        return context;
    }

    private async setupSecurityHandlers(
        context: SecurityContext
    ): Promise<void> {
        await Promise.all([
            this.setupAuthenticationHandler(context),
            this.setupAuthorizationHandler(context),
            this.setupAuditHandler(context)
        ]);
    }
}
```

### 6.6.2 Secure Asset Transfer

```typescript
class SecureAssetTransfer {
    async transferAsset(
        asset: Asset,
        destination: Destination,
        options: TransferOptions
    ): Promise<TransferResult> {
        // Create secure channel
        const channel = await this.createSecureChannel(destination);

        try {
            // Encrypt asset
            const encrypted = await this.encryptAsset(
                asset,
                options.encryption
            );

            // Transfer asset
            const result = await this.transferEncrypted(
                encrypted,
                channel,
                options.transfer
            );

            // Verify transfer
            await this.verifyTransfer(result, options.verification);

            return result;
        } finally {
            await channel.close();
        }
    }
}
```

## 6.7 Integration Best Practices

### 6.7.1 Error Handling

```typescript
class IntegrationErrorHandler {
    async handleError(
        error: Error,
        context: IntegrationContext
    ): Promise<void> {
        // Log error
        await this.logError(error, context);

        // Determine error type
        const errorType = this.categorizeError(error);

        // Apply recovery strategy
        await this.applyRecoveryStrategy(errorType, context);

        // Notify if needed
        await this.notifyError(error, context);
    }

    private async applyRecoveryStrategy(
        errorType: ErrorType,
        context: IntegrationContext
    ): Promise<void> {
        const strategy = this.getRecoveryStrategy(errorType);
        await strategy.execute(context);
    }
}
```

### 6.7.2 Performance Optimization

```typescript
class PerformanceOptimizer {
    async optimize(
        integration: Integration,
        config: OptimizationConfig
    ): Promise<OptimizationResult> {
        // Analyze current performance
        const baseline = await this.measureBaseline(integration);

        // Apply optimizations
        const optimizations = await this.applyOptimizations(
            integration,
            config
        );

        // Measure improvements
        const results = await this.measureResults(optimizations);

        // Validate improvements
        await this.validateOptimizations(results, baseline);

        return results;
    }

    private async applyOptimizations(
        integration: Integration,
        config: OptimizationConfig
    ): Promise<AppliedOptimizations> {
        return {
            caching: await this.optimizeCache(integration, config),
            batching: await this.optimizeBatching(integration, config),
            connection: await this.optimizeConnection(integration, config),
            compression: await this.optimizeCompression(integration, config),
            concurrency: await this.optimizeConcurrency(integration, config)
        };
    }

    private async optimizeCache(
        integration: Integration,
        config: OptimizationConfig
    ): Promise<CacheOptimization> {
        return {
            hitRate: await this.optimizeCacheHitRate(integration),
            distribution: await this.optimizeCacheDistribution(integration),
            invalidation: await this.optimizeInvalidationStrategy(integration),
            warmup: await this.optimizeWarmupStrategy(integration, config)
        };
    }

    private async optimizeConcurrency(
        integration: Integration,
        config: OptimizationConfig
    ): Promise<ConcurrencyOptimization> {
        // Analyze current usage patterns
        const usage = await this.analyzeUsagePatterns(integration);

        // Calculate optimal concurrency
        const optimal = this.calculateOptimalConcurrency(usage);

        // Apply concurrency limits
        await this.applyConcurrencyLimits(integration, optimal);

        return {
            maxConcurrent: optimal.maxConcurrent,
            batchSize: optimal.batchSize,
            queueSize: optimal.queueSize,
            throttling: optimal.throttling
        };
    }
}
```

## 6.7.3 Resource Management

```typescript
class ResourceManager {
    async manageResources(
        integration: Integration,
        config: ResourceConfig
    ): Promise<ResourceMetrics> {
        // Monitor current usage
        const usage = await this.monitorResourceUsage(integration);

        // Apply resource limits
        await this.applyResourceLimits(integration, config.limits);

        // Set up cleanup tasks
        await this.setupCleanupTasks(integration, config.cleanup);

        // Configure auto-scaling
        await this.configureAutoScaling(integration, config.scaling);

        return this.calculateResourceMetrics(usage);
    }

    private async monitorResourceUsage(
        integration: Integration
    ): Promise<ResourceUsage> {
        return {
            memory: await this.trackMemoryUsage(integration),
            cpu: await this.trackCPUUsage(integration),
            connections: await this.trackConnections(integration),
            storage: await this.trackStorageUsage(integration)
        };
    }
}
```

## 6.8 Monitoring and Observability

### 6.8.1 Integration Monitoring

```typescript
class IntegrationMonitor {
    async monitorIntegration(
        integration: Integration,
        config: MonitoringConfig
    ): Promise<MonitoringResults> {
        // Set up metrics collection
        const metrics = await this.setupMetricsCollection(integration);

        // Configure alerts
        await this.configureAlerts(integration, config.alerts);

        // Initialize logging
        await this.initializeLogging(integration, config.logging);

        // Start monitoring
        return this.startMonitoring(integration, metrics);
    }

    private async setupMetricsCollection(
        integration: Integration
    ): Promise<MetricsCollector> {
        return {
            latency: new LatencyCollector(integration),
            throughput: new ThroughputCollector(integration),
            errors: new ErrorCollector(integration),
            resources: new ResourceCollector(integration)
        };
    }
}
```

### 6.8.2 Health Checks

```typescript
class HealthChecker {
    async performHealthCheck(
        integration: Integration
    ): Promise<HealthStatus> {
        const checks = await Promise.all([
            this.checkConnectivity(integration),
            this.checkAuthentication(integration),
            this.checkDataSync(integration),
            this.checkResources(integration)
        ]);

        return {
            status: this.determineOverallStatus(checks),
            components: this.aggregateComponentStatus(checks),
            lastChecked: new Date().toISOString(),
            details: this.compileHealthDetails(checks)
        };
    }

    private determineOverallStatus(
        checks: HealthCheck[]
    ): 'healthy' | 'degraded' | 'unhealthy' {
        const failedChecks = checks.filter(check => !check.passed);
        const degradedChecks = checks.filter(check => check.degraded);

        if (failedChecks.length > 0) return 'unhealthy';
        if (degradedChecks.length > 0) return 'degraded';
        return 'healthy';
    }
}
```

## 6.9 Integration Testing

### 6.9.1 Testing Framework

```typescript
class IntegrationTester {
    async runTests(
        integration: Integration,
        config: TestConfig
    ): Promise<TestResults> {
        // Set up test environment
        const env = await this.setupTestEnvironment(integration);

        try {
            // Run test suites
            const results = await Promise.all([
                this.runConnectionTests(env),
                this.runAuthenticationTests(env),
                this.runDataSyncTests(env),
                this.runPerformanceTests(env)
            ]);

            return this.aggregateResults(results);
        } finally {
            // Cleanup test environment
            await this.cleanupTestEnvironment(env);
        }
    }

    private async runPerformanceTests(
        env: TestEnvironment
    ): Promise<PerformanceTestResults> {
        return {
            latency: await this.testLatency(env),
            throughput: await this.testThroughput(env),
            concurrency: await this.testConcurrency(env),
            resourceUsage: await this.testResourceUsage(env)
        };
    }
}
```

### 6.9.2 Load Testing

```typescript
class LoadTester {
    async performLoadTest(
        integration: Integration,
        config: LoadTestConfig
    ): Promise<LoadTestResults> {
        // Initialize load test
        const test = await this.initializeLoadTest(config);

        // Ramp up load
        await this.rampUpLoad(test, config.rampUp);

        // Maintain steady state
        await this.maintainSteadyState(test, config.steadyState);

        // Ramp down
        await this.rampDown(test, config.rampDown);

        return this.analyzeResults(test);
    }

    private async maintainSteadyState(
        test: LoadTest,
        config: SteadyStateConfig
    ): Promise<void> {
        const duration = config.duration;
        const targetRPS = config.targetRPS;
        const monitor = new LoadTestMonitor(test);

        while (test.elapsed < duration) {
            await this.adjustLoad(test, targetRPS);
            await monitor.checkMetrics();
            await this.sleep(config.checkInterval);
        }
    }
    
    // Helper method to sleep for a specified number of milliseconds
    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    private async adjustLoad(test: LoadTest, targetRPS: number): Promise<void> {
        const currentRPS = test.currentRPS;
        
        if (currentRPS < targetRPS * 0.9) {
            // Too slow, increase load
            await this.increaseLoad(test, targetRPS);
        } else if (currentRPS > targetRPS * 1.1) {
            // Too fast, decrease load
            await this.decreaseLoad(test, targetRPS);
        }
        
        // Update metrics
        test.updatedAt = Date.now();
        test.metrics.push({
            timestamp: test.updatedAt,
            rps: currentRPS,
            targetRPS: targetRPS,
            activeUsers: test.activeUsers,
            cpuUtilization: await this.getCPUUtilization(),
            memoryUsage: await this.getMemoryUsage()
        });
    }
}
```

## 6.10 Documentation and Support

### 6.10.1 Integration Documentation

```typescript
class DocumentationGenerator {
    async generateDocs(
        integration: Integration,
        config: DocConfig
    ): Promise<Documentation> {
        // Generate API documentation
        const apiDocs = await this.generateApiDocs(integration);

        // Generate integration guides
        const guides = await this.generateGuides(integration);

        // Generate example code
        const examples = await this.generateExamples(integration);

        return {
            api: apiDocs,
            guides,
            examples,
            searchIndex: await this.createSearchIndex([apiDocs, guides, examples])
        };
    }

    private async generateApiDocs(
        integration: Integration
    ): Promise<ApiDocumentation> {
        return {
            endpoints: await this.documentEndpoints(integration),
            authentication: await this.documentAuth(integration),
            errors: await this.documentErrors(integration),
            schemas: await this.documentSchemas(integration)
        };
    }
}
```

### 6.10.2 Support Systems

```
class SupportSystem {
    async setupSupport(
        integration: Integration,
        config: SupportConfig
    ): Promise<SupportServices> {
        // Initialize support channels
        const channels = await this.initializeSupportChannels(config);

        // Set up issue tracking
        const issueTracker = await this.setupIssueTracking(config);

        // Configure knowledge base
        const knowledgeBase = await this.setupKnowledgeBase(config);

        return {
            channels,
            issueTracker,
            knowledgeBase,
            metrics: await this.initializeSupportMetrics()
        };
    }

    private async handleSupportRequest(
        request: SupportRequest
    ): Promise<SupportResponse> {
        // Categorize request
        const category = await this.categorizeRequest(request);

        // Route to appropriate handler
        const handler = this.getSupportHandler(category);

        // Process request
        return handler.handleRequest(request);
    }
}

```

# 7. SDKs and Tools

## 7.1 Official SDKs

### 7.1.1 JavaScript/TypeScript SDK

```typescript
import { NNAClient } from '@reviz/nna-sdk';

class NNAClient {
    private config: NNAConfig;
    private assetClient: AssetClient;
    private rightsClient: RightsClient;
    private cacheClient: CacheClient;

    constructor(config: NNAConfig) {
        this.config = this.validateConfig(config);
        this.initializeClients();
    }

    // Asset Management
    public readonly asset = {
        resolve: async (address: string): Promise<Asset> => {
            return this.assetClient.resolve(address);
        },
        
        batch: async (addresses: string[]): Promise<BatchResponse> => {
            return this.assetClient.batchResolve(addresses);
        },
        
        preview: async (options: PreviewOptions): Promise<Preview> => {
            return this.assetClient.generatePreview(options);
        }
    };

    // Rights Management
    public readonly rights = {
        verify: async (assetId: string): Promise<Rights> => {
            return this.rightsClient.verify(assetId);
        },
        
        grant: async (options: GrantOptions): Promise<Rights> => {
            return this.rightsClient.grant(options);
        }
    };

    // Error Handling
    private handleError(error: NNAError): never {
        error.sdkVersion = this.config.version;
        error.timestamp = new Date().toISOString();
        throw error;
    }
}

// Usage Example
const client = new NNAClient({
    apiKey: 'YOUR_API_KEY',
    environment: 'production'
});

const asset = await client.asset.resolve('S.01.01.001');
```

### 7.1.2 Python SDK

```python
from reviz.nna import NNAClient
from reviz.nna.types import Asset, Preview, Rights

class NNAClient:
    def __init__(self, api_key: str, environment: str = "production"):
        self.config = self._validate_config({
            "api_key": api_key,
            "environment": environment
        })
        self._initialize_clients()

    async def resolve_asset(self, asset_id: str) -> Asset:
        try:
            return await self.asset_client.resolve(asset_id)
        except NNAError as e:
            await self._handle_error(e)
            raise

    async def batch_resolve(
        self,
        asset_ids: List[str],
        options: Optional[Dict] = None
    ) -> List[Asset]:
        try:
            return await self.asset_client.batch_resolve(asset_ids, options)
        except NNAError as e:
            await self._handle_error(e)
            raise

    async def generate_preview(
        self,
        options: PreviewOptions
    ) -> Preview:
        try:
            return await self.preview_client.generate(options)
        except NNAError as e:
            await self._handle_error(e)
            raise

# Usage Example
client = NNAClient(api_key="YOUR_API_KEY")
asset = await client.resolve_asset("S.01.01.001")
```

### 7.1.3 Java SDK

```java
import com.reviz.nna.NNAClient;
import com.reviz.nna.models.*;

public class NNAClient {
    private final AssetClient assetClient;
    private final RightsClient rightsClient;
    private final CacheClient cacheClient;

    public NNAClient(NNAConfig config) {
        this.config = validateConfig(config);
        initializeClients();
    }

    public CompletableFuture<Asset> resolveAsset(String assetId) {
        return assetClient.resolve(assetId)
            .handle((result, error) -> {
                if (error != null) {
                    return handleError(error);
                }
                return result;
            });
    }

    public CompletableFuture<BatchResponse> batchResolve(
        List<String> assetIds,
        BatchOptions options
    ) {
        return assetClient.batchResolve(assetIds, options)
            .handle((result, error) -> {
                if (error != null) {
                    return handleError(error);
                }
                return result;
            });
    }

    private <T> T handleError(Throwable error) {
        if (error instanceof NNAException) {
            NNAException nnaError = (NNAException) error;
            nnaError.setSdkVersion(config.getVersion());
            nnaError.setTimestamp(Instant.now());
            throw nnaError;
        }
        throw new NNAException("Unexpected error", error);
    }
}

// Usage Example
NNAClient client = new NNAClient(NNAConfig.builder()
    .apiKey("YOUR_API_KEY")
    .environment("production")
    .build());

Asset asset = client.resolveAsset("S.01.01.001").get();
```

## 7.2 Development Tools

### 7.2.1 CLI Tool

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { NNAClient } from '@reviz/nna-sdk';

class NNACLI {
    private readonly program: Command;
    private readonly client: NNAClient;

    constructor() {
        this.program = new Command();
        this.client = new NNAClient(this.loadConfig());
        this.setupCommands();
    }

    private setupCommands(): void {
        this.program
            .name('nna-cli')
            .description('CLI tools for NNA Framework')
            .version('1.0.0');

        // Asset Commands
        this.program
            .command('asset')
            .description('Asset management commands')
            .option('-r, --resolve <address>', 'Resolve asset by address')
            .option('-b, --batch <addresses>', 'Batch resolve assets')
            .option('-p, --preview', 'Generate preview')
            .action(async (options) => {
                if (options.resolve) {
                    const asset = await this.client.asset.resolve(options.resolve);
                    console.log(JSON.stringify(asset, null, 2));
                }
                // Add more command handlers
            });

        this.program.parse();
    }

    private loadConfig(): NNAConfig {
        return {
            apiKey: process.env.NNA_API_KEY,
            environment: process.env.NNA_ENVIRONMENT || 'production'
        };
    }
}

new NNACLI();
```

### 7.2.2 Developer Console

```typescript
class DeveloperConsole {
    private readonly client: NNAClient;
    private readonly history: CommandHistory;
    private readonly autoComplete: AutoComplete;

    async start(): Promise<void> {
        // Initialize console
        await this.initialize();

        // Set up command handlers
        this.setupCommandHandlers();

        // Start REPL
        this.startREPL();
    }

    private setupCommandHandlers(): void {
        this.commands.set('resolve', this.handleResolve.bind(this));
        this.commands.set('preview', this.handlePreview.bind(this));
        this.commands.set('rights', this.handleRights.bind(this));
        this.commands.set('cache', this.handleCache.bind(this));
    }

    private async handleResolve(args: string[]): Promise<void> {
        const assetId = args[0];
        if (!assetId) {
            console.error('Asset ID required');
            return;
        }

        try {
            const asset = await this.client.asset.resolve(assetId);
            console.log(JSON.stringify(asset, null, 2));
        } catch (error) {
            console.error('Error resolving asset:', error.message);
        }
    }
}
```

### 7.2.3 Development Environment

```typescript
class DevEnvironment {
    private readonly docker: DockerManager;
    private readonly database: DatabaseManager;
    private readonly cache: CacheManager;

    async initialize(): Promise<void> {
        // Start required services
        await this.startServices();

        // Initialize development data
        await this.initializeData();

        // Configure development settings
        await this.configureSettings();
    }

    private async startServices(): Promise<void> {
        await Promise.all([
            this.docker.startContainer('nna-api'),
            this.docker.startContainer('nna-cache'),
            this.docker.startContainer('nna-db')
        ]);
    }

    private async initializeData(): Promise<void> {
        await this.database.runMigrations();
        await this.database.seedData();
        await this.cache.warmup();
    }
}
```

# 8. Monitoring and Observability

## 8.1 Metrics Collection

### 8.1.1 System Metrics

```typescript
class SystemMetricsCollector {
    private readonly collectors: Map<string, Collector>;
    private readonly aggregator: MetricAggregator;

    async collectMetrics(
        context: MonitoringContext
    ): Promise<SystemMetrics> {
        const metrics = await Promise.all([
            this.collectCPUMetrics(context),
            this.collectMemoryMetrics(context),
            this.collectDiskMetrics(context),
            this.collectNetworkMetrics(context)
        ]);

        return this.aggregator.aggregate(metrics);
    }

    private async collectCPUMetrics(
        context: MonitoringContext
    ): Promise<CPUMetrics> {
        return {
            usage_percent: await this.getCPUUsage(),
            load_average: await this.getLoadAverage(),
            thread_count: await this.getThreadCount()
        };
    }

    private async collectMemoryMetrics(
        context: MonitoringContext
    ): Promise<MemoryMetrics> {
        return {
            used_bytes: await this.getMemoryUsed(),
            total_bytes: await this.getMemoryTotal(),
            cache_bytes: await this.getCacheMemory()
        };
    }
}
```

### 8.1.2 Application Metrics

```typescript
class ApplicationMetricsCollector {
    async collectMetrics(): Promise<ApplicationMetrics> {
        return {
            requests: await this.collectRequestMetrics(),
            cache: await this.collectCacheMetrics(),
            assets: await this.collectAssetMetrics()
        };
    }

    private async collectRequestMetrics(): Promise<RequestMetrics> {
        return {
            total: this.request_counter.get(),
            success: this.success_counter.get(),
            failed: this.error_counter.get(),
            latency: this.latency_histogram.get()
        };
    }

    private async collectCacheMetrics(): Promise<CacheMetrics> {
        return {
            hits: this.cache_hits.get(),
            misses: this.cache_misses.get(),
            evictions: this.cache_evictions.get(),
            size_bytes: this.cache_size.get()
        };
    }
}
```

## 8.1.3 Standardized Metrics Schema

The NNA Framework implements a standardized metrics schema to ensure consistent monitoring and alerting across all components and deployments.

### 8.1.3.1 Metric Naming Convention

All NNA metrics follow a consistent naming pattern:

> nna_[component]_[measurement]_[unit]

For example:

- `nna_asset_resolution_duration_ms` - Asset resolution time in milliseconds
- `nna_cache_hit_total` - Total number of cache hits
- `nna_api_requests_total` - Total number of API requests

### 8.1.3.2 Core Metrics

1. **API Metrics**

| **Metric Name** | **Type** | **Description** | **Labels** |
| --- | --- | --- | --- |
| `nna_api_requests_total` | Counter | Total API requests | `endpoint`, `method`, `status_code` |
| `nna_api_request_duration_ms` | Histogram | API request duration | `endpoint`, `method`, `status_code` |
| `nna_api_errors_total` | Counter | API errors | `endpoint`, `error_code` |
| `nna_api_client_connections_current` | Gauge | Current client connections | `client_type` |

1. **Cache Metrics**

| **Metric Name** | **Type** | **Description** | **Labels** |
| --- | --- | --- | --- |
| `nna_cache_hit_total` | Counter | Cache hits | `tier`, `region` |
| `nna_cache_miss_total` | Counter | Cache misses | `tier`, `region` |
| `nna_cache_size_bytes` | Gauge | Cache size in bytes | `tier`, `region` |
| `nna_cache_entries_count` | Gauge | Number of cache entries | `tier`, `region` |
| `nna_cache_evictions_total` | Counter | Cache evictions | `tier`, `region`, `reason` |

1. **Asset Metrics**

| **Metric Name** | **Type** | **Description** | **Labels** |
| --- | --- | --- | --- |
| `nna_asset_resolution_duration_ms` | Histogram | Asset resolution time | `layer_type`, `cache_result` |
| `nna_asset_composition_duration_ms` | Histogram | Asset composition time | `layer_count` |
| `nna_asset_requests_total` | Counter | Asset requests | `layer_type`, `category` |
| `nna_asset_creation_total` | Counter | Asset creations | `layer_type`, `category` |

1. **Rights Metrics**

| **Metric Name** | **Type** | **Description** | **Labels** |
| --- | --- | --- | --- |
| `nna_rights_verification_duration_ms` | Histogram | Rights verification time | `result` |
| `nna_rights_verifications_total` | Counter | Rights verifications | `result` |
| `nna_rights_grants_total` | Counter | Rights grants | `rights_type` |
| `nna_rights_denials_total` | Counter | Rights denials | `denial_reason` |

### 8.1.3.3 Instrumentation Guidelines

When implementing metrics collection:

1. Use consistent naming conventions
1. Include relevant labels for segmentation
1. Choose appropriate metric types (counter, gauge, histogram)
1. Set appropriate histogram buckets for latency metrics
1. Avoid high-cardinality labels

**Example metrics implementation:**

```typescript
class MetricsCollector {
    private registry: PrometheusRegistry;
    
    constructor() {
        this.registry = new PrometheusRegistry();
        this.initializeMetrics();
    }
    
    private initializeMetrics(): void {
        // Initialize API metrics
        this.apiRequestsTotal = new Counter({
            name: 'nna_api_requests_total',
            help: 'Total number of API requests',
            labelNames: ['endpoint', 'method', 'status_code']
        });
        
        this.apiRequestDuration = new Histogram({
            name: 'nna_api_request_duration_ms',
            help: 'API request duration in milliseconds',
            labelNames: ['endpoint', 'method', 'status_code'],
            buckets: [1, 5, 10, 20, 50, 100, 200, 500, 1000]
        });
        
        // Initialize cache metrics
        this.cacheHitTotal = new Counter({
            name: 'nna_cache_hit_total',
            help: 'Total number of cache hits',
            labelNames: ['tier', 'region']
        });
        
        // Add additional metrics...
        
        // Register all metrics
        this.registry.registerMetric(this.apiRequestsTotal);
        this.registry.registerMetric(this.apiRequestDuration);
        this.registry.registerMetric(this.cacheHitTotal);
        // Register additional metrics...
    }
    
    public recordApiRequest(endpoint: string, method: string, statusCode: number): void {
        this.apiRequestsTotal.labels(endpoint, method, statusCode.toString()).inc();
    }
    
    public recordApiRequestDuration(
        endpoint: string,
        method: string,
        statusCode: number,
        durationMs: number
    ): void {
        this.apiRequestDuration.labels(endpoint, method, statusCode.toString()).observe(durationMs);
    }
    
    public recordCacheHit(tier: string, region: string): void {
        this.cacheHitTotal.labels(tier, region).inc();
    }
    
    // Add additional record methods...
}
```

## 8.2 Logging System

NNA uses a **structured logging approach** to enable **debugging, monitoring, and real-time analytics**.

### 8.2.1 Logging Standards

- **Format:** JSON-based structured logging.
- **Minimum Fields:** `timestamp`, `log_level`, `service_name`, `request_id`, `error_code`.
- **Storage:** Logs are persisted in **Elasticsearch** for querying and visualization.
    - **Severity Levels:**`INFO`: Standard operation logs.
    - `WARN`: Potential issues that don’t impact functionality.
    - `ERROR`: Critical failures requiring intervention.

### 8.2.2 Monitoring Tools

| **Tool** | **Purpose** |
| --- | --- |
| Prometheus | Real-time system metrics |
| Grafana | Dashboard visualization |
| ELK Stack | Centralized logging & analytics |

For advanced debugging and error tracking, refer to [**NNA System Debugging Guide**](#link-to-debugging-guide).

### 8.2.3 Structured Logging

```typescript
class StructuredLogger {
    private readonly transport: LogTransport;
    private readonly contextProvider: ContextProvider;

    async log(
        level: LogLevel,
        message: string,
        context: LogContext = {}
    ): Promise<void> {
        const enrichedContext = await this.enrichContext(context);
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...enrichedContext,
            correlationId: getCurrentCorrelationId(),
            requestId: getCurrentRequestId()
        };

        await this.transport.write(logEntry);
    }

    private async enrichContext(
        context: LogContext
    ): Promise<EnrichedLogContext> {
        return {
            ...context,
            environment: process.env.NODE_ENV,
            service: this.contextProvider.getServiceName(),
            version: this.contextProvider.getServiceVersion(),
            host: this.contextProvider.getHostInfo()
        };
    }
}
```

### 8.2.4 Log Aggregation

```typescript
class LogAggregator {
    private readonly processors: LogProcessor[];
    private readonly storage: LogStorage;

    async aggregateLogs(
        timeframe: TimeFrame,
        options: AggregationOptions
    ): Promise<AggregatedLogs> {
        // Collect logs from all sources
        const logs = await this.collectLogs(timeframe);

        // Process logs through processors
        const processedLogs = await this.processLogs(logs);

        // Aggregate results
        const aggregated = await this.aggregate(processedLogs, options);

        // Store aggregated results
        await this.storage.store(aggregated);

        return aggregated;
    }

    private async processLogs(
        logs: RawLog[]
    ): Promise<ProcessedLog[]> {
        return Promise.all(
            logs.map(log => 
                this.processors.reduce(
                    async (processed, processor) => 
                        processor.process(await processed),
                    Promise.resolve(log)
                )
            )
        );
    }
}
```

## 8.3 Tracing System

### 8.3.1 Distributed Tracing

```typescript
class DistributedTracer {
    private readonly tracer: Tracer;
    private readonly propagator: TracePropagator;

    async traceOperation<T>(
        name: string,
        context: TraceContext,
        operation: () => Promise<T>
    ): Promise<T> {
        const span = this.tracer.startSpan(name, {
            parent: context.parent,
            attributes: context.attributes
        });

        try {
            const result = await operation();
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
        } catch (error) {
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message
            });
            span.recordException(error);
            throw error;
        } finally {
            span.end();
        }
    }

    propagateContext(
        context: TraceContext,
        carrier: unknown
    ): void {
        this.propagator.inject(context, carrier);
    }
}
```

### 8.3.2 Trace Analysis

```typescript
class TraceAnalyzer {
    async analyzeTraces(
        timeframe: TimeFrame,
        options: AnalysisOptions
    ): Promise<TraceAnalysis> {
        // Collect traces
        const traces = await this.collectTraces(timeframe);

        // Analyze patterns
        const patterns = await this.analyzePatterns(traces);

        // Detect anomalies
        const anomalies = await this.detectAnomalies(traces, patterns);

        // Generate insights
        return this.generateInsights(traces, patterns, anomalies);
    }

    private async analyzePatterns(
        traces: Trace[]
    ): Promise<TracePatterns> {
        return {
            latencyPatterns: await this.analyzeLatencyPatterns(traces),
            errorPatterns: await this.analyzeErrorPatterns(traces),
            dependencyPatterns: await this.analyzeDependencyPatterns(traces),
            bottlenecks: await this.identifyBottlenecks(traces)
        };
    }

    private async detectAnomalies(
        traces: Trace[],
        patterns: TracePatterns
    ): Promise<TraceAnomalies> {
        return {
            latencyAnomalies: await this.detectLatencyAnomalies(traces, patterns),
            errorAnomalies: await this.detectErrorAnomalies(traces, patterns),
            behaviorAnomalies: await this.detectBehaviorAnomalies(traces, patterns)
        };
    }

    private async generateInsights(
        traces: Trace[],
        patterns: TracePatterns,
        anomalies: TraceAnomalies
    ): Promise<TraceAnalysis> {
        return {
            summary: await this.generateSummary(traces, patterns, anomalies),
            recommendations: await this.generateRecommendations(patterns, anomalies),
            performance: await this.analyzePerformance(traces, patterns),
            reliability: await this.analyzeReliability(traces, anomalies)
        };
    }
}
```

## 8.4 Alert System

### 8.4.1 Alert Configuration

```typescript
class AlertSystem {
    private readonly rules: Map<string, AlertRule>;
    private readonly notifiers: Map<string, AlertNotifier>;

    async configureAlerts(config: AlertConfig): Promise<void> {
        // Setup alert rules
        await this.setupAlertRules(config.rules);

        // Configure notification channels
        await this.configureNotifiers(config.notifications);

        // Initialize alert processors
        await this.initializeProcessors(config.processors);
    }

    private async setupAlertRules(rules: AlertRuleConfig[]): Promise<void> {
        for (const rule of rules) {
            await this.validateRule(rule);
            const processedRule = await this.processRule(rule);
            this.rules.set(rule.id, processedRule);
        }
    }

    private async processRule(rule: AlertRuleConfig): Promise<AlertRule> {
        return {
            id: rule.id,
            condition: this.buildCondition(rule.condition),
            severity: rule.severity,
            throttling: this.configureThrottling(rule.throttling),
            actions: await this.configureActions(rule.actions)
        };
    }
}
```

### 8.4.2 Alert Processing

```typescript
class AlertProcessor {
    async processAlert(
        alert: Alert,
        context: AlertContext
    ): Promise<ProcessedAlert> {
        // Enrich alert with context
        const enrichedAlert = await this.enrichAlert(alert, context);

        // Deduplicate if necessary
        if (await this.isDuplicate(enrichedAlert)) {
            return this.handleDuplicate(enrichedAlert);
        }

        // Apply routing rules
        const routedAlert = await this.routeAlert(enrichedAlert);

        // Execute alert actions
        return this.executeActions(routedAlert);
    }

    private async enrichAlert(
        alert: Alert,
        context: AlertContext
    ): Promise<EnrichedAlert> {
        return {
            ...alert,
            timestamp: new Date().toISOString(),
            environment: context.environment,
            service: context.service,
            metadata: await this.gatherMetadata(alert, context),
            fingerprint: await this.generateFingerprint(alert)
        };
    }

    private async routeAlert(
        alert: EnrichedAlert
    ): Promise<RoutedAlert> {
        const routes = await this.getAlertRoutes(alert);
        
        return {
            ...alert,
            routes,
            priority: await this.calculatePriority(alert, routes),
            notificationChannels: await this.getNotificationChannels(routes)
        };
    }
}
```

## 8.5 Dashboard System

### 8.5.1 Dashboard Configuration

```typescript
class DashboardManager {
    async configureDashboard(config: DashboardConfig): Promise<Dashboard> {
        // Initialize dashboard structure
        const structure = await this.initializeStructure(config);

        // Set up data sources
        const dataSources = await this.setupDataSources(config.dataSources);

        // Configure panels
        const panels = await this.configurePanels(config.panels, dataSources);

        // Set up refresh mechanism
        await this.setupRefresh(config.refresh);

        return {
            id: config.id,
            title: config.title,
            structure,
            dataSources,
            panels,
            refresh: config.refresh
        };
    }

    private async configurePanels(
        panelConfigs: PanelConfig[],
        dataSources: DataSource[]
    ): Promise<Panel[]> {
        return Promise.all(
            panelConfigs.map(async config => {
                const panel = await this.createPanel(config);
                await this.bindDataSource(panel, dataSources);
                return panel;
            })
        );
    }
}
```

### 8.5.2 Real-time Updates

```typescript
class DashboardUpdater {
    private readonly updateQueue: UpdateQueue;
    private readonly throttler: UpdateThrottler;

    async updateDashboard(
        dashboard: Dashboard,
        updates: DashboardUpdate[]
    ): Promise<void> {
        // Group updates by panel
        const groupedUpdates = this.groupUpdatesByPanel(updates);

        // Apply throttling if necessary
        const throttledUpdates = await this.throttler.throttle(groupedUpdates);

        // Process updates
        await Promise.all(
            throttledUpdates.map(update => this.processUpdate(dashboard, update))
        );
    }

    private async processUpdate(
        dashboard: Dashboard,
        update: DashboardUpdate
    ): Promise<void> {
        // Validate update
        await this.validateUpdate(update);

        // Transform data if needed
        const transformedData = await this.transformData(update.data);

        // Apply update to panel
        await this.applyUpdate(dashboard, update.panelId, transformedData);

        // Notify subscribers
        await this.notifySubscribers(dashboard, update);
    }
}
```

## 8.6 Performance Monitoring

### 8.6.1 Performance Metrics Collection

```typescript
class PerformanceMonitor {
    private readonly collectors: Map<string, MetricCollector>;
    private readonly aggregator: MetricAggregator;

    async collectMetrics(
        context: MonitoringContext
    ): Promise<PerformanceMetrics> {
        const metrics = await Promise.all([
            this.collectSystemMetrics(context),
            this.collectApplicationMetrics(context),
            this.collectBusinessMetrics(context)
        ]);

        return this.aggregator.aggregate(metrics);
    }

    private async collectSystemMetrics(
        context: MonitoringContext
    ): Promise<SystemMetrics> {
        return {
            cpu: await this.collectCPUMetrics(context),
            memory: await this.collectMemoryMetrics(context),
            network: await this.collectNetworkMetrics(context),
            disk: await this.collectDiskMetrics(context)
        };
    }

    private async collectApplicationMetrics(
        context: MonitoringContext
    ): Promise<ApplicationMetrics> {
        return {
            requests: await this.collectRequestMetrics(context),
            latency: await this.collectLatencyMetrics(context),
            errors: await this.collectErrorMetrics(context),
            cache: await this.collectCacheMetrics(context)
        };
    }
}
```

### 8.6.2 Performance Analysis

```typescript
class PerformanceAnalyzer {
    async analyzePerformance(
        metrics: PerformanceMetrics,
        config: AnalysisConfig
    ): Promise<PerformanceAnalysis> {
        // Analyze throughput
        const throughput = await this.analyzeThroughput(metrics);

        // Analyze latency
        const latency = await this.analyzeLatency(metrics);

        // Analyze resource usage
        const resources = await this.analyzeResources(metrics);

        // Generate insights
        return this.generateInsights(throughput, latency, resources);
    }

    private async analyzeThroughput(
        metrics: PerformanceMetrics
    ): Promise<ThroughputAnalysis> {
        return {
            current: this.calculateCurrentThroughput(metrics),
            historical: await this.analyzeHistoricalThroughput(metrics),
            bottlenecks: await this.identifyThroughputBottlenecks(metrics),
            recommendations: await this.generateThroughputRecommendations(metrics)
        };
    }

    private async analyzeLatency(
        metrics: PerformanceMetrics
    ): Promise<LatencyAnalysis> {
        return {
            p50: this.calculatePercentile(metrics.latency, 50),
            p90: this.calculatePercentile(metrics.latency, 90),
            p99: this.calculatePercentile(metrics.latency, 99),
            trends: await this.analyzeLatencyTrends(metrics),
            anomalies: await this.detectLatencyAnomalies(metrics)
        };
    }
}
```

## 8.7 Health Check System

### 8.7.1 Health Check Implementation

```typescript
class HealthChecker {
    async checkHealth(): Promise<HealthStatus> {
        const checks = await Promise.all([
            this.checkDatabase(),
            this.checkCache(),
            this.checkAPI(),
            this.checkStorage()
        ]);

        return {
            status: this.determineOverallStatus(checks),
            checks: this.aggregateChecks(checks),
            timestamp: new Date().toISOString()
        };
    }

    private async checkDatabase(): Promise<ComponentHealth> {
        try {
            const startTime = Date.now();
            await this.database.ping();
            const latency = Date.now() - startTime;

            return {
                component: 'database',
                status: 'healthy',
                latency,
                details: { connections: await this.database.getConnectionCount() }
            };
        } catch (error) {
            return {
                component: 'database',
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    private determineOverallStatus(
        checks: ComponentHealth[]
    ): 'healthy' | 'degraded' | 'unhealthy' {
        const unhealthy = checks.filter(check => check.status === 'unhealthy');
        const degraded = checks.filter(check => check.status === 'degraded');

        if (unhealthy.length > 0) return 'unhealthy';
        if (degraded.length > 0) return 'degraded';
        return 'healthy';
    }
}
```

### 8.7.2 Health Monitoring

```typescript
class HealthMonitor {
    async monitorHealth(
        config: MonitoringConfig
    ): Promise<void> {
        // Start health check loop
        while (true) {
            try {
                // Perform health check
                const health = await this.healthChecker.checkHealth();

                // Process health status
                await this.processHealthStatus(health);

                // Wait for next interval
                await this.delay(config.interval);
            } catch (error) {
                await this.handleMonitoringError(error);
            }
        }
    }

    private async processHealthStatus(
        health: HealthStatus
    ): Promise<void> {
        // Log health status
        await this.logHealth(health);

        // Check for status changes
        const statusChanged = await this.checkStatusChange(health);
        if (statusChanged) {
            await this.handleStatusChange(health);
        }

        // Update metrics
        await this.updateHealthMetrics(health);

        // Trigger alerts if necessary
        await this.checkAlertConditions(health);
    }
}
```

# 9. Error Handling

NNA adopts a **standardized error-handling mechanism** to ensure consistency across all system components. Errors are categorized as follows:

## 9.1 Error Response Format

### 9.1.1 Standard Error Structure

```typescript
interface ErrorResponse {
    success: false;
    error: {
        code: string;        // Machine-readable error code
        message: string;     // Human-readable message
        details?: object;    // Additional context
        trace_id: string;    // For debugging/support
    };
    metadata: {
        timestamp: string;   // ISO 8601 format
        path: string;       // Request path
        method: string;     // HTTP method
        version: string;    // API version
    };
}
```

### 9.1.2 Error Categories

```typescript
enum ErrorCategory {
    VALIDATION = 'VALIDATION_ERROR',
    AUTHENTICATION = 'AUTH_ERROR',
    AUTHORIZATION = 'PERMISSION_ERROR',
    RESOURCE = 'RESOURCE_NOT_FOUND',
    CONFLICT = 'CONFLICT_ERROR',
    SYSTEM = 'INTERNAL_SERVER_ERROR',
    RATE_LIMIT = 'RATE_LIMIT_EXCEEDED'
}

class ErrorHandler {
    async handleError(error: Error): Promise<ErrorResponse> {
        // Add error context
        const enrichedError = await this.enrichError(error);
        
        // Log error
        await this.logError(enrichedError);
        
        // Generate response
        return this.createErrorResponse(enrichedError);
    }

    private async enrichError(error: Error): Promise<EnrichedError> {
        return {
            ...error,
            category: this.categorizeError(error),
            timestamp: new Date().toISOString(),
            context: await this.gatherContext(),
            stackTrace: this.shouldIncludeStack(error) ? error.stack : undefined
        };
    }
}
```

## 9.2 Error Types

### 9.2.1 Client Errors (4XX)

| **Code** | **Message** | **Description** |
| --- | --- | --- |
| 400 | BAD_REQUEST | Malformed request syntax |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Valid auth but insufficient permissions |
| 404 | NOT_FOUND | Requested resource doesn't exist |
| 429 | RATE_LIMITED | Too many requests |

```typescript
class ValidationError extends BaseError {
    constructor(message: string, details?: object) {
        super(message);
        this.code = 'NNA_VALIDATION_ERROR';
        this.statusCode = 400;
        this.details = details;
    }
}

class AuthenticationError extends BaseError {
    constructor(message: string) {
        super(message);
        this.code = 'NNA_AUTH_ERROR';
        this.statusCode = 401;
    }
}

class AuthorizationError extends BaseError {
    constructor(message: string) {
        super(message);
        this.code = 'NNA_PERMISSION_ERROR';
        this.statusCode = 403;
    }
}

class ResourceNotFoundError extends BaseError {
    constructor(resourceType: string, identifier: string) {
        super(`${resourceType} not found: ${identifier}`);
        this.code = 'NNA_RESOURCE_NOT_FOUND';
        this.statusCode = 404;
        this.details = { resourceType, identifier };
    }
}
```

### 9.2.2 Server Errors (5XX)

| **Code** | **Message** | **Description** |
| --- | --- | --- |
| 500 | INTERNAL_ERROR | Unexpected server error |
| 502 | BAD_GATEWAY | Invalid response from upstream server |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

```typescript
class InternalServerError extends BaseError {
    constructor(message: string, error?: Error) {
        super(message);
        this.code = 'NNA_INTERNAL_ERROR';
        this.statusCode = 500;
        this.originalError = error;
    }
}

class ServiceUnavailableError extends BaseError {
    constructor(service: string, reason: string) {
        super(`Service ${service} unavailable: ${reason}`);
        this.code = 'NNA_SERVICE_UNAVAILABLE';
        this.statusCode = 503;
        this.details = { service, reason };
    }
}
```

## 9.2.3 Domain-Specific Error Codes

```typescript
// Composition Errors
class CompositionValidationError extends BaseError {
    constructor(message: string, details?: object) {
        super(message);
        this.code = 'NNA_COMPOSITION_VALIDATION_ERROR';
        this.statusCode = 400;
        this.details = details;
    }
}

class CompositionProcessingError extends BaseError {
    constructor(message: string, compositeId: string, stage: string) {
        super(message);
        this.code = 'NNA_COMPOSITION_PROCESSING_ERROR';
        this.statusCode = 500;
        this.details = { compositeId, stage };
    }
}

// Asset-Specific Errors
class IncompatibleLayersError extends BaseError {
    constructor(message: string, layers: string[]) {
        super(message);
        this.code = 'NNA_INCOMPATIBLE_LAYERS';
        this.statusCode = 400;
        this.details = { layers };
    }
}

class AssetVersionMismatchError extends BaseError {
    constructor(message: string, assetId: string, requestedVersion: string, availableVersions: string[]) {
        super(message);
        this.code = 'NNA_ASSET_VERSION_MISMATCH';
        this.statusCode = 400;
        this.details = { assetId, requestedVersion, availableVersions };
    }
}

// Rights Management Errors
class RightsConflictError extends BaseError {
    constructor(message: string, assetId: string, existingGrantId: string) {
        super(message);
        this.code = 'NNA_RIGHTS_CONFLICT';
        this.statusCode = 409;
        this.details = { assetId, existingGrantId };
    }
}

class RightsExpiredError extends BaseError {
    constructor(message: string, grantId: string, expiredAt: string) {
        super(message);
        this.code = 'NNA_RIGHTS_EXPIRED';
        this.statusCode = 403;
        this.details = { grantId, expiredAt };
    }
}

// Face Swap and Personalization Errors
class FaceDetectionError extends BaseError {
    constructor(message: string, details?: object) {
        super(message);
        this.code = 'NNA_FACE_DETECTION_ERROR';
        this.statusCode = 400;
        this.details = details;
    }
}

class PersonalizationLimitError extends BaseError {
    constructor(message: string, userId: string, currentCount: number, maxCount: number) {
        super(message);
        this.code = 'NNA_PERSONALIZATION_LIMIT_EXCEEDED';
        this.statusCode = 429;
        this.details = { userId, currentCount, maxCount };
    }
}
```

## 9.3 Error Recovery

Handle errors effectively with these strategies:

### 9.3.1 Retry Strategy

1. **Retry Transient Errors**:
    - Example for `503 SERVICE_UNAVAILABLE`:

```javascript
const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            if (error.message.includes('503') && i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                continue;
            }
            throw { code: 'NNA_SERVICE_UNAVAILABLE', message: error.message };
        }
    }
};

// Usage
const asset = await fetchWithRetry(
    'https://api.reviz.studio/v1/asset/resolve/S.01.01.001',
    { headers: { Authorization: 'Bearer YOUR_TOKEN' } }
);
```

1. **Circuit Breaker**: 
1. For persistent failures, implement a fallback after 5 attempts:

```ruby
let failures = 0;
async function fetchWithBreaker(url, options) {
    if (failures >= 5) {
        console.log('Circuit open, using fallback');
        return { data: { asset_id: 'S.01.01.001', urls: { full: 'local-cache.mp4' } } };
    }
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Failed');
        failures = 0;
        return await response.json();
    } catch (error) {
        failures++;
        throw error;
    }
}
```

1. **Notification**: 
1. Log errors and alert on critical failures (e.g., 500 INTERNAL_ERROR).
1. **Implementation Example**

```typescript
class RetryStrategy {
    private readonly maxRetries: number;
    private readonly baseDelay: number;
    private readonly maxDelay: number;

    async executeWithRetry<T>(
        operation: () => Promise<T>,
        context: RequestContext
    ): Promise<T> {
        let attempt = 0;
        
        while (attempt < this.maxRetries) {
            try {
                return await operation();
            } catch (error) {
                if (!this.shouldRetry(error) || attempt === this.maxRetries - 1) {
                    throw error;
                }
                
                const delay = this.calculateDelay(attempt);
                await this.delay(delay);
                attempt++;
            }
        }
        
        throw new Error('Max retry attempts reached');
    }

    private shouldRetry(error: Error): boolean {
        // Retry on network errors, timeouts, and certain API errors
        return (
            error instanceof NetworkError ||
            error instanceof TimeoutError ||
            (error instanceof APIError && error.isRetryable())
        );
    }

    private calculateDelay(attempt: number): number {
        // Exponential backoff with jitter
        const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * exponentialDelay;
        return Math.min(exponentialDelay + jitter, this.maxDelay);
    }
}
```

See [Implementation Guide, Section 9.3.1 - Retry Strategy](#9-deployment-and-operations) for detailed implementations and [Section 9.1 - Error Response Format](#9-error-handling) for error codes.

### 9.3.2 Circuit Breaker

1. **Circuit Breaker**: For persistent failures, implement a fallback (e.g., local cache) after 5 failed attempts.
1. **Notification**: Log errors and alert on critical failures (e.g., 500 INTERNAL_ERROR).

```typescript
class CircuitBreaker {
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private failures: number = 0;
    private lastFailureTime: number = 0;

    async execute<T>(
        operation: () => Promise<T>
    ): Promise<T> {
        if (this.state === 'OPEN') {
            if (this.shouldAttemptReset()) {
                this.state = 'HALF_OPEN';
            } else {
                throw new CircuitBreakerOpenError();
            }
        }

        try {
            const result = await operation();
            this.handleSuccess();
            return result;
        } catch (error) {
            return this.handleFailure(error);
        }
    }

    private handleSuccess(): void {
        if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED';
            this.failures = 0;
        }
    }

    private handleFailure(error: Error): never {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.shouldOpen()) {
            this.state = 'OPEN';
            throw new CircuitBreakerOpenError('Circuit breaker opened', error);
        }

        throw error;
    }

    private shouldOpen(): boolean {
        return (
            this.failures >= this.config.failureThreshold &&
            Date.now() - this.lastFailureTime <= this.config.failureWindow
        );
    }
}
```

See [Implementation Guide, Section 9.3.1 - Retry Strategy](#9-deployment-and-operations) for detailed implementations and [Section 9.1 - Error Response Format](#9-error-handling) for error codes.

## 9.4 Error Monitoring

### 9.4.1 Error Tracking

```typescript
class ErrorTracker {
    async trackError(
        error: Error,
        context: ErrorContext
    ): Promise<void> {
        // Enrich error with context
        const enrichedError = await this.enrichError(error, context);

        // Group similar errors
        const groupId = await this.groupError(enrichedError);

        // Update error statistics
        await this.updateErrorStats(groupId, enrichedError);

        // Check for alert conditions
        await this.checkAlertConditions(groupId, enrichedError);
    }

    private async groupError(
        error: EnrichedError
    ): Promise<string> {
        return this.errorGrouper.group(error);
    }

    private async updateErrorStats(
        groupId: string,
        error: EnrichedError
    ): Promise<void> {
        await this.errorStats.increment(groupId, {
            count: 1,
            lastOccurrence: new Date(),
            affectedUsers: new Set([error.context.userId])
        });
    }
}
```

### 9.4.2 Error Analysis

```typescript
class ErrorAnalyzer {
    async analyzeErrors(
        timeframe: TimeFrame,
        options: AnalysisOptions
    ): Promise<ErrorAnalysis> {
        // Collect error data
        const errors = await this.collectErrors(timeframe);

        // Analyze patterns
        const patterns = await this.analyzePatterns(errors);

        // Generate insights
        return this.generateInsights(errors, patterns);
    }

    private async analyzePatterns(
        errors: TrackedError[]
    ): Promise<ErrorPatterns> {
        return {
            frequency: await this.analyzeFrequency(errors),
            distribution: await this.analyzeDistribution(errors),
            correlation: await this.analyzeCorrelation(errors),
            impact: await this.analyzeImpact(errors)
        };
    }

    private async generateInsights(
        errors: TrackedError[],
        patterns: ErrorPatterns
    ): Promise<ErrorAnalysis> {
        return {
            summary: this.generateSummary(errors, patterns),
            trends: await this.analyzeTrends(errors, patterns),
            recommendations: await this.generateRecommendations(patterns)
        };
    }
}
```

## 9.5 Developer FAQ

Quick answers to common integration questions:

### Authentication & Rights

**Q: Why am I getting 401 UNAUTHORIZED?**

A: Ensure your token is valid and not expired. Refresh via `/v1/auth/refresh` or check API key rotation ([Section 2.3 - Security Best Practices](#section-2.3-security-best-practices)). Most common causes are expired JWT tokens (1-hour lifetime) or incorrect authentication scopes.

**Q: How do I handle 403 FORBIDDEN errors?**

A: This indicates valid authentication but insufficient permissions. Check rights clearance via `/v1/rights/verify/{asset_id}` ([Section 3.3.1 - Rights Verification](#section-3.3.1-rights-verification)).

### Performance & Rate Limiting

**Q: How do I handle 429 RATE_LIMITED errors?**

A: Implement exponential backoff with jitter (see [Section 9.3 - Error Recovery](#section-9.3-error-recovery)), a technique to prevent overloading by spacing retries.

**Q: Can I batch more than 250 assets?**

A: No, split into multiple `/v1/asset/batch/resolve` calls ([Section 3.1.2 - Batch Asset Resolution](#section-3.1.2-batch-asset-resolution)). Batching is limited to prevent overload and ensure performance.

### Integration & Troubleshooting

**Q: Why does SDK installation fail?**

A: Ensure prerequisites (Node.js 18+, Python 3.8+) are installed and check network connectivity. Run `npm install --verbose` or `pip install --verbose` for details ([Section 1.2.1 - Quick Start Guide](#section-1.2.1-quick-start-guide)).

**Q: Why does my endpoint return 500 after setup?**

A: Verify Redis and PostgreSQL are running (`docker ps`) and `.env` matches [NNA Framework Implementation Plan, Section 6.6](#section-6.6-developer-setup-guide).

**Q: How do I debug WebSocket issues?**

A: Check `heartbeatInterval` ([Section 4.1.3 - Heartbeat Management](#section-4.1.3-heartbeat-management)) and ensure reconnection logic uses exponential backoff. Common issues include missing keep-alive messages (every 30s) or incorrect event formats.

**Q: Why is my cache invalidation not working?**

A: Use proper invalidation patterns ([Section 10.1.2 - Cache Invalidation Patterns](#section-10.1.2-cache-invalidation-patterns)) and allow up to 60s for propagation across tiers.

For detailed recovery strategies, see [Section 9.3 - Error Recovery](#section-9.3-error-recovery) and API endpoints in [Section 3 - Core APIs](#section-3-core-apis).

## 9.6 Detailed Error Response Examples

```typescript
// Example 1: Asset Not Found
{
    "success": false,
    "error": {
        "code": "NNA_RESOURCE_NOT_FOUND",
        "message": "The requested asset could not be found",
        "details": {
            "resourceType": "asset",
            "identifier": "S.99.99.999"
        },
        "trace_id": "trace_abc123"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "path": "/v1/asset/resolve/S.99.99.999",
        "method": "GET",
        "version": "1.0.2"
    }
}

// Example 2: Incompatible Layers
{
    "success": false,
    "error": {
        "code": "NNA_INCOMPATIBLE_LAYERS",
        "message": "The selected star and world layers are not compatible",
        "details": {
            "layers": ["S.01.01.001", "W.08.08.001"],
            "compatibility_score": 0.2,
            "minimum_threshold": 0.6,
            "recommendations": ["W.01.01.001", "W.02.01.001"]
        },
        "trace_id": "trace_def456"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "path": "/v1/composition/create",
        "method": "POST",
        "version": "1.0.2"
    }
}

// Example 3: Rate Limit Exceeded
{
    "success": false,
    "error": {
        "code": "NNA_RATE_LIMIT_EXCEEDED",
        "message": "Rate limit exceeded for asset.search endpoint",
        "details": {
            "limit": 500,
            "reset_at": "2025-02-23T10:31:00Z",
            "current": 501
        },
        "trace_id": "trace_ghi789"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "path": "/v1/asset/search",
        "method": "GET",
        "version": "1.0.2"
    }
}
```

## 9.7 API Status Codes Summary

The NNA Framework API uses standard HTTP status codes to indicate the success or failure of requests:

### 9.7.1 Success Codes

- **200 OK**: The request was successful and the response includes the requested data
- **201 Created**: The resource was successfully created (used for POST requests)
- **202 Accepted**: The request has been accepted for processing but not yet completed (used for async operations)
- **204 No Content**: The request was successful but returns no content (used for DELETE operations)

### 9.7.2 Client Error Codes

- **400 Bad Request**: The request contains invalid parameters or is improperly formatted
- **401 Unauthorized**: Authentication credentials are missing or invalid
- **403 Forbidden**: Authentication succeeded, but the user lacks permission for the requested operation
- **404 Not Found**: The requested resource does not exist
- **409 Conflict**: The request conflicts with the current state of the resource
- **422 Unprocessable Entity**: The request was well-formed but contains semantic errors
- **429 Too Many Requests**: The user has sent too many requests in a given amount of time

### 9.7.3 Server Error Codes

- **500 Internal Server Error**: An unexpected error occurred on the server
- **502 Bad Gateway**: The server received an invalid response from an upstream service
- **503 Service Unavailable**: The server is currently unavailable (temporarily overloaded or down for maintenance)
- **504 Gateway Timeout**: The server did not receive a timely response from an upstream service

# 10. Cache Control and Rate Limiting

## 10.1 Cache Architecture

### 10.1.1 Multi-tier Cache Implementation

```typescript
interface CacheConfig {
    edge: {
        ttl: number;          // 5 minutes
        maxSize: string;      // "10GB"
        strategy: "LRU";
        syncInterval: number; // 1 minute
    };
    regional: {
        ttl: number;         // 1 hour
        maxSize: string;     // "100GB"
        strategy: "LFU";
        syncInterval: number; // 5 minutes
    };
    global: {
        ttl: number;         // 24 hours
        maxSize: string;     // "1TB"
        strategy: "ARC";
        syncInterval: number; // 15 minutes
    };
}

class CacheManager {
    private readonly caches: Map<CacheTier, Cache>;

    async get<T>(key: string): Promise<T | null> {
        // Try each cache tier
        for (const tier of this.getTiers()) {
            const result = await this.getFromTier<T>(tier, key);
            if (result) {
                // Propagate to higher tiers
                await this.propagateToHigherTiers(tier, key, result);
                return result;
            }
        }
        return null;
    }

    private async propagateToHigherTiers<T>(
        fromTier: CacheTier,
        key: string,
        value: T
    ): Promise<void> {
        const tiers = this.getHigherTiers(fromTier);
        await Promise.all(
            tiers.map(tier => this.caches.get(tier).set(key, value))
        );
    }
}
```

### 10.1.2 Cache Optimization

```typescript
class CacheOptimizer {
    async optimizeCache(
        config: OptimizationConfig
    ): Promise<OptimizationResult> {
        // Analyze current usage
        const usage = await this.analyzeUsage();

        // Optimize TTL values
        const ttlOptimization = await this.optimizeTTL(usage, config);

        // Optimize cache distribution
        const distributionOptimization = await this.optimizeDistribution(usage, config);

        // Optimize eviction policies
        const evictionOptimization = await this.optimizeEviction(usage, config);

        // Apply optimizations
        await this.applyOptimizations({
            ttl: ttlOptimization,
            distribution: distributionOptimization,
            eviction: evictionOptimization
        });

        return {
            improvements: {
                hitRate: ttlOptimization.hitRateImprovement,
                latency: distributionOptimization.latencyImprovement,
                efficiency: evictionOptimization.efficiencyImprovement
            },
            recommendations: this.generateRecommendations({
                ttl: ttlOptimization,
                distribution: distributionOptimization,
                eviction: evictionOptimization
            })
        };
    }

    private async optimizeTTL(
        usage: CacheUsage,
        config: OptimizationConfig
    ): Promise<TTLOptimization> {
        // Calculate optimal TTL for each asset type
        const assetTTLs = new Map<string, number>();
        
        for (const [assetType, stats] of usage.assetStats) {
            const optimal = this.calculateOptimalTTL(stats, config);
            assetTTLs.set(assetType, optimal);
        }

        // Calculate default TTL based on overall cache statistics
        const defaultTTL = this.calculateDefaultTTL(usage, config);
        
        // Estimate hit rate improvement based on new TTL values
        const currentHitRate = this.getCurrentHitRate(usage);
        const estimatedHitRate = this.estimateHitRate(usage, assetTTLs, defaultTTL);
        const hitRateImprovement = estimatedHitRate - currentHitRate;

        return {
            assetTTLs,
            defaultTTL,
            hitRateImprovement
        };
    }
    
    private calculateOptimalTTL(stats: AssetStats, config: OptimizationConfig): number {
        // Use access patterns to determine optimal TTL
        const accessFrequency = stats.accessCount / stats.timeWindow;
        const volatility = stats.updateCount / stats.timeWindow;
        
        // Base TTL calculation
        let baseTTL = 3600; // Default 1 hour
        
        // Adjust based on access frequency
        if (accessFrequency > config.highFrequencyThreshold) {
            baseTTL = Math.min(baseTTL * 2, 86400); // Maximum 24 hours
        } else if (accessFrequency < config.lowFrequencyThreshold) {
            baseTTL = Math.max(baseTTL / 2, 300); // Minimum 5 minutes
        }
        
        // Adjust based on volatility
        if (volatility > config.highVolatilityThreshold) {
            baseTTL = Math.max(baseTTL / 2, 300);
        } else if (volatility < config.lowVolatilityThreshold) {
            baseTTL = Math.min(baseTTL * 1.5, 86400);
        }
        
        return Math.round(baseTTL);
    }
    
    private calculateDefaultTTL(usage: CacheUsage, config: OptimizationConfig): number {
        // Calculate default TTL based on overall statistics
        const avgAccessFrequency = usage.totalAccesses / usage.timeWindow;
        const avgVolatility = usage.totalUpdates / usage.timeWindow;
        
        // Similar logic to calculateOptimalTTL but for overall cache
        const defaultTTL = 3600; // Default 1 hour
        
        // Apply adjustments based on average metrics
        let adjustedTTL = defaultTTL;
        
        if (avgAccessFrequency > config.highFrequencyThreshold) {
            adjustedTTL = Math.min(adjustedTTL * 1.5, 7200); // Maximum 2 hours for default
        }
        
        if (avgVolatility > config.highVolatilityThreshold) {
            adjustedTTL = Math.max(adjustedTTL / 1.5, 1800); // Minimum 30 minutes
        }
        
        return Math.round(adjustedTTL);
    }
}
```

## 10.2 Cache Invalidation Patterns

The NNA Framework supports sophisticated cache invalidation patterns to ensure data consistency while maintaining performance. This section provides detailed examples of common invalidation patterns.

### 10.2.1 Pattern-Based Invalidation

The system supports wildcards and pattern matching for efficient invalidation:

```xml
POST /v1/cache/invalidate
```

1. **Request (Invalidate by Layer)**

```json
{
    "patterns": [
        "S.*.*.*"  // Invalidate all Star assets
    ],
    "scope": {
        "edge": true,
        "regional": true,
        "global": false
    }
}
```

1. **Request (Invalidate by Category)**

```json
{
    "patterns": [
        "G.POP.*.*"  // Invalidate all Pop songs
    ],
    "scope": {
        "edge": true,
        "regional": true,
        "global": false
    }
}
```

1. **Request (Invalidate by Subcategory)**

```json
{
    "patterns": [
        "G.*.TSW.*"  // Invalidate all Taylor Swift songs
    ],
    "scope": {
        "edge": true,
        "regional": true,
        "global": false
    }
}
```

1. **Request (Composite Invalidation)**

```json
{
    "patterns": [
        "C.*:G.POP.TSW.*+*"  // Invalidate all compositions using Taylor Swift pop songs
    ],
    "scope": {
        "edge": true,
        "regional": false,
        "global": false
    }
}
```

1. **Response**

```json
{
    "success": true,
    "data": {
        "invalidated_keys": 15,
        "scopes": ["edge", "regional"],
        "regions": ["us-east", "eu-west"]
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_abc123"
    }
}
```

### 10.2.2 Relationship-Based Invalidation

When assets have relationships with other assets, you can invalidate related assets:

```xml
POST /v1/cache/invalidate/related
```

1. **Request**

```json
{
    "asset_id": "S.01.01.001",
    "relationship_types": [
        "compatible_with",
        "requires",
        "contains"
    ],
    "depth": 1,
    "scope": {
        "edge": true,
        "regional": true,
        "global": false
    }
}
```

1. **Response**

```json
jsonCopy{
    "success": true,
    "data": {
        "invalidated_keys": 23,
        "source_asset": "S.01.01.001",
        "related_assets": [
            "L.06.03.001",
            "M.04.01.001",
            "W.08.08.001"
        ],
        "scopes": ["edge", "regional"]
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_def456"
    }
}
```

### 10.2.3 User-Context Invalidation

Invalidate cached content associated with a specific user or context:

```xml
POST /v1/cache/invalidate/context
```

1. **Request**

```json
{
    "context_type": "user",
    "context_id": "u123456",
    "scope": {
        "edge": true,
        "regional": false,
        "global": false
    }
}
```

1. **Response**

```json
{
    "success": true,
    "data": {
        "invalidated_keys": 7,
        "context_type": "user",
        "context_id": "u123456",
        "scopes": ["edge"]
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_ghi789"
    }
}
```

### 10.2.4 Rights-Based Invalidation

When rights change, invalidate affected cached assets:

```xml
POST /v1/cache/invalidate/rights
```

1. **Request**

```json
{
    "grant_id": "grant_abc123",
    "cascade": true,
    "scope": {
        "edge": true,
        "regional": true,
        "global": true
    }
}
```

1. **Response**

```json
{
    "success": true,
    "data": {
        "invalidated_keys": 42,
        "grant_id": "grant_abc123",
        "affected_assets": [
            "G.01.TSW.001",
            "S.01.01.001"
        ],
        "scopes": ["edge", "regional", "global"]
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_jkl012"
    }
}
```

### 10.2.5 Implementing Cache Invalidation

```python
async def invalidate_cache(pattern: str, scopes: List[str]):
    """
    Invalidate all matching keys in the specified cache scopes
    """
    invalidation_tasks = []
    
    if "edge" in scopes:
        invalidation_tasks.append(edge_cache.invalidate_pattern(pattern))
    
    if "regional" in scopes:
        invalidation_tasks.append(regional_cache.invalidate_pattern(pattern))
    
    if "global" in scopes:
        invalidation_tasks.append(global_cache.invalidate_pattern(pattern))
    
    # Execute all invalidations in parallel
    results = await asyncio.gather(*invalidation_tasks, return_exceptions=True)
    
    # Process results
    total_invalidated = sum(r for r in results if isinstance(r, int))
    
    return {
        "invalidated_keys": total_invalidated,
        "scopes": scopes
    }
```

### 10.2.6 Best Practices for Cache Invalidation

1. **Use the narrowest pattern possible** - Invalidating with overly broad patterns can unnecessarily degrade cache performance
1. **Consider propagation delay** - Changes may take time to propagate across all cache layers
1. **Limit global cache invalidations** - Global cache invalidations are expensive and should be used sparingly
1. **Implement cascade invalidation carefully** - Cascading too deeply can lead to excessive invalidation
1. **Set appropriate TTLs** - Well-chosen TTLs can reduce the need for explicit invalidation

### 10.2.7 Monitoring Cache Invalidation

Monitor these metrics to ensure healthy cache invalidation patterns:

- `cache_invalidations_total{scope="<scope>"}` - Total invalidation operations by scope
- `cache_invalidated_keys_total{scope="<scope>"}` - Total keys invalidated by scope
- `cache_invalidation_duration_seconds` - Invalidation operation duration
- `cache_hit_rate{scope="<scope>"}` - Cache hit rate by scope (should remain above 85%)

For more detailed implementation specifics, refer to the [NNA Framework Technical Implementation Guide](https://celerity.slab.com/posts/xfxe04qg#h1mdm-6-performance-optimization).

## 10.3 Rate Limiting

### 10.3.1 Rate Limit Implementation

```typescript
interface RateLimitConfig {
    tiers: {
        standard: {
            requestsPerMinute: 1000;
            burst: 100;
            concurrent: 100;
        };
        enterprise: {
            requestsPerMinute: 5000;
            burst: 500;
            concurrent: 500;
        };
        custom: {
            requestsPerMinute: number;
            burst: number;
            concurrent: number;
        };
    };
}

class RateLimiter {
    private readonly redis: Redis;
    private readonly limits: Map<string, RateLimit>;

    async checkRateLimit(
        key: string,
        tier: string
    ): Promise<RateLimitResult> {
        const limit = this.limits.get(tier);
        const window = Math.floor(Date.now() / 1000);
        const requestKey = `ratelimit:${key}:${window}`;

        // Execute rate limiting logic in Redis
        const result = await this.redis.eval(`
            local current = redis.call('INCR', KEYS[1])
            local ttl = redis.call('TTL', KEYS[1])
            
            if ttl == -1 then
                redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1]))
            end
            
            return { current, ttl }
        `, 1, requestKey, limit.windowSize);

        return {
            allowed: result[0] <= limit.maxRequests,
            current: result[0],
            remaining: Math.max(0, limit.maxRequests - result[0]),
            reset: window + result[1]
        };
    }
}
```

### 10.3.2 Client Rate Limiting

```typescript
class RateLimitedClient {
    private readonly requestQueue: Queue<Request>;
    private readonly rateLimitConfig: {
        requestsPerMinute: number;
        burstSize: number;
    };
    private currentTokens: number;
    private lastRefillTimestamp: number;
    
    constructor(config: RateLimitConfig) {
        this.requestQueue = new Queue<Request>();
        this.rateLimitConfig = {
            requestsPerMinute: config.requestsPerMinute || 60,
            burstSize: config.burstSize || 10
        };
        // Initialize token bucket with maximum tokens
        this.currentTokens = this.rateLimitConfig.burstSize;
        this.lastRefillTimestamp = Date.now();
    }
    
    private refillTokens(): void {
        const now = Date.now();
        const timePassed = now - this.lastRefillTimestamp;
        const tokensToAdd = (timePassed / 60000) * this.rateLimitConfig.requestsPerMinute;
        
        if (tokensToAdd > 0) {
            this.currentTokens = Math.min(
                this.currentTokens + tokensToAdd,
                this.rateLimitConfig.burstSize
            );
            this.lastRefillTimestamp = now;
        }
    }

    async executeRequest(request: Request): Promise<Response> {
        // Refill tokens based on time elapsed
        this.refillTokens();
        
        if (this.isRateLimited()) {
            const waitTime = this.calculateWaitTime();
            await this.delay(waitTime);
            return this.executeRequest(request); // Retry after waiting
        }

        // Consume a token for this request
        this.currentTokens -= 1;
        
        try {
            const response = await this.makeRequest(request);
            this.updateRateLimitMetrics(response.headers);
            return response;
        } catch (error) {
            if (error instanceof RateLimitError) {
                return this.handleRateLimit(error, request);
            }
            throw error;
        }
    }

    private isRateLimited(): boolean {
        // If we have less than 1 token, we're rate limited
        return this.currentTokens < 1;
    }

    private calculateWaitTime(): number {
        // Calculate time needed for at least one token to be available
        return Math.max(
            0,
            (1 - this.currentTokens) * (60000 / this.rateLimitConfig.requestsPerMinute)
        );
    }
    
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

## 10.4 Address Registry API

The NNA Framework provides an API for managing the registry of Human-Friendly Names and their corresponding NNA Addresses.

### 10.4.1 Register a Human-Friendly Name

```xml
POST /v1/registry/register
```

- **Description**: Register a new Human-Friendly Name and map it to an NNA Address
- **Authentication**: Required (Admin only)
- **Rate Limit**: 100 requests/minute
1. **Request Format**

```json
{
    "layer": "G",
    "category_code": "POP",
    "subcategory_code": "TSW",
    "description": "Pop music, Taylor Swift works",
    "metadata": {
        "owner": "ReViz Music Division",
        "tags": ["pop", "female-artist", "english"]
    }
}
```

1. **Response Format**

```json
{
    "success": true,
    "data": {
        "friendly_name": "G.POP.TSW.*",
        "nna_address": "G.003.042.*",
        "registered_by": "admin@reviz.studio",
        "registered_at": "2025-02-23T10:30:00Z",
        "status": "active"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_def456"
    }
}
```

### 10.4.2 Look Up NNA Address

```xml
GET /v1/registry/lookup/friendly/{friendly_name}
```

- **Description**: Look up the NNA Address for a given Human-Friendly Name
- **Authentication**: Required
- **Rate Limit**: 1000 requests/minute
1. **Response Format**

```json
{
    "success": true,
    "data": {
        "friendly_name": "G.POP.TSW.*",
        "nna_address": "G.003.042.*",
        "registered_at": "2025-02-23T10:30:00Z",
        "status": "active"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_ghi789"
    }
}
```

### 10.4.3 Look Up Human-Friendly Name

```xml
GET /v1/registry/lookup/address/{nna_address}
```

- **Description**: Look up the Human-Friendly Name for a given NNA Address
- **Authentication**: Required
- **Rate Limit**: 1000 requests/minute
1. **Response Format**

```
{
    "success": true,
    "data": {
        "nna_address": "G.003.042.*",
        "friendly_name": "G.POP.TSW.*",
        "registered_at": "2025-02-23T10:30:00Z",
        "status": "active"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_jkl012"
    }
}

```

## 10.4 Performance Optimization

### 10.5.1 Cache Optimization

```typescript
class CacheOptimizer {
    async optimizeCache(
        config: OptimizationConfig
    ): Promise<OptimizationResult> {
        // Analyze current usage
        const usage = await this.analyzeUsage();

        // Optimize TTL values
        const ttlOptimization = await this.optimizeTTL(usage, config);

        // Optimize cache distribution
        const distributionOptimization = await this.optimizeDistribution(usage, config);

        // Optimize eviction policies
        const evictionOptimization = await this.optimizeEviction(usage, config);

        // Apply optimizations
        await this.applyOptimizations({
            ttl: ttlOptimization,
            distribution: distributionOptimization,
            eviction: evictionOptimization
        });

        return {
            improvements: {
                hitRate: ttlOptimization.hitRateImprovement,
                latency: distributionOptimization.latencyImprovement,
                efficiency: evictionOptimization.efficiencyImprovement
            },
            recommendations: this.generateRecommendations({
                ttl: ttlOptimization,
                distribution: distributionOptimization,
                eviction: evictionOptimization
            })
        };
    }

    private async optimizeTTL(
        usage: CacheUsage,
        config: OptimizationConfig
    ): Promise<TTLOptimization> {
        // Calculate optimal TTL for each asset type
        const assetTTLs = new Map<string, number>();
        
        for (const [assetType, stats] of usage.assetStats) {
            const optimal = this.calculateOptimalTTL(stats, config);
            assetTTLs.set(assetType, optimal);
        }

        return {
            assetTTLs,
            defaultTTL: this.calculateDefaultTTL(usage, config),
            hitRateImprovement: this.estimateHitRateImprovement(usage, assetTTLs)
        };
    }
}
```

### 10.5.2 Rate Limit Optimization

```typescript
class RateLimitOptimizer {
    async optimizeRateLimits(
        config: OptimizationConfig
    ): Promise<RateLimitOptimization> {
        // Analyze usage patterns
        const usage = await this.analyzeUsagePatterns();

        // Calculate optimal limits
        const limits = await this.calculateOptimalLimits(usage, config);

        // Optimize burst settings
        const burstSettings = await this.optimizeBurst(usage, config);

        // Calculate tier recommendations
        const tierRecommendations = await this.recommendTiers(usage, limits);

        return {
            limits,
            burstSettings,
            tierRecommendations,
            improvements: this.estimateImprovements(usage, limits, burstSettings)
        };
    }

    private async calculateOptimalLimits(
        usage: RateLimitUsage,
        config: OptimizationConfig
    ): Promise<OptimalLimits> {
        const userLimits = new Map<string, number>();
        
        for (const [userId, stats] of usage.userStats) {
            const p95Usage = stats.p95RequestRate;
            const buffer = p95Usage * config.bufferFactor;
            const optimal = Math.ceil(p95Usage + buffer);
            
            userLimits.set(userId, optimal);
        }

        return {
            userLimits,
            defaultLimit: this.calculateDefaultLimit(usage, config),
            adjustmentFactor: config.dynamicAdjustment ? 
                this.calculateAdjustmentFactor(usage) : 1.0
        };
    }
}
```

## 10.6 Cache Warming

### 10.6.1 Predictive Cache Warming

```typescript
class CacheWarmer {
    async warmCache(
        patterns: WarmingPattern[],
        options: WarmingOptions
    ): Promise<WarmingResult> {
        // Predict required assets
        const assets = await this.predictRequiredAssets(patterns, options);

        // Group assets by priority
        const prioritizedAssets = this.prioritizeAssets(assets);

        // Warm cache in batches
        const results = await this.warmInBatches(prioritizedAssets, options);

        return this.aggregateResults(results);
    }

    private async predictRequiredAssets(
        patterns: WarmingPattern[],
        options: WarmingOptions
    ): Promise<PredictedAsset[]> {
        // Use historical data to predict needed assets
        const historical = await this.getHistoricalData(options.timeframe);
        
        // Apply prediction models
        return this.applyPredictionModels(patterns, historical);
    }

    private async warmInBatches(
        prioritizedAssets: Map<Priority, PredictedAsset[]>,
        options: WarmingOptions
    ): Promise<BatchWarmingResult[]> {
        const results: BatchWarmingResult[] = [];
        
        // Process each priority level
        for (const [priority, assets] of prioritizedAssets.entries()) {
            // Split into batches
            const batches = this.splitIntoBatches(assets, options.batchSize);
            
            // Process batches
            for (const batch of batches) {
                const result = await this.processBatch(batch, priority, options);
                results.push(result);
                
                // Apply throttling if needed
                if (options.throttleBetweenBatches) {
                    await this.delay(options.batchDelay);
                }
            }
        }
        
        return results;
    }
}
```

### 10.6.2 Intelligent Cache Distribution

```typescript
class CacheDistributor {
    async distributeCache(
        config: DistributionConfig
    ): Promise<DistributionResult> {
        // Analyze regional usage
        const regionalUsage = await this.analyzeRegionalUsage();

        // Calculate optimal distribution
        const distribution = await this.calculateDistribution(regionalUsage, config);

        // Apply distribution
        await this.applyDistribution(distribution);

        return {
            distribution,
            improvements: this.estimateImprovements(regionalUsage, distribution),
            metrics: await this.collectDistributionMetrics()
        };
    }

    private async calculateDistribution(
        usage: RegionalUsage,
        config: DistributionConfig
    ): Promise<CacheDistribution> {
        const distribution = new Map<Region, AssetAllocation>();
        
        for (const [region, stats] of usage.regionStats) {
            // Calculate allocation for this region
            const allocation = this.calculateRegionalAllocation(region, stats, config);
            distribution.set(region, allocation);
        }
        
        return {
            regions: distribution,
            globalAssets: this.identifyGlobalAssets(usage),
            refreshSchedule: this.createRefreshSchedule(usage, config),
            replicationPolicy: this.createReplicationPolicy(usage, config)
        };
    }
}
```

## 10.7 Advanced Rate Limiting

### 10.7.1 Adaptive Rate Limiting

```typescript
class AdaptiveRateLimiter {
    async applyAdaptiveRateLimit(
        userId: string,
        context: RequestContext
    ): Promise<RateLimitDecision> {
        // Get user behavior profile
        const profile = await this.getUserProfile(userId);

        // Get system load
        const load = await this.getSystemLoad();

        // Calculate adaptive limit
        const limit = this.calculateAdaptiveLimit(profile, load, context);

        // Apply and track limit
        return this.applyLimit(userId, limit, context);
    }

    private calculateAdaptiveLimit(
        profile: UserProfile,
        load: SystemLoad,
        context: RequestContext
    ): RateLimit {
        // Base limit from user tier
        const baseLimit = this.getLimitForTier(profile.tier);
        
        // Adjust based on user behavior
        const userFactor = this.calculateUserFactor(profile);
        
        // Adjust based on system load
        const loadFactor = this.calculateLoadFactor(load);
        
        // Adjust based on endpoint sensitivity
        const endpointFactor = this.getEndpointFactor(context.endpoint);
        
        return {
            requestsPerMinute: Math.floor(
                baseLimit.requestsPerMinute * 
                userFactor * 
                loadFactor * 
                endpointFactor
            ),
            burst: Math.floor(baseLimit.burst * loadFactor),
            concurrent: baseLimit.concurrent
        };
    }
}
```

### 10.7.2 Cost-based Rate Limiting

```typescript
class CostBasedRateLimiter {
    async applyCostBasedLimit(
        userId: string,
        operation: Operation,
        context: RequestContext
    ): Promise<RateLimitDecision> {
        // Get user quota
        const quota = await this.getUserQuota(userId);

        // Calculate operation cost
        const cost = this.calculateOperationCost(operation, context);

        // Check if operation is allowed
        if (cost > quota.remaining) {
            return {
                allowed: false,
                remaining: quota.remaining,
                resetAt: quota.resetAt,
                reason: 'QUOTA_EXCEEDED'
            };
        }

        // Deduct cost from quota
        await this.deductFromQuota(userId, cost);

        return {
            allowed: true,
            cost,
            remaining: quota.remaining - cost,
            resetAt: quota.resetAt
        };
    }

    private calculateOperationCost(
        operation: Operation,
        context: RequestContext
    ): number {
        // Base cost from operation type
        const baseCost = this.getBaseCost(operation.type);
        
        // Adjust based on parameters
        const parameterCost = this.calculateParameterCost(operation.parameters);
        
        // Adjust based on resource impact
        const resourceCost = this.calculateResourceCost(operation, context);
        
        return baseCost + parameterCost + resourceCost;
    }
}
```

## 10.8 Cache Consistency

### 10.8.1 Consistency Protocols

```typescript
class CacheConsistencyManager {
    async maintainConsistency(
        key: string,
        operation: CacheOperation,
        options: ConsistencyOptions
    ): Promise<ConsistencyResult> {
        // Determine consistency level
        const level = this.determineConsistencyLevel(key, options);

        // Apply consistency protocol
        const result = await this.applyConsistencyProtocol(key, operation, level);

        // Verify consistency if required
        if (options.verify) {
            await this.verifyConsistency(key, operation, result);
        }

        return result;
    }

    private async applyConsistencyProtocol(
        key: string,
        operation: CacheOperation,
        level: ConsistencyLevel
    ): Promise<ConsistencyResult> {
        switch (level) {
            case 'STRONG':
                return this.applyStrongConsistency(key, operation);
            case 'EVENTUAL':
                return this.applyEventualConsistency(key, operation);
            case 'READ_YOUR_WRITES':
                return this.applyReadYourWritesConsistency(key, operation);
            default:
                return this.applyDefaultConsistency(key, operation);
        }
    }

    private async applyStrongConsistency(
        key: string,
        operation: CacheOperation
    ): Promise<ConsistencyResult> {
        // Get all cache nodes
        const nodes = await this.getCacheNodes();
        
        // Use two-phase commit
        const prepareResults = await this.prepare(nodes, key, operation);
        
        if (this.allPrepared(prepareResults)) {
            return this.commit(nodes, key, operation);
        } else {
            await this.abort(nodes, key);
            throw new ConsistencyError('Failed to prepare all nodes');
        }
    }
}
```

### 10.8.2 Cache Synchronization

```typescript
class CacheSynchronizer {
    async synchronizeCaches(
        options: SyncOptions
    ): Promise<SyncResult> {
        // Identify inconsistencies
        const inconsistencies = await this.identifyInconsistencies(options.scope);

        // Group by tier
        const groupedInconsistencies = this.groupByTier(inconsistencies);

        // Synchronize each tier
        const results = await Promise.all(
            Array.from(groupedInconsistencies.entries()).map(([tier, keys]) =>
                this.synchronizeTier(tier, keys, options)
            )
        );

        return this.aggregateResults(results);
    }

    private async identifyInconsistencies(
        scope: SyncScope
    ): Promise<Inconsistency[]> {
        // Get all cache keys in scope
        const keys = await this.getKeysInScope(scope);
        
        // Check each key across tiers
        const inconsistencies: Inconsistency[] = [];
        
        for (const key of keys) {
            const values = await this.getValuesAcrossTiers(key);
            
            if (this.hasInconsistencies(values)) {
                inconsistencies.push({
                    key,
                    values,
                    source: this.identifySource(values)
                });
            }
        }
        
        return inconsistencies;
    }
}
```

# 11. Migration and Updates

## 11.1 Deprecation Policy

- 6-month notice period
- Sunset dates and migration windows
- Automated usage reports
- Migration assistance tools

## 11.2 Version Support Matrix

| **Version** | **Status** | **Support Until** | **Migration Path** |
| --- | --- | --- | --- |
| v1 | Active | 2026-01 | N/A |
| v2-beta | Beta | - | - |

## 11.3 Breaking vs Non-Breaking Changes

- Breaking: URL path version change (v1 → v2)
- Non-Breaking: Query parameter version
- Patch: No version change required

## 11.4. Testing and Validation

### 11.4.1 Integration Testing Suite

```typescript
class IntegrationTestSuite {
    async validateEndpoint(
        endpoint: string,
        testCases: TestCase[]
    ): Promise<TestResult> {
        return {
            endpoint,
            results: await Promise.all(
                testCases.map(tc => this.runTestCase(endpoint, tc))
            ),
            coverage: await this.calculateCoverage(endpoint)
        };
    }
}
```

## 11.5 Testing Guidelines

### 11.5.1 Integration Testing

```typescript
describe('Asset Resolution', () => {
    it('should resolve single asset', async () => {
        const assetId = 'S.01.01.001';
        const response = await client.resolveAsset(assetId);
        
        expect(response.success).toBe(true);
        expect(response.data.asset_id).toBe(assetId);
        // Additional assertions...
    });

    it('should handle invalid asset IDs', async () => {
        try {
            await client.resolveAsset('invalid-id');
            fail('Should throw error');
        } catch (error) {
            expect(error.code).toBe('INVALID_ASSET_ID');
        }
    });
});
```

### 11.5.2 Load Testing

```typescript
class LoadTest {
    async runLoadTest(config: LoadTestConfig): Promise<TestResults> {
        const results: RequestResult[] = [];
        const startTime = Date.now();

        // Create virtual users
        const users = Array(config.concurrent_users)
            .fill(null)
            .map(() => this.createVirtualUser());

        // Run test scenarios
        await Promise.all(users.map(user => 
            this.runUserScenario(user, config, results)
        ));

        return this.analyzeResults(results, startTime);
    }

    private analyzeResults(
        results: RequestResult[],
        startTime: number
    ): TestResults {
        return {
            total_requests: results.length,
            success_rate: this.calculateSuccessRate(results),
            avg_response_time: this.calculateAvgResponseTime(results),
            percentiles: this.calculatePercentiles(results),
            duration_ms: Date.now() - startTime
        };
    }
}
```

## 11.6 Testing Guide: Integration Validation

Validate your NNA API integration with these tests:

1. **Unit Test: Asset Resolution**:

```javascript
const { NNAClient } = require('@reviz/nna-sdk');
   const assert = require('assert');

   async function testAssetResolution() {
       const client = new NNAClient({ apiKey: 'YOUR_API_KEY' });
       const asset = await client.asset.resolve('S.01.01.001');
       assert(asset.success, 'Asset resolution failed');
       assert(asset.data.asset_id === 'S.01.01.001', 'Wrong asset ID');
       console.log('Asset resolution test passed');
   }
   testAssetResolution().catch(console.error);
```

1. **Load Test: Batch Processing**:

```bash
# Using wrk tool
wrk -t10 -c100 -d30s -s batch.lua "https://api.reviz.studio/v1/asset/batch/resolve"
# batch.lua
wrk.method = "POST"
wrk.body = '{"assets": ["S.01.01.001", "L.06.03.001"], "options": {"parallel": true}}'
wrk.headers["Authorization"] = "Bearer YOUR_TOKEN"
```

1. **Error Test**: Retry on 429:
    - See [Section 9.3 - Error Recovery](#9-error-handling) for retry logic.

Run these with [Section 11.4 - Testing and Validation](#11-migration-and-updates). For setup, see [Implementation Guide, Section 8 - Testing](#8-testing-and-quality-assurance).

## 11.7 Webhook Integration API

```xml
POST /v1/webhooks/create
```

**Description**: Register a new webhook endpoint

**Authentication**: Required

**Rate Limit**: 100 requests/minute

1. **Request Format**

```json
{
    "url": "https://your-app.com/webhooks/nna",
    "events": [
        "asset.updated",
        "composition.completed",
        "rights.granted"
    ],
    "enabled": true,
    "secret": "your_webhook_secret",
    "metadata": {
        "name": "Production Webhook",
        "description": "Handles production events"
    }
}
```

1. **Response Format**

```json
{
    "success": true,
    "data": {
        "webhook_id": "wh_abc123",
        "url": "https://your-app.com/webhooks/nna",
        "events": [
            "asset.updated",
            "composition.completed",
            "rights.granted"
        ],
        "enabled": true,
        "created_at": "2025-02-23T10:30:00Z"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_stu901"
    }
}
```

1. **Implementation Example**

```typescript
class WebhookManager {
    async createWebhook(
        webhook: WebhookDefinition,
        options: WebhookOptions = {}
    ): Promise<Webhook> {
        // Validate URL
        await this.validateWebhookUrl(webhook.url);
        
        // Validate events
        this.validateEvents(webhook.events);
        
        // Create webhook record
        const webhookId = this.generateWebhookId();
        const newWebhook = {
            id: webhookId,
            url: webhook.url,
            events: webhook.events,
            enabled: webhook.enabled ?? true,
            secret: this.hashSecret(webhook.secret),
            metadata: webhook.metadata || {},
            created_at: new Date().toISOString(),
            created_by: options.userId
        };
        
        await this.store.createWebhook(newWebhook);
        
        // Send test event if requested
        if (options.sendTest) {
            await this.sendTestEvent(newWebhook);
        }
        
        return this.sanitizeWebhook(newWebhook);
    }
    
    private validateEvents(events: string[]): void {
        const validEvents = this.getValidEvents();
        
        for (const event of events) {
            if (!validEvents.includes(event)) {
                throw new ValidationError(`Invalid event: ${event}`);
            }
        }
    }
}
```

### 11.7.1 Webhook Event Payload Structure

```typescript
interface WebhookPayload {
    event_type: string;
    event_id: string;
    timestamp: string;
    data: any;
    metadata: {
        user_id?: string;
        request_id?: string;
        ip_address?: string;
    };
    signature: string;
}

// Example asset.updated payload
{
    "event_type": "asset.updated",
    "event_id": "evt_123456",
    "timestamp": "2025-02-23T10:35:00Z",
    "data": {
        "asset_id": "S.01.01.001",
        "previous_version": "1.0",
        "new_version": "1.1",
        "changes": [
            {
                "field": "metadata.tags",
                "old_value": ["pop", "classic"],
                "new_value": ["pop", "classic", "trending"]
            }
        ]
    },
    "metadata": {
        "user_id": "u789012",
        "request_id": "req_abc123"
    },
    "signature": "sha256=..."
}
```

### 11.7.2 Webhook Signature Verification

```typescript
class WebhookVerifier {
    verifySignature(
        payload: string,
        signature: string,
        secret: string
    ): boolean {
        const expectedSignature = this.generateSignature(payload, secret);
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }
    
    private generateSignature(payload: string, secret: string): string {
        return 'sha256=' + crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
    }
}
```

### 11.7.4 Webhook Event Types

The NNA Framework provides a comprehensive set of webhook events that allow applications to react to system changes in real-time.

### 11.7.4.1 Event Categories

| **Category** | **Event Prefix** | **Description** |
| --- | --- | --- |
| Asset | `asset.` | Asset-related events |
| Composition | `composition.` | Composition-related events |
| Rights | `rights.` | Rights management events |
| Preview | `preview.` | Preview generation events |
| System | `system.` | System-level events |
| Moves | `moves.` | Moves layer-specific events |
| Audio Effects | `audio_effects.` | Audio Effects layer events |
| Transitions | `transitions.` | Transitions layer events |
| Augmented Reality | `augmented_reality.` | AR layer events |
| Filters | `filters.` | Filters layer events |
| Text | `text.` | Text layer events |

### 11.7.4.2 Asset Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `asset.created` | New asset created | Asset creation completed |
| `asset.updated` | Asset updated | Asset metadata or content updated |
| `asset.deleted` | Asset deleted | Asset marked as deleted |
| `asset.version.created` | New asset version | New version of asset created |
| `asset.category.updated` | Category updated | Asset category information changed |

### 11.7.4.3 Composition Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `composition.created` | New composition created | Composition creation initiated |
| `composition.updated` | Composition updated | Composition components changed |
| `composition.deleted` | Composition deleted | Composition marked as deleted |
| `composition.processing` | Processing started | Composition processing started |
| `composition.complete` | Processing completed | Composition processing completed |
| `composition.failed` | Processing failed | Composition processing failed |

### 11.7.4.4 Rights Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `rights.granted` | Rights granted | Rights granted to user |
| `rights.revoked` | Rights revoked | Rights revoked from user |
| `rights.expired` | Rights expired | Rights expiration date reached |
| `rights.requested` | Rights requested | New rights request submitted |
| `rights.request.approved` | Request approved | Rights request approved |
| `rights.request.rejected` | Request rejected | Rights request rejected |

### 11.7.4.5 Preview Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `preview.requested` | Preview requested | Preview generation requested |
| `preview.processing` | Preview processing | Preview generation in progress |
| `preview.ready` | Preview ready | Preview generation completed |
| `preview.failed` | Preview failed | Preview generation failed |

### 11.7.4.6 System Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `system.maintenance` | Maintenance event | System maintenance scheduled |
| `system.api.deprecation` | API deprecation | API endpoint deprecated |
| `system.api.version` | New API version | New API version released |
| `system.alert` | System alert | System alert triggered |

### 11.7.4.7 Moves Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `moves.tutorial.updated` | Tutorial video updated | Tutorial video for a Moves asset updated |
| `moves.biomechanical.updated` | Biomechanical metadata updated | Biomechanical metadata (e.g., `Movement_Speed`) updated |

### 11.7.4.8 Audio Effects Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `audio_effects.applied` | Audio effect applied | Audio effect applied to a composition |

### 11.7.4.9 Transitions Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `transitions.applied` | Transition applied | Transition applied to a composition |

### 11.7.4.10 Augmented Reality Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `augmented_reality.applied` | AR effect applied | AR effect applied to a composition |

### 11.7.4.11 Filters Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `filters.applied` | Filter applied | Filter applied to a composition |

### 11.7.4.12 Text Events

| **Event Type** | **Description** | **Trigger** |
| --- | --- | --- |
| `text.added` | Text overlay added | Text overlay added to a composition |
| `text.updated` | Text overlay updated | Text overlay updated in a composition |

### 11.7.5 Webhook Payload Examples

### 11.7.5.1 Asset Created Event

```json
{
  "event_type": "asset.created",
  "event_id": "evt_a1b2c3",
  "timestamp": "2025-02-23T10:30:00Z",
  "data": {
    "asset_id": "S.01.01.001",
    "friendly_name": "S.POP.CLS.001",
    "type": "star",
    "category": "pop",
    "subcategory": "classic",
    "created_by": "u123456",
    "urls": {
      "preview": "https://cdn.reviz.studio/assets/S.01.01.001/preview.mp4",
      "thumbnail": "https://cdn.reviz.studio/assets/S.01.01.001/thumb.jpg",
      "full": "https://cdn.reviz.studio/assets/S.01.01.001/full.mp4"
    }
  },
  "metadata": {
    "user_id": "u123456",
    "request_id": "req_abc123"
  },
  "signature": "sha256=..."
}
```

### 11.7.5.2 Composition Complete Event

```json
{
  "event_type": "composition.complete",
  "event_id": "evt_d4e5f6",
  "timestamp": "2025-02-23T10:35:00Z",
  "data": {
    "composite_id": "comp_abc123",
    "components": {
      "song": "G.01.TSW.001",
      "star": "S.01.01.001",
      "look": "L.06.03.001"
    },
    "created_by": "u123456",
    "processing_time": 12500,
    "urls": {
      "preview": "https://cdn.reviz.studio/compositions/comp_abc123/preview.mp4",
      "full": "https://cdn.reviz.studio/compositions/comp_abc123/full.mp4"
    }
  },
  "metadata": {
    "user_id": "u123456",
    "request_id": "req_def456"
  },
  "signature": "sha256=..."
}
```

### 11.7.5.3 Rights Granted Event

```json
{
  "event_type": "rights.granted",
  "event_id": "evt_g7h8i9",
  "timestamp": "2025-02-23T10:40:00Z",
  "data": {
    "grant_id": "grant_abc123",
    "asset_id": "S.01.01.001",
    "user_id": "u123456",
    "rights_type": "full",
    "expiration": "2025-03-23T10:40:00Z",
    "restrictions": {
      "territories": ["US", "EU"],
      "usage_types": ["personal", "commercial"],
      "platforms": ["all"]
    },
    "granted_by": "u789012"
  },
  "metadata": {
    "user_id": "u789012",
    "request_id": "req_ghi789"
  },
  "signature": "sha256=..."
}
```

## 11.7.6 Webhook Security

### 11.7.6.1 Signature Verification

Each webhook event includes a signature that should be verified to ensure the event originated from the NNA Framework:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  // Generate expected signature
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  // Only compare if both signature strings have the same length
  // This prevents timing attacks while avoiding errors
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  try {
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    // Log the error for troubleshooting
    console.error('Signature verification error:', error.message);
    return false;
  }
}

// Express.js example
app.post('/webhook', (req, res) => {
  const payload = req.body;
  const signature = req.headers['x-nna-signature'];
  const secret = 'your_webhook_secret';
  
  if (!signature || !verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process valid webhook
  console.log(`Received event: ${payload.event_type}`);
  
  // Handle specific event types
  switch (payload.event_type) {
    case 'composition.complete':
      handleCompletedComposition(payload.data);
      break;
    case 'rights.granted':
      handleRightsGranted(payload.data);
      break;
    // Handle other event types...
  }
  
  res.status(200).send('OK');
});
```

### 11.7.6.2 Security Best Practices

1. **Verify Signatures**: Always verify webhook signatures to prevent spoofing
1. **Use HTTPS**: Only accept webhooks over HTTPS connections
1. **Store Secrets Securely**: Never hardcode webhook secrets in source code
1. **Implement Timeouts**: Set reasonable timeouts for webhook processing
1. **Handle Retries**: Implement idempotent webhook processing to handle retries
1. **Monitor Events**: Track webhook delivery and failure metrics
1. **Rate Limit**: Implement rate limiting for webhook endpoints

### 11.7.6.3 Handling Failed Deliveries

The NNA Framework implements automatic retries for failed webhook deliveries with the following retry schedule:

1. Initial retry: 5 seconds after failure
1. Second retry: 30 seconds after first retry
1. Third retry: 2 minutes after second retry
1. Fourth retry: 10 minutes after third retry
1. Fifth retry: 30 minutes after fourth retry

After the fifth retry, the webhook is marked as failed, and can be manually retried through the dashboard.

## 11.7.7 Webhook Management

### 11.7.7.1 Listing Webhooks

```xml
GET /v1/webhooks
```

**Response Format**

```json
{
  "success": true,
  "data": {
    "webhooks": [
      {
        "webhook_id": "wh_abc123",
        "url": "https://example.com/webhooks/nna",
        "events": ["asset.updated", "composition.complete"],
        "created_at": "2025-02-01T10:30:00Z",
        "status": "active"
      },
      {
        "webhook_id": "wh_def456",
        "url": "https://example.org/api/hooks",
        "events": ["rights.granted", "rights.revoked"],
        "created_at": "2025-02-10T15:45:00Z",
        "status": "active"
      }
    ]
  },
  "metadata": {
    "timestamp": "2025-02-23T10:30:00Z",
    "request_id": "req_jkl012"
  }
}
```

### 11.7.7.2 Updating Webhooks

```xml
xmlCopyPATCH /v1/webhooks/{webhook_id}
```

**Request Format**

```json
{
  "events": ["asset.updated", "composition.complete", "rights.granted"],
  "enabled": true,
  "metadata": {
    "description": "Updated production webhook"
  }
}
```

**Response Format**

```json
{
  "success": true,
  "data": {
    "webhook_id": "wh_abc123",
    "url": "https://example.com/webhooks/nna",
    "events": ["asset.updated", "composition.complete", "rights.granted"],
    "enabled": true,
    "updated_at": "2025-02-23T10:30:00Z"
  },
  "metadata": {
    "timestamp": "2025-02-23T10:30:00Z",
    "request_id": "req_mno345"
  }
}
```

### 11.7.7.3 Testing Webhooks

```xml
xmlCopyPOST /v1/webhooks/{webhook_id}/test
```

**Request Format**

```json
{
  "event_type": "asset.updated",
  "test_data": {
    "asset_id": "S.01.01.001",
    "friendly_name": "S.POP.CLS.001"
  }
}
```

**Response Format**

```json
{
  "success": true,
  "data": {
    "delivery_id": "del_pqr678",
    "status": "delivered",
    "response_code": 200,
    "response_body": "OK",
    "delivery_time_ms": 235
  },
  "metadata": {
    "timestamp": "2025-02-23T10:30:00Z",
    "request_id": "req_stu901"
  }
}
```



## 11.8 Analytics API Documentation

```xml
GET /v1/analytics/compositions
```

**Description**: Get analytics data for compositions

**Authentication**: Required

**Rate Limit**: 200 requests/minute

1. **Request Parameters**

```typescript
interface AnalyticsRequest {
    // Query Parameters
    start_date: string;       // ISO 8601 date
    end_date: string;         // ISO 8601 date
    interval: string;         // "day", "week", "month"
    metrics: string[];        // "views", "shares", "completions", "remixes"
    dimensions: string[];     // "song", "star", "platform"
    filters?: {
        [key: string]: string | string[];
    };
}
```

1. **Response Format**

```json
{
    "success": true,
    "data": {
        "start_date": "2025-01-01T00:00:00Z",
        "end_date": "2025-02-01T00:00:00Z",
        "interval": "week",
        "metrics": ["views", "shares"],
        "dimensions": ["song"],
        "results": [
            {
                "dimensions": {
                    "song": "G.01.TSW.001"
                },
                "metrics": {
                    "views": [1200, 1450, 1700, 2100],
                    "shares": [45, 60, 72, 95]
                },
                "timestamps": [
                    "2025-01-01T00:00:00Z",
                    "2025-01-08T00:00:00Z",
                    "2025-01-15T00:00:00Z",
                    "2025-01-22T00:00:00Z"
                ]
            }
        ],
        "totals": {
            "views": 6450,
            "shares": 272
        }
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_vwx234"
    }
}
```

1. **Implementation Example**

```typescript
class AnalyticsService {
    async getCompositionAnalytics(
        params: AnalyticsParams,
        options: AnalyticsOptions = {}
    ): Promise<AnalyticsResult> {
        // Validate date range
        this.validateDateRange(params.start_date, params.end_date);
        
        // Validate metrics and dimensions
        this.validateMetricsAndDimensions(params.metrics, params.dimensions);
        
        // Parse interval
        const interval = this.parseInterval(params.interval);
        
        // Build query
        const query = this.buildAnalyticsQuery(params, options);
        
        // Execute query
        const queryResults = await this.dataStore.executeQuery(query);
        
        // Format results
        return this.formatAnalyticsResults(queryResults, params);
    }
    
    private buildAnalyticsQuery(
        params: AnalyticsParams,
        options: AnalyticsOptions
    ): AnalyticsQuery {
        // Time dimension is always included
        const dimensions = ['time', ...params.dimensions];
        
        // Build query object
        return {
            dimensions,
            metrics: params.metrics,
            filters: this.buildFilters(params.filters, options),
            time_range: {
                start: params.start_date,
                end: params.end_date,
                interval: params.interval
            },
            limit: options.limit || 1000,
            offset: options.offset || 0
        };
    }
}
```

## 11.9 Comprehensive Workflow Examples

### 11.9.1 Creating and Publishing a Music Video

```typescript
// Step 1: Search for a song
const songSearchResults = await client.asset.search({
    layer_type: 'G',
    query: 'Shake It Off'
});

const song = songSearchResults.data.results[0];

// Step 2: Get compatible stars
const compatibleStars = await client.asset.search({
    layer_type: 'S',
    compatible_with: song.asset_id
});

const selectedStar = compatibleStars.data.results[0];

// Step 3: Get compatible looks
const compatibleLooks = await client.asset.search({
    layer_type: 'L',
    compatible_with: selectedStar.asset_id
});

const selectedLook = compatibleLooks.data.results[0];

// Step 4: Upload user's headshot for personalization
const headshotUpload = await client.upload.headshot({
    file: userPhoto,
    returnFaceAnalysis: true
});

// Step 5: Create WebSocket connection for real-time previews
const ws = client.preview.connect();

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'preview.ready') {
        // Update UI with preview URL
        updatePreviewPlayer(message.data.url);
    } else if (message.type === 'composition.status') {
        // Update progress UI
        updateProgressBar(message.data.progress.percentage);
    }
};

// Step 6: Create composition
const composition = await client.composition.create({
    components: {
        song: song.asset_id,
        star: selectedStar.asset_id,
        look: selectedLook.asset_id
    },
    personalization: {
        headshot_id: headshotUpload.data.headshot_id
    },
    options: {
        resolution: '1920x1080',
        format: 'mp4',
        quality: 85
    }
});

// Step 7: Subscribe to preview updates
ws.send(JSON.stringify({
    type: 'subscribe_preview',
    data: {
        composite_id: composition.data.composite_id,
        quality: 'medium'
    }
}));

// Step 8: Monitor composition status
const pollStatus = async () => {
    const status = await client.composition.status(composition.data.composite_id);
    
    if (status.data.status === 'ready') {
        // Composition is ready, get final URLs
        const finalComposition = await client.composition.get(composition.data.composite_id);
        
        // Display final video
        displayFinalVideo(finalComposition.data.urls.full);
        
        // Enable publishing
        enablePublishButton();
    } else if (status.data.status === 'failed') {
        // Handle failure
        displayError(status.data.error);
    } else {
        // Still processing, check again in 5 seconds
        setTimeout(pollStatus, 5000);
    }
};

pollStatus();

// Step 9: Publish to platforms (when user clicks publish)
const publishVideo = async (platforms) => {
    const publishResult = await client.publish.toMultiple({
        composite_id: composition.data.composite_id,
        platforms: platforms, // e.g., ['tiktok', 'instagram']
        metadata: {
            title: 'My Awesome Music Video',
            description: 'Check out my remix!',
            tags: ['music', 'remix', 'fun']
        }
    });
    
    // Display publish results
    displayPublishResults(publishResult.data.platforms);
};
```

### 11.9.2 Rights Management Workflow

```typescript
// Step 1: Check if user has rights to an asset
const rightsCheck = await client.rights.verify('S.01.01.001');

if (!rightsCheck.data.has_rights) {
    // Step 2: Request rights (admin user)
    const grantRights = await client.rights.grant({
        asset_id: 'S.01.01.001',
        user_id: 'u123456',
        rights_type: 'limited',
        duration: 'P30D', // 30 days
        restrictions: {
            territories: ['US', 'CA', 'MX'],
            usage_types: ['personal']
        }
    });
    
    // Step 3: Notify user that rights have been granted
    notifyUser(grantRights.data);
}

// Step 4: List all rights for a user
const userRights = await client.rights.list('u123456');

// Display rights to user
displayRightsList(userRights.data.rights);

// Step 5: Revoke rights when needed
const revokeResult = await client.rights.revoke('grant_abc123', {
    reason: 'Project completed'
});

// Log revocation
logRevocation(revokeResult.data);
```

### 11.9.3 Real-time Collaboration with WebSockets

```typescript
// Step 1: Connect to collaboration WebSocket
const collaborationWs = new WebSocket('wss://api.reviz.studio/v1/collaborate');

// Step 2: Authenticate
collaborationWs.onopen = () => {
    collaborationWs.send(JSON.stringify({
        type: 'auth',
        data: {
            token: 'YOUR_AUTH_TOKEN',
            session_id: 'collab_session_123'
        }
    }));
};

// Step 3: Join collaboration session
collaborationWs.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'auth.success') {
        // Successfully authenticated
        collaborationWs.send(JSON.stringify({
            type: 'collab.join',
            data: {
                session_id: 'collab_session_123',
                user_info: {
                    name: 'John Doe',
                    role: 'editor'
                }
            }
        }));
    } else if (message.type === 'collab.user_joined') {
        // Another user joined
        addUserToParticipantsList(message.data.user);
    } else if (message.type === 'collab.update') {
        // Update received from another user
        applyCollaborativeUpdate(message.data.update);
    }
};

// Step 4: Send updates when user makes changes
function sendCollaborativeUpdate(update) {
    collaborationWs.send(JSON.stringify({
        type: 'collab.update',
        data: {
            session_id: 'collab_session_123',
            update: update
        }
    }));
}

// Example: User changes a component
function onUserSelectsComponent(component) {
    const update = {
        type: 'component_changed',
        component_type: component.type,
        new_value: component.id,
        timestamp: Date.now()
    };
    
    // Apply locally
    applyCollaborativeUpdate(update);
    
    // Send to collaborators
    sendCollaborativeUpdate(update);
}

// Step 5: Handle disconnections
collaborationWs.onclose = (event) => {
    if (event.code !== 1000) {
        // Unexpected close, attempt to reconnect
        setTimeout(() => {
            // Reconnect logic
        }, 5000);
    }
    
    // Update UI
    updateCollaborationStatus('disconnected');
};
```

## 11.10 API Change Management Guidelines

### 11.10.1 Monitoring API Changes

Subscribers should regularly check for upcoming changes through:

1. The Developer Portal dashboard at `https://developer.reviz.studio`
1. The API Status page at `https://status.reviz.studio`
1. The Developer Newsletter (monthly)
1. Email notifications for breaking changes

### 11.10.2 Version Compatibility Testing

1. **Sandbox Environment**: Test integrations against `https://api-sandbox.reviz.studio/v1/` to verify compatibility with upcoming changes.
1. **Version Pinning**: When needed, pin to a specific API version using the `X-API-Version` header.
1. **CI/CD Integration**: Add API version compatibility tests to your CI/CD pipeline.

### 11.10.3 Migration Assistance

1. **Migration Guides**: Each major API change includes detailed migration guides at `https://developer.reviz.studio/migrations`.
1. **Support Channels**: Technical support is available for migration assistance through:
    - Developer Discord community
    - Support tickets at `https://support.reviz.studio`
    - Office hours sessions (scheduled monthly)

# 12. Appendices

## Appendix A: Complete Request/Response Examples

## A.1 Creating a Composition

1. **Request**

```
POST /v1/composition/create HTTP/1.1
Host: api.reviz.studio
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
Content-Type: application/json

{
  "components": {
    "song": "G.01.TSW.001",
    "star": "S.01.01.001",
    "look": "L.06.03.001",
    "moves": "M.04.01.001",
    "world": "W.08.08.001",
    "vibe": "V.02.06.001"
  },
  "options": {
    "resolution": "1920x1080",
    "format": "mp4",
    "quality": 85,
    "output_formats": ["portrait", "landscape"]
  }
}
```

1. **Response**

```typescript
HTTP/1.1 201 Created
Content-Type: application/json
X-Request-ID: req_abc123

{
  "success": true,
  "data": {
    "composite_id": "comp_xyz789",
    "status": "processing",
    "components": {
      "song": "G.01.TSW.001",
      "star": "S.01.01.001",
      "look": "L.06.03.001",
      "moves": "M.04.01.001",
      "world": "W.08.08.001",
      "vibe": "V.02.06.001"
    },
    "options": {
      "resolution": "1920x1080",
      "format": "mp4",
      "quality": 85,
      "output_formats": ["portrait", "landscape"]
    },
    "estimated_completion": "2025-02-23T10:35:00Z"
  },
  "metadata": {
    "timestamp": "2025-02-23T10:30:00Z",
    "request_id": "req_abc123",
    "version": "1.0.2"
  }
}
```

## A.2 Registry Management API

The Name Registry API enables management of the Human-Friendly Name to NNA Address mappings.

### A.1.1 Register a Human-Friendly Name Pattern

```xml
POST /v1/registry/register
```

- **Description**: Register a new Human-Friendly Name pattern and map it to an NNA Address pattern 
- **Authentication**: Required (Admin only) 
- **Rate Limit**: 100 requests/minute
- 
1. **Request Format**:

```json
{
    "layer": "G",
    "category_code": "POP",
    "subcategory_code": "TSW",
    "description": "Pop music, Taylor Swift works",
    "metadata": {
        "owner": "ReViz Music Division",
        "tags": ["pop", "female-artist", "english"]
    }
}
```

1. **Response Format**:

```json
{
    "success": true,
    "data": {
        "friendly_name": "G.POP.TSW.*",
        "nna_address": "G.003.042.*",
        "registered_by": "admin@reviz.studio",
        "registered_at": "2025-02-23T10:30:00Z",
        "status": "active"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_def456"
    }
}
```

### A.1.2 Look Up NNA Address

```xml
GET /v1/registry/lookup/friendly/{friendly_name}
```

- **Description**: Look up the NNA Address for a given Human-Friendly Name
- **Authentication**: Required 
- **Rate Limit**: 1000 requests/minute
- 
1. **Response Format**:

```json
{
    "success": true,
    "data": {
        "friendly_name": "G.POP.TSW.001",
        "nna_address": "G.003.042.001",
        "registered_at": "2025-02-23T10:30:00Z",
        "status": "active"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_ghi789",
        "nna_version": "1"
    }
}
```

### A.1.3 Look Up Human-Friendly Name

```xml
GET /v1/registry/lookup/address/{nna_address}
```

- **Description**: Look up the Human-Friendly Name for a given NNA Address
- **Authentication**: Required 
- **Rate Limit**: 1000 requests/minute
- 
1. **Response Format**:

```
{
    "success": true,
    "data": {
        "nna_address": "G.003.042.001",
        "friendly_name": "G.POP.TSW.001",
        "registered_at": "2025-02-23T10:30:00Z",
        "status": "active"
    },
    "metadata": {
        "timestamp": "2025-02-23T10:30:00Z",
        "request_id": "req_jkl012"
    }
}
```

# Appendix B: Client Implementation Comparison

The following examples demonstrate how to resolve an asset using different client technologies:

## B.1 JavaScript/TypeScript

```javascript
const { NNAClient } = require('@reviz/nna-sdk');
const client = new NNAClient({ apiKey: 'YOUR_API_KEY' });

async function resolveAsset() {
  try {
    const asset = await client.asset.resolve('S.01.01.001');
    console.log(`Asset resolved: ${asset.data.asset_id}`);
    return asset;
  } catch (error) {
    console.error(`Error ${error.code}: ${error.message}`);
    throw error;
  }
}
```

## B.2 Python

```python
from reviz.nna import NNAClient

client = NNAClient(api_key="YOUR_API_KEY")

async def resolve_asset():
    try:
        asset = await client.resolve_asset("S.01.01.001")
        print(f"Asset resolved: {asset.data.asset_id}")
        return asset
    except Exception as e:
        print(f"Error {e.code}: {e.message}")
        raise
```

## B3. Java

```java
import com.reviz.nna.NNAClient;
import com.reviz.nna.models.Asset;
import com.reviz.nna.exception.NNAException;

public class AssetResolver {
    public static void main(String[] args) {
        NNAClient client = new NNAClient.Builder()
            .apiKey("YOUR_API_KEY")
            .build();
            
        try {
            Asset asset = client.resolveAsset("S.01.01.001").get();
            System.out.println("Asset resolved: " + asset.getData().getAssetId());
        } catch (NNAException e) {
            System.err.println("Error " + e.getCode() + ": " + e.getMessage());
            throw e;
        }
    }
}
```

## B4. Ruby

```ruby
require 'reviz/nna'

client = Reviz::NNA::Client.new(api_key: 'YOUR_API_KEY')

begin
  asset = client.asset.resolve('S.01.01.001')
  puts "Asset resolved: #{asset.data.asset_id}"
rescue Reviz::NNA::Error => e
  puts "Error #{e.code}: #{e.message}"
  raise
end
```

## B.5 Go

```ruby
package main

import (
    "fmt"
    "log"
    
    "github.com/reviz/nna-go"
)

func main() {
    client := nna.NewClient(nna.WithAPIKey("YOUR_API_KEY"))
    
    asset, err := client.Asset.Resolve("S.01.01.001")
    if err != nil {
        if nnaErr, ok := err.(nna.Error); ok {
            log.Fatalf("Error %s: %s", nnaErr.Code, nnaErr.Message)
        }
        log.Fatal(err)
    }
    
    fmt.Printf("Asset resolved: %s\n", asset.Data.AssetID)
}
```

# 13. Cross-Document Index

Find key topics across the NNA Framework documentation:

- **Asset Resolution**:
    - Whitepaper: [Section 3.2 - Framework Components](#3-system-architecture)
    - Implementation Guide: [Section 3.1 - Asset Resolution Service](#3-service-layer-implementation)
    - API Specification: [Section 3.1 - Asset Resolution](#3-core-ap-is)
- **Caching**:
    - Whitepaper: [Section 3.2.3 - Cache Architecture](#3-system-architecture)
    - Implementation Guide: [Section 3.2 - Cache Service Implementation](#3-service-layer-implementation)
    - API Specification: [Section 10.1 - Cache Architecture](#10-cache-control-and-rate-limiting)
- **Security**:
    - Whitepaper: [Section 3.6 - Security Framework](#3-system-architecture)
    - Implementation Guide: [Section 5 - Security Implementation](#5-security-implementation)
    - API Specification: [Section 2 - Authentication and Security](#2-authentication-and-security)
- **AI Integration (AlgoRhythm)**:
    - Whitepaper: [Section 4.2 - AlgoRhythm Integration](#4-integration-architecture)
    - Implementation Guide: [Section 4.2 - AlgoRhythm + NNA Integration](#4-data-layer-implementation)
    - API Specification: [Section 6.1 - AlgoRhythm AI Integration](#6-integration-guidelines)
- **Troubleshooting**:
    - Implementation Guide: [Section 10 - Troubleshooting Guide](#10-troubleshooting-guide)
    - API Specification: [Section 9 - Error Handling](#9-error-handling)

This index links critical topics across the Whitepaper, Implementation Guide, and API Specification for quick reference.

---

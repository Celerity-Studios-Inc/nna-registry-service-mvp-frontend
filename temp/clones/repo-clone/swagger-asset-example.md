# Swagger UI Asset Creation Guide

When creating an asset through the Swagger UI, follow these steps exactly:

## 1. Authentication
First, make sure you're authenticated:
1. Execute the `/auth/login` endpoint with your credentials
2. Copy the JWT token from the response
3. Click the "Authorize" button at the top of the Swagger UI
4. Enter the token in the format: `Bearer your_token_here`
5. Click "Authorize" and close the modal

## 2. Asset Creation Steps
Go to the `/assets` POST endpoint and:

1. **File**: Click "Select a file" and choose your image/audio/video file

2. **Basic Information**:
   - layer: Enter "S" (without quotes)
   - category: Enter "Pop" (without quotes)
   - subcategory: Enter "Base" (without quotes)
   - source: Enter "ReViz" (without quotes)
   - description: Enter your asset description

3. **Tags**: This is an array - DO NOT enter comma-separated values:
   - Click "Add string item"
   - Enter "Olivia" and press Add
   - Click "Add string item" again
   - Enter "Pop Star" and press Add
   - Repeat for each additional tag

4. **TrainingData**: Click "Edit Value" and enter this JSON:
   ```json
   {
     "prompts": ["Create a contemporary pop star performer with universal appeal."],
     "images": [],
     "videos": []
   }
   ```

5. **Rights**: Click "Edit Value" and enter this JSON:
   ```json
   {
     "source": "Original",
     "rights_split": "100% ReViz"
   }
   ```

6. **Components**: If you have no components, simply don't add any items to this array.
   If you do have components:
   - Click "Add string item"
   - Enter the component ID and press Add
   - Repeat for additional components

7. Click "Execute" to create the asset

## 3. Example API Response
If successful, you'll get a response like:

```json
{
  "success": true,
  "data": {
    "layer": "S",
    "category": "Pop",
    "subcategory": "Base",
    "name": "S-Pop-Base-001",
    "nna_address": "S.Pop.Base.001",
    "gcpStorageUrl": "file:///Users/ajaymadhok/nna-registry-service/storage/S/Pop/Base/test-image.png",
    "source": "ReViz",
    "tags": ["Olivia", "Pop Star", "Pop Diva"],
    "description": "Olivia as a Pop Star, Pop Diva",
    "trainingData": { ... },
    "rights": { ... },
    "components": [],
    "_id": "67f83c68c295111e2beb4c02",
    "createdAt": "2025-04-10T21:47:20.539Z",
    "updatedAt": "2025-04-10T21:47:20.539Z"
  },
  "metadata": {
    "timestamp": "2025-04-10T21:47:20.546Z"
  }
}
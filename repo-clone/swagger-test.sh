#!/bin/bash

# Set your JWT token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2Y4MzBhZjNjMGM1YzM4MTY5MDhkNTkiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc0NDMyMTE1OSwiZXhwIjoxNzQ0NDA3NTU5fQ.H_H6Szz1gb0AqVZ_EI3kLEfeesI6gryG55vAQ8MOxk8"

# Create a test image file
echo "This is a test image" > test-image.png

# Execute the curl command with proper array format
curl -X POST \
  http://localhost:3001/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-image.png" \
  -F "layer=S" \
  -F "category=Pop" \
  -F "subcategory=Base" \
  -F "source=ReViz" \
  -F "tags[]="Olivia"" \
  -F "tags[]="Pop Star"" \
  -F "tags[]="Pop Diva"" \
  -F "description=Olivia as a Pop Star, Pop Diva" \
  -F 'trainingData={"prompts":["Create a contemporary pop star performer with universal appeal."],"images":[],"videos":[]}' \
  -F 'rights={"source":"Original","rights_split":"100% ReViz"}' \
  -F "components[]="
#!/bin/bash

# Set your JWT token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2Y4MzBhZjNjMGM1YzM4MTY5MDhkNTkiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc0NDMxODg2NCwiZXhwIjoxNzQ0NDA1MjY0fQ.UU2Q8okMULqScEH6vs6gOfJKu6tsWJHBnDPXCUflRDI"

# Set the path to your image file
IMAGE_FILE="/Users/ajaymadhok/nna-registry-service/test/olivia-pop-diva.png"

# Execute the curl command with individually specified parameters
curl -X POST \
"http://localhost:3001/assets" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: multipart/form-data" \
-F "file=@$IMAGE_FILE" \
-F "layer=S" \
-F "category=Pop" \
-F "subcategory=Base" \
-F "source=ReViz" \
-F "tags[]=Olivia" \
-F "tags[]=Pop Star" \
-F "tags[]=Diva" \
-F "description=This is the Base Star, Olivia" \
-F "trainingData={\"prompts\":[\"Create a contemporary pop star performer with universal appeal.\"],\"images\":[],\"videos\":[]}" \
-F "rights={\"source\":\"Original\",\"rights_split\":\"100% ReViz\"}" \
-F "components[]="
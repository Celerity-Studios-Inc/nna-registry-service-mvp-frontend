# Google Cloud Service Account Instructions

Based on the screenshot, there are several service accounts available in your Google Cloud project. Let's use one of these to manually authenticate and deploy the application.

## Available Service Accounts

1. **CI/CD Service Account**: 
   `ci-cd-service-account@revize-453014.iam.gserviceaccount.com`
   Created: May 4, 2025

2. **GitHub Actions**:
   `github-actions@revize-453014.iam.gserviceaccount.com`
   Created: Apr 28, 2025

3. **GKE Service Account**:
   `gke-service-account@revize-453014.iam.gserviceaccount.com`

4. **RevViz Account**:
   `reviz-684@revize-453014.iam.gserviceaccount.com`
   Description: Enable building and deployment of the NNA Registry Service

## How to Create and Download a Key

To manually deploy the application, you'll need a service account key:

1. Go to Google Cloud Console > IAM & Admin > Service Accounts
2. Find the service account you want to use (recommend using `reviz-684@revize-453014.iam.gserviceaccount.com`)
3. Click on the service account name
4. Go to the "Keys" tab
5. Click "Add Key" > "Create new key"
6. Select JSON format and click "Create"
7. Save the downloaded key file to a secure location

## Using the Key for Manual Deployment

Once you have the key file, you can authenticate as follows:

```bash
# Authenticate using the service account key
gcloud auth activate-service-account --key-file=PATH_TO_YOUR_KEY_FILE.json

# Set the project
gcloud config set project revize-453014

# Now run the manual deployment script
./manual-deploy.sh
```

## Fixing GitHub Actions

To fix the GitHub Actions workflow, you need to:

1. Go to your GitHub repository > Settings > Secrets and variables > Actions
2. Delete the existing GCP_SA_KEY secret
3. Add a new secret with the same name (GCP_SA_KEY)
4. Paste the entire JSON content of your service account key file
5. Make sure there are no extra spaces, newlines, or formatting issues in the secret value

The JSON key file should look something like this:
```json
{
  "type": "service_account",
  "project_id": "revize-453014",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "reviz-684@revize-453014.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/reviz-684%40revize-453014.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```
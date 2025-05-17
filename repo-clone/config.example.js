/**
 * Example configuration file showing required environment variables and their formats
 * Copy this structure to create your .env.production file
 */
module.exports = {
  // Environment ('development' | 'production' | 'test')
  NODE_ENV: 'production',
  
  // Server port (number between 1-65535)
  PORT: 3000,
  
  // MongoDB connection URI (valid MongoDB connection string)
  // Format: mongodb+srv://<username>:<password>@<cluster>.<id>.mongodb.net/<database>?<options>
  MONGODB_URI: 'mongodb+srv://username:password@cluster.example.mongodb.net/database?retryWrites=true&w=majority',
  
  // JWT secret key (string, minimum 32 characters recommended)
  JWT_SECRET: 'your-secure-jwt-secret-key-min-32-chars',
  
  // CORS origin (valid URL)
  CORS_ORIGIN: 'https://your-frontend-domain.com',
  
  // Storage mode ('local' | 'gcp')
  STORAGE_MODE: 'gcp',
  
  // Google Cloud Platform project ID
  GCP_PROJECT_ID: 'your-gcp-project-id',
  
  // Google Cloud Storage bucket name
  GCP_BUCKET_NAME: 'your-gcs-bucket-name',
  
  // Sentry DSN (valid Sentry URL)
  SENTRY_DSN: 'https://your-sentry-dsn',
  
  // Path to GCP service account key JSON file
  GOOGLE_APPLICATION_CREDENTIALS: './gcp-service-account-key.json'
}; 
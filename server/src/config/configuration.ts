export const configuration = () => ({
  mongo_uri: process.env.MONGO_URI || 'mongodb://localhost:27017/ceramic-ai',
  redis_host: process.env.REDIS_HOST || 'localhost',
  redis_port: parseInt(process.env.REDIS_PORT || '6379', 10),
  jwt_secret: process.env.JWT_SECRET || 'venux-shared-secret-key',
  comfyui_url: process.env.COMFYUI_URL || 'http://localhost:8188',
  upload_dir: process.env.UPLOAD_DIR || './uploads',
  max_file_size: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
});
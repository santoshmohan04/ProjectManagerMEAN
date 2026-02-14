# Project Manager Server

A secure Node.js/Express API for project management with MongoDB.

## Features

- **User Management**: Authentication and authorization with JWT
- **Project Management**: Create, update, and manage projects
- **Task Management**: Advanced task tracking with search and filtering
- **Dashboard**: Real-time statistics and overview
- **Audit Logging**: Complete audit trail for all operations
- **Security**: Comprehensive security middleware

## Security Features

The application includes multiple layers of security:

### Helmet
- Sets various HTTP headers for security
- Protects against common vulnerabilities like XSS, clickjacking, etc.

### Rate Limiting
- 100 requests per 15 minutes per IP address
- Prevents brute force attacks and abuse

### MongoDB Sanitization
- Sanitizes user input to prevent NoSQL injection attacks
- Cleans request body, query parameters, and route parameters

### HTTP Parameter Pollution Protection
- Prevents HTTP Parameter Pollution attacks
- Ensures only the last parameter value is used

### CORS Configuration
- Configurable allowed origins via environment variables
- Supports multiple origins for different environments

### Body Size Limiting
- Request body size limited to 10MB
- Prevents denial of service through large payloads

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=4300
NODE_ENV=development

# Database
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/projectmanager

# CORS Configuration
CORS_ORIGINS=http://localhost:4200,http://localhost:3000,https://yourdomain.com
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## API Documentation

Access Swagger documentation at `http://localhost:4300/api-docs` when the server is running.

## Security Best Practices

- Always use HTTPS in production
- Regularly update dependencies
- Monitor rate limiting logs
- Review audit logs regularly
- Use strong passwords and JWT secrets
- Configure CORS origins appropriately for your environment
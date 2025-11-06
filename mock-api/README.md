# Mock API Server

Simple Express.js server that mocks the N8n webhook endpoints for frontend testing.

## Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "mock-api"
}
```

### POST /webhook/login
Mock login with PIN validation

**Request:**
```json
{
  "sube": "merkez",
  "pin": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "mock.token.here",
  "sube": "merkez",
  "expiresIn": "12h"
}
```

### POST /webhook/ses-kayit
Mock voice recording processing

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Response:**
```json
{
  "success": true,
  "message": "3 ürün başarıyla kaydedildi",
  "products": [
    {"urun": "Domates", "miktar": 50, "birim": "kg"}
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Default PINs

- merkez: 123456
- sube-kadikoy: 234567
- sube-besiktas: 345678
- sube-sisli: 456789
- sube-uskudar: 567890
- sube-bakirkoy: 678901

## Running

```bash
npm install
npm start
```

Or with Docker:
```bash
docker build -t stok-mock-api .
docker run -p 3001:3000 stok-mock-api
```

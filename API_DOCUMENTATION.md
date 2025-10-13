# GymnaTech API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication via JWT token.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Authentication Endpoints

### POST /auth/login
Login to the system.

**Request Body:**
```json
{
  "email": "admin@gymnastech.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@gymnastech.com",
    "first_name": "System",
    "last_name": "Admin",
    "role": "admin",
    "is_active": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "judge1@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Judge",
  "role": "judge"
}
```

**Roles:** `admin`, `judge`, `official`, `athlete`, `public`

**Response:** Same as login

### GET /auth/me
Get current authenticated user.

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@gymnastech.com",
    "first_name": "System",
    "last_name": "Admin",
    "role": "admin",
    "is_active": true
  }
}
```

---

## Events Endpoints

### GET /events
List all events.

**Response:**
```json
{
  "events": [
    {
      "id": 1,
      "name": "State Championship 2024",
      "description": "Annual state gymnastics championship",
      "event_date": "2024-06-15",
      "start_time": "09:00:00",
      "location": "Main Arena",
      "status": "scheduled",
      "created_by_name": "System Admin"
    }
  ]
}
```

### POST /events
Create new event (admin/official only).

**Request Body:**
```json
{
  "name": "Regional Competition",
  "description": "Regional qualifiers",
  "event_date": "2024-07-20",
  "start_time": "10:00",
  "location": "Sports Complex",
  "status": "scheduled"
}
```

**Response:**
```json
{
  "event": {
    "id": 2,
    "name": "Regional Competition",
    "event_date": "2024-07-20",
    "status": "scheduled",
    ...
  }
}
```

### GET /events/:id
Get single event details.

### PUT /events/:id
Update event (admin/official only).

### GET /events/:id/athletes
Get athletes registered for event.

**Response:**
```json
{
  "athletes": [
    {
      "id": 1,
      "athlete_id": 5,
      "first_name": "Sarah",
      "last_name": "Johnson",
      "country": "USA",
      "apparatus_ids": [1, 2, 3, 4]
    }
  ]
}
```

### POST /events/:id/athletes
Register athlete for event (admin/official only).

**Request Body:**
```json
{
  "athlete_id": 5,
  "apparatus_ids": [1, 2, 3, 4]
}
```

---

## Athletes Endpoints

### GET /athletes
List all athletes.

**Response:**
```json
{
  "athletes": [
    {
      "id": 1,
      "first_name": "Sarah",
      "last_name": "Johnson",
      "date_of_birth": "2005-03-15",
      "country": "USA",
      "club": "Elite Gymnastics",
      "registration_number": "ATH-2024-001"
    }
  ]
}
```

### POST /athletes
Create new athlete (admin/official only).

**Request Body:**
```json
{
  "first_name": "Emma",
  "last_name": "Smith",
  "date_of_birth": "2006-08-22",
  "country": "USA",
  "club": "Star Gymnastics",
  "registration_number": "ATH-2024-002"
}
```

### GET /athletes/:id
Get single athlete details.

### PUT /athletes/:id
Update athlete (admin/official only).

---

## Apparatus Endpoints

### GET /apparatus
List all apparatus.

**Query Parameters:**
- `discipline` (optional): Filter by discipline (e.g., "womens_artistic")

**Response:**
```json
{
  "apparatus": [
    {
      "id": 1,
      "name": "Vault",
      "code": "VT",
      "description": "Power and flight event",
      "discipline": "womens_artistic",
      "is_active": true
    },
    {
      "id": 2,
      "name": "Uneven Bars",
      "code": "UB",
      "description": "Swing and release moves",
      "discipline": "womens_artistic",
      "is_active": true
    }
  ]
}
```

---

## Scoring Endpoints

### GET /scoring/performances/event/:eventId
Get all performances for an event.

**Query Parameters:**
- `apparatus_id` (optional): Filter by apparatus

**Response:**
```json
{
  "performances": [
    {
      "id": 1,
      "event_id": 1,
      "athlete_id": 5,
      "first_name": "Sarah",
      "last_name": "Johnson",
      "country": "USA",
      "apparatus_id": 1,
      "apparatus_name": "Vault",
      "apparatus_code": "VT",
      "order_number": 1,
      "status": "scored",
      "d_score": 5.200,
      "e_score": 8.950,
      "neutral_deductions": 0.000,
      "final_score": 14.150,
      "is_official": true
    }
  ]
}
```

### POST /scoring/performances
Create performance entry (admin/official only).

**Request Body:**
```json
{
  "event_id": 1,
  "athlete_id": 5,
  "apparatus_id": 1,
  "order_number": 1
}
```

### POST /scoring/scores
Submit judge score (judge/admin only).

**Request Body:**
```json
{
  "performance_id": 1,
  "score_type": "e_score",
  "score_value": 8.950,
  "deductions": [
    {
      "category": "execution",
      "value": 0.3,
      "description": "Minor balance check"
    }
  ],
  "comments": "Good routine overall"
}
```

**Score Types:** `d_score`, `e_score`

**Response:**
```json
{
  "score": {
    "id": 1,
    "performance_id": 1,
    "judge_id": 2,
    "score_type": "e_score",
    "score_value": 8.950,
    "submitted_at": "2024-06-15T10:30:00Z"
  }
}
```

### GET /scoring/scores/performance/:performanceId
Get all scores for a performance.

**Response:**
```json
{
  "scores": [
    {
      "id": 1,
      "performance_id": 1,
      "judge_id": 2,
      "first_name": "Jane",
      "last_name": "Judge",
      "score_type": "e_score",
      "score_value": 8.950,
      "submitted_at": "2024-06-15T10:30:00Z"
    }
  ]
}
```

### GET /scoring/leaderboard/:eventId
Get leaderboard for event.

**Query Parameters:**
- `apparatus_id` (optional): Filter by apparatus

**Response:**
```json
{
  "leaderboard": [
    {
      "performance_id": 1,
      "athlete_id": 5,
      "first_name": "Sarah",
      "last_name": "Johnson",
      "country": "USA",
      "club": "Elite Gymnastics",
      "apparatus_name": "Vault",
      "d_score": 5.200,
      "e_score": 8.950,
      "neutral_deductions": 0.000,
      "final_score": 14.150,
      "is_official": true
    }
  ]
}
```

### POST /scoring/publish
Publish official scores (admin/official only).

**Request Body:**
```json
{
  "performance_ids": [1, 2, 3]
}
```

---

## Configuration Endpoints

### GET /config/scoring-rules
Get scoring rules.

**Query Parameters:**
- `apparatus_id` (optional): Filter by apparatus
- `discipline` (optional): Filter by discipline

**Response:**
```json
{
  "rules": [
    {
      "id": 1,
      "name": "FIG WAG Code 2025-2028",
      "discipline": "womens_artistic",
      "apparatus_id": 1,
      "ruleset_version": "2025-2028",
      "rules": {
        "d_score": {
          "max_elements": 8,
          "includes_dismount": true
        },
        "e_score": {
          "starting_value": 10.0,
          "judge_count": 4,
          "drop_high_low": true
        }
      },
      "is_active": true
    }
  ]
}
```

### POST /config/scoring-rules
Create scoring rule (admin only).

### PUT /config/scoring-rules/:id
Update scoring rule (admin only).

### GET /config/apparatus-config/:id
Get apparatus configuration.

### PUT /config/apparatus-config/:id
Update apparatus configuration (admin only).

---

## WebSocket Events

Connect to WebSocket at: `http://localhost:3000`

### Client Events (Emit)
- `join:event` - Join event room for updates
  ```javascript
  socket.emit('join:event', eventId);
  ```

- `leave:event` - Leave event room
  ```javascript
  socket.emit('leave:event', eventId);
  ```

- `join:apparatus` - Join apparatus-specific room
  ```javascript
  socket.emit('join:apparatus', eventId, apparatusId);
  ```

### Server Events (Listen)
- `score:updated` - Score was submitted/updated
  ```javascript
  socket.on('score:updated', (data) => {
    console.log('Score updated:', data);
  });
  ```

- `leaderboard:updated` - Leaderboard changed
  ```javascript
  socket.on('leaderboard:updated', (data) => {
    console.log('Leaderboard:', data.leaderboard);
  });
  ```

- `performance:status` - Performance status changed
  ```javascript
  socket.on('performance:status', (data) => {
    console.log('Status:', data.status);
  });
  ```

- `scores:published` - Scores were published
  ```javascript
  socket.on('scores:published', (data) => {
    console.log('Published:', data.performanceIds);
  });
  ```

---

## Error Responses

All endpoints may return these error formats:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding in production.

## API Versioning

Current API version: v1 (implicit in `/api` prefix)
Future versions may use `/api/v2`, etc.



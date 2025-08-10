# Eskalate Backend

A RESTful API backend for a meal and restaurant management system built with Node.js, Express, and MongoDB.

## Features

- **Meal Management**: Create, read, update, and delete meals
- **Restaurant Management**: Automatically create restaurants when adding meals
- **Data Validation**: Input validation using Joi
- **Database**: MongoDB with Mongoose ODM
- **Status Codes**: Standardized HTTP status codes using http-status-codes library

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Joi** - Data validation
- **http-status-codes** - HTTP status code constants

## Installation

1. Clone the repository:

```bash
git clone https://github.com/WalterBanda123/eskalate-backend.git
cd eskalate-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory:

```env
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/eskalate_meals
PORT=3000
```

4. Start the server:

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Base URL

All endpoints are prefixed with `/api`

### Meals

#### Get Meals

```http
GET /api/meals?page=1&limit=10&search=pizza
```

**Query Parameters:**

- `page` (required): Page number
- `limit` (required): Number of items per page
- `search` (optional): Search term for meal names

**Response:**

```json
{
  "message": "OK",
  "data": [
    {
      "_id": "64f5a2b1c8d4e5f6a7b8c9d0",
      "foodName": "Pizza Margherita",
      "rating": 4.5,
      "imageUrl": "https://example.com/pizza.jpg",
      "restaurant": {
        "name": "Mario's Pizza",
        "logo": "https://example.com/logo.jpg",
        "status": "open"
      }
    }
  ],
  "pagination": {
    "total": 1
  }
}
```

#### Create Meal

```http
POST /api/meals
```

**Request Body:**

```json
{
  "foodName": "Pizza Margherita",
  "rating": 4.5,
  "imageUrl": "https://example.com/pizza.jpg",
  "restaurant": {
    "name": "Mario's Pizza",
    "logo": "https://example.com/logo.jpg",
    "status": "open"
  }
}
```

**Response:**

```json
{
  "message": "Created",
  "data": {
    "meal": {
      "_id": "64f5a2b1c8d4e5f6a7b8c9d0",
      "foodName": "Pizza Margherita",
      "rating": 4.5,
      "imageUrl": "https://example.com/pizza.jpg",
      "restaurant": "64f5a2b1c8d4e5f6a7b8c9d1"
    },
    "restaurant": {
      "_id": "64f5a2b1c8d4e5f6a7b8c9d1",
      "name": "Mario's Pizza",
      "logo": "https://example.com/logo.jpg",
      "status": "open"
    }
  }
}
```

#### Update Meal

```http
PUT /api/meals/:id
```

#### Delete Meal

```http
DELETE /api/meals/:id
```

### Restaurants

#### Create Restaurant

```http
POST /api/meals/restaurant
```

**Request Body:**

```json
{
  "name": "Mario's Pizza",
  "logo": "https://example.com/logo.jpg",
  "status": "open"
}
```

## Data Models

### Meal Schema

```javascript
{
  _id: ObjectId,
  foodName: String (required),
  rating: Number (required, min: 0, max: 5),
  imageUrl: String (required),
  restaurant: ObjectId (required, ref: 'Restaurant')
}
```

### Restaurant Schema

```javascript
{
  _id: ObjectId,
  name: String (required),
  logo: String (required),
  status: String (enum: ['close', 'open'], default: 'open')
}
```

## Validation

All endpoints use Joi validation for input data:

- **Meal fields**: foodName (string), rating (0-5), imageUrl (string), restaurant (object)
- **Restaurant fields**: name (string), logo (string), status ('open'|'close')

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Validation Error",
  "message": "\"foodName\" is required"
}
```

Common HTTP status codes:

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Project Structure

```
eskalate-backend/
├── controllers/
│   └── meals/
│       └── index.js          # Meal and restaurant controllers
├── models/
│   ├── meal/
│   │   └── index.js          # Meal model and validation
│   └── restaurant/
│       └── index.js          # Restaurant model and validation
├── routes/
│   ├── meals/
│   │   └── index.js          # Meal routes
│   ├── restaurant/
│   │   └── index.js          # Restaurant routes
│   ├── index.js              # Global route loader
│   └── validate.js           # Validation middleware
├── server.js                 # Main server file
├── package.json
└── README.md
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Database Connection

The server connects to MongoDB using the connection string from environment variables or defaults to `mongodb://localhost:27017/eskalate_meals`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC

## Author

Walter Banda

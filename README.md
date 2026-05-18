# Straight A's - Jordanian IT Learning Hub

## Frontend Application

A modern web platform for Jordanian university students to access IT learning materials.

### Features

-  **Secure Authentication** - Password-based login for educators and admin
-  **University Filtering** - Browse materials by Jordanian universities
-  **Category Organization** - Find content by IT subject categories
-  **Search Functionality** - Search across all materials
-  **Material Views** - Track resource popularity
-  **Responsive Design** - Works on all devices

### Technology Stack

- HTML5
- CSS3 (Custom properties, Flexbox, Grid)
- Vanilla JavaScript
- REST API Integration

### Setup Instructions

1. Clone the repository
2. Ensure backend is running on `http://localhost:5000`
3. Open `index.html` in a browser
4. Or use Live Server extension

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@straightas.com | admin123 |

### Project Structure

frontend/
├── index.html # Homepage with university/category browsing
├── courses.html # Course listing and detail view
├── styles.css # Global styles and responsive design
├── app.js # Application logic and API integration
└── README.md # Documentation

backend/
├── routes/
│ └── admin.js
│ └── categories.js
│ └── materials.js
│ └── recommendations.js
│ └── universities.js
│ └── users.js
├── db.js
├── package.json
├── server.js



### API Endpoints Used

- `POST /api/auth/login` - User authentication
- `POST /api/users` - Educator registration
- `GET /api/materials` - Fetch all materials
- `GET /api/categories` - Fetch categories
- `GET /api/universities` - Fetch universities

### Contributors

- ahmadabuz --> Backend Development
- mahmoud04abdulaziz-wq --> Frontend Development
- issa02-ai --> Desing & Testing


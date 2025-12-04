# CiviQ App - Full-Stack Civic Issue Reporting Application

A complete full-stack web application for civic issue reporting and management, built with Node.js backend and vanilla JavaScript frontend.

## 🌟 Features

- ✅ **Real Backend API** - Express.js server with RESTful endpoints
- ✅ **JSON Database** - LowDB for persistent data storage
- ✅ **CRUD Operations** - Create, Read, Update, Delete service requests
- ✅ **Real-time Updates** - Frontend syncs with backend automatically
- ✅ **Worker Portal** - Manage and track civic service requests
- ✅ **Filter & Search** - Filter by status, service type, and priority
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Maps Integration** - Google Maps links for locations
- ✅ **Status Tracking** - Track requests from submission to completion

## 📂 Project Structure

```
civiq-app/
│
├── backend/
│   ├── server.js          # Express API server
│   ├── db.json            # Database file (auto-generated)
│   ├── package.json       # Backend dependencies
│   └── node_modules/      # Dependencies (after npm install)
│
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── script.js          # Frontend logic with API integration
│   └── styles.css         # Styling
│
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Modern web browser

### Step 1: Install Backend Dependencies

Open PowerShell and navigate to the backend folder:

```powershell
cd "D:\My Jharkhan 311\civiq-app\backend"
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Cross-Origin Resource Sharing
- `lowdb` - Lightweight JSON database

### Step 2: Start the Backend Server

```powershell
npm start
```

You should see:
```
Backend running on http://localhost:3000
```

Keep this terminal window open!

### Step 3: Open the Frontend

Open another PowerShell window or file explorer:

1. Navigate to `D:\My Jharkhan 311\civiq-app\frontend\`
2. Open `index.html` in your web browser

The app will automatically connect to the backend and load data.

## 🔧 API Endpoints

The backend provides these REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests` | Get all service requests |
| GET | `/api/requests/:id` | Get a single request by ID |
| POST | `/api/requests` | Create a new request |
| PUT | `/api/requests/:id` | Update an existing request |
| DELETE | `/api/requests/:id` | Delete a request |

## 📝 Sample Request Data

```json
{
  "service": "Road Repair",
  "location": "MP Nagar, Zone 1, Bhopal",
  "description": "Large pothole on main road",
  "priority": "urgent",
  "status": "submitted",
  "phone": "+91 98765 43210",
  "coordinates": {
    "latitude": 23.2599,
    "longitude": 77.4126
  }
}
```

## 🧪 Testing the API

You can test the API using PowerShell:

### Get all requests:
```powershell
curl http://localhost:3000/api/requests
```

### Create a new request:
```powershell
curl -X POST http://localhost:3000/api/requests -H "Content-Type: application/json" -d '{\"service\":\"Street Lighting\",\"location\":\"Test Area\",\"description\":\"Testing\",\"priority\":\"medium\",\"status\":\"submitted\",\"phone\":\"+91 1234567890\"}'
```

## 🎯 Usage Workflow

1. **View Requests** - All civic service requests are displayed on the main page
2. **Filter Requests** - Use the filters to narrow down by status, service type, or priority
3. **Assign Requests** - Click "Assign to Me" on submitted requests
4. **Start Work** - Click "Start Work" on assigned requests
5. **Complete** - Click "Mark as Completed" when work is done
6. **View Location** - Click map links to see exact locations

## 🔄 Data Persistence

All data is stored in `backend/db.json`. This file:
- Is automatically created on first run
- Persists data between server restarts
- Can be backed up by copying the file
- Can be reset by deleting it (will recreate empty)

## 🚢 Deployment Options

This app can be deployed to:
- **Render** (backend) + **Netlify** (frontend)
- **Railway** (backend) + **Vercel** (frontend)
- **Heroku** (backend) + **GitHub Pages** (frontend)
- **AWS EC2** (full-stack)

## 🆙 Future Enhancements

- 🔐 Add authentication (Admin + Worker roles)
- 📸 Image upload for issues
- 📧 Email notifications
- 📊 Analytics dashboard
- 🗺️ Interactive map view
- 📱 Progressive Web App (PWA)
- 🔍 Advanced search
- 📄 PDF report generation

## 🐛 Troubleshooting

### Backend won't start
- Make sure Node.js is installed: `node --version`
- Make sure you ran `npm install` in the backend folder
- Check if port 3000 is already in use

### Frontend can't connect
- Make sure the backend server is running
- Check browser console for errors (F12)
- Verify the API_BASE URL in script.js is correct

### CORS errors
- Make sure you're opening the HTML file in a browser
- The backend has CORS enabled for all origins

## 📄 License

MIT License - Free to use and modify

## 🤝 Contributing

Feel free to fork and improve this project!
1

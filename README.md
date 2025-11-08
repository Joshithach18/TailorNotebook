# 📒 Tailor Notebook

A modern, full-stack digital order management system built specifically for tailors and tailoring businesses. Manage customers, measurements, orders, and payments all in one place.

## 🌟 Features

<img width="1920" height="1024" alt="Screenshot (443)" src="https://github.com/user-attachments/assets/79e8d635-2ec5-4913-b1fd-cf44d3f07125" />
<img width="1920" height="1024" alt="Screenshot (444)" src="https://github.com/user-attachments/assets/417769fc-67fa-4e93-9eb1-2a3415a5dd16" />
![Uploading Screenshot (445).png…]()


- **👥 Customer Management**
  - Store customer details (name, phone, email, address)
  - Save detailed body measurements
  - Add custom notes for each customer
  - Search and filter customers

- **📋 Order Tracking**
  - Create orders with multiple items
  - Track order status (Received → In Progress → Ready → Delivered)
  - Monitor payment status (Pending → Partial → Paid)
  - Set due dates and fitting appointments
  - Add fabric details and pricing

- **🔐 User Authentication**
  - Secure JWT-based authentication
  - Password encryption with bcrypt
  - Multi-user support with data isolation
  - Each user sees only their own customers and orders

- **🎨 Modern UI**
  - Responsive design with Tailwind CSS
  - Clean, intuitive interface
  - Mobile-friendly
  - Beautiful gradient themes


### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **HTML5**
- **Tailwind CSS** - Styling
- **Bootstrap 5** - Modal components
- **Vanilla JavaScript** - Client-side logic

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/Joshithach18/tailornotebook.git
cd tailor-notebook
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tailor-notebook
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
```

4. **Start MongoDB**

**Windows:**
```bash
# Start MongoDB service from Services
# Or run: mongod
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

5. **Run the application**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

6. **Open in browser**
```
http://localhost:5000
```

## 📁 Project Structure

```
tailor-notebook/
├── public/                 # Static files
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── signup.html        # Signup page
│   ├── dashboard.html     # Main dashboard
│   ├── app.js             # Client-side logic
│   ├── auth.js            # Authentication helper
│   └── style.css          # Custom styles
├── server.js              # Express server
├── models.js              # MongoDB schemas
├── package.json           # Dependencies
├── .env                   # Environment variables (not in git)
├── .gitignore            # Git ignore file
└── README.md             # This file
```

## 🌐 Deployment

### Deploy to Render

1. **Set up MongoDB Atlas**
   - Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create free cluster
   - Whitelist IP: `0.0.0.0/0`
   - Get connection string

2. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Joshithach18/tailornotebook.git
git push -u origin main
```

3. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Create new Web Service
   - Connect your repository

4. **Configure Render**
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:**
     ```
     MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/tailornotebook
     JWT_SECRET=your_production_secret_key
     NODE_ENV=production
     ```


## 🔧 API Endpoints

### Authentication
```
POST   /api/signup          Register new user
POST   /api/login           Login user
```

### Customers
```
GET    /api/customers       Get all customers (with optional search)
GET    /api/customers/:id   Get single customer
POST   /api/customers       Create new customer
PUT    /api/customers/:id   Update customer
DELETE /api/customers/:id   Delete customer
```

### Orders
```
GET    /api/orders          Get all orders (with optional status filter)
GET    /api/orders/:id      Get single order
POST   /api/orders          Create new order
PUT    /api/orders/:id      Update order
DELETE /api/orders/:id      Delete order
```


All endpoints except `/api/signup` and `/api/login` require JWT authentication.

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/tailor-notebook` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key_here` |
| `NODE_ENV` | Environment | `development` or `production` |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@Joshithach18](https://github.com/Joshithach18)
- Email: joshithachennamsetty@gmail.com

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Bootstrap](https://getbootstrap.com/) - UI components
- [Render](https://render.com/) - Hosting platform

## 📞 Support

If you have any questions or need help, please:
- Open an [issue](https://github.com/Joshithach18/tailornotebook/issues)
- Email: joshithachennamsetty@gmail.com


## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

Made with ❤️ for tailors everywhere

# Consultant Tracker - Full Stack Application

A comprehensive consultant tracking system built with React, Node.js, and PostgreSQL, designed for AWS deployment with GitHub Actions CI/CD.

## 🚀 Features

- **Role-based Authentication**: Admin and Recruiter roles with JWT
- **Consultant Management**: Add, edit, and track consultant profiles
- **Company Management**: Manage client companies and contacts
- **Submission Tracking**: Track consultant submissions with status updates
- **Dashboard Analytics**: Real-time statistics and performance metrics
- **Responsive Design**: Modern UI that works on all devices
- **Automated Deployment**: GitHub Actions CI/CD pipeline

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + JWT Authentication
- **Database**: PostgreSQL with optimized schema
- **Deployment**: AWS EC2 + RDS + GitHub Actions
- **Web Server**: Nginx with SSL support

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- AWS Account with EC2, RDS access
- GitHub repository
- Domain name (optional but recommended)

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/consultant-tracker.git
cd consultant-tracker
```

### 2. Database Setup

Create a PostgreSQL database and run the schema:

```bash
psql -U postgres -d your_database < backend/database/schema.sql
```

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 4. Frontend Setup

```bash
cd ../
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## 🌐 AWS Deployment with GitHub Actions

### Step 1: Setup AWS Infrastructure

1. **Create RDS PostgreSQL Database**
   - Engine: PostgreSQL 14+
   - Instance: db.t3.micro (free tier)
   - Enable public access
   - Configure security group for port 5432

2. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro or better
   - Security group: SSH (22), HTTP (80), HTTPS (443)

### Step 2: Configure GitHub Secrets

In your GitHub repository, add these secrets:

- `EC2_HOST`: Your EC2 public IP or domain
- `EC2_USERNAME`: ubuntu
- `EC2_SSH_KEY`: Your private SSH key content

### Step 3: Initial Server Setup

SSH into your EC2 instance and run:

```bash
curl -sSL https://raw.githubusercontent.com/yourusername/consultant-tracker/main/scripts/setup-aws.sh | bash
```

### Step 4: Configure Environment

Edit the production environment file:

```bash
sudo nano /opt/consultant-tracker/backend/.env
```

Update with your RDS credentials:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=consultant_tracker
DB_USER=your-db-username
DB_PASS=your-db-password
JWT_SECRET=your-super-secure-jwt-secret-key
```

### Step 5: Setup Database Schema

```bash
psql -h YOUR_RDS_ENDPOINT -U USERNAME -d DATABASE_NAME < /opt/consultant-tracker/backend/database/schema.sql
```

### Step 6: Restart Application

```bash
pm2 restart consultant-tracker
```

## 🔄 Automated Deployment

Once setup is complete, every push to the main branch will automatically:

1. ✅ Run tests and linting
2. 🏗️ Build the application
3. 🚀 Deploy to your EC2 instance
4. 🔄 Restart services

## 🔐 Default Login Credentials

- **Admin**: admin@company.com / password
- **Recruiter**: recruiter@company.com / password

**⚠️ Change these credentials immediately in production!**

## 📁 Project Structure

```
consultant-tracker/
├── .github/workflows/       # GitHub Actions CI/CD
├── backend/                 # Node.js API server
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── routes/             # API routes
│   ├── database/           # Database schema
│   └── tests/              # Backend tests
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities and API client
│   └── types/             # TypeScript types
├── scripts/               # Deployment scripts
└── docs/                  # Documentation
```

## 🚀 Production Features

✅ **Automated CI/CD** with GitHub Actions  
✅ **Production-ready** with error handling  
✅ **SSL/HTTPS** support with Let's Encrypt  
✅ **Process management** with PM2  
✅ **Reverse proxy** with Nginx  
✅ **Database migrations** and seeding  
✅ **Comprehensive testing** suite  
✅ **Security best practices**  

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Consultants
- `GET /api/consultants` - List consultants
- `POST /api/consultants` - Create consultant (admin only)
- `PUT /api/consultants/:id` - Update consultant (admin only)
- `DELETE /api/consultants/:id` - Delete consultant (admin only)

### Companies
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company (admin only)
- `PUT /api/companies/:id` - Update company (admin only)
- `DELETE /api/companies/:id` - Delete company (admin only)

### Submissions
- `GET /api/submissions` - List submissions (filtered by role)
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/:id` - Update submission
- `DELETE /api/submissions/:id` - Delete submission
- `GET /api/submissions/stats` - Get submission statistics

## 🛡️ Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- SQL injection protection
- CORS configuration
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For deployment issues or questions:
1. Check the troubleshooting guide in `/docs/`
2. Review GitHub Actions logs
3. Check AWS deployment logs
4. Verify environment variables

## 🔗 Useful Links

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
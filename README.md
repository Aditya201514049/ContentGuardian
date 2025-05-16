# ContentGuardian

ContentGuardian is a robust content management system with role-based access control (RBAC) for managing blog posts and comments. It provides different levels of access and permissions based on user roles.

## Features

- **User Authentication**: Secure login and registration system
- **Role-Based Access Control (RBAC)**: Three distinct user roles with different permissions
- **Content Management**: Create, read, update, and delete blog posts
- **Commenting System**: Add and delete comments on posts
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Dark/Light Theme**: Toggle between dark and light themes

## Tech Stack

### Frontend
- React (v19)
- React Router Dom
- TailwindCSS
- Axios for API requests
- Vite as the build tool

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Role-Based Access Control (RBAC)

ContentGuardian implements a comprehensive RBAC system with three distinct roles:

| Role | Permissions |
|------|-------------|
| Admin | Can manage all posts and users, delete any comment, access admin dashboard |
| Author | Can create, edit, and delete their own posts, manage comments on their posts |
| Reader | Can view posts and add comments |

## Test Credentials

You can use the following credentials to test the different roles:

### Admin
- Email: joy@gmail.com
- Password: 12345

### Author
- Email: mohan@gmail.com
- Password: 12345

### Reader
- If you register you will be signed up as a reader

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Backend Setup
1. Clone the repository
   ```
   git clone [repository-url]
   cd ContentGuardian
   ```

2. Install dependencies and set up the backend
   ```
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Start the backend server
   ```
   npm run dev
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory
   ```
   cd ../frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

## Usage

### Creating a New Post
1. Log in as an Admin or Author
2. Click on "Create Post" in the navigation menu
3. Fill in the title and content
4. Click "Create Post"

### Commenting on a Post
1. Log in as any role (Admin, Author, or Reader)
2. Navigate to a post detail page
3. Type your comment in the comment box
4. Click "Post Comment"

### Deleting Content
- **Posts**: Admins can delete any post, Authors can delete their own posts
- **Comments**: Admins can delete any comment, Authors can delete comments on their own posts, Users can delete their own comments

## Project Structure

```
/ContentGuardian
  ├── /backend
  │    ├── /controllers     # Request handlers
  │    ├── /middleware      # Auth and role middleware
  │    ├── /models          # Mongoose data models
  │    ├── /routes          # API routes
  │    └── server.js        # Express application
  │
  ├── /frontend
  │    ├── /public          # Static files
  │    └── /src
  │         ├── /assets     # Images, icons
  │         ├── /components # Reusable UI components
  │         ├── /context    # React context (auth, etc.)
  │         ├── /hooks      # Custom hooks
  │         ├── /pages      # Page components
  │         ├── /routes     # Route protections
  │         ├── /services   # API service layer
  │         └── /utils      # Helper functions
```

## Security Features

- JWT authentication for secure access
- Password hashing using bcrypt
- Protected routes on both frontend and backend
- Role verification for all operations

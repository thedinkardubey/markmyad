# RBAC Configurator

A full-stack Role-Based Access Control (RBAC) configuration tool built with Next.js, TypeScript, Prisma, and PostgreSQL.

## 🎯 RBAC Explanation for a Kid (50 words)

Think of RBAC like a video game! Different players (users) have different roles like "Admin" or "Player". Each role has special powers (permissions) like "can fly" or "can build". Admins give roles their powers. This way, everyone knows what they can and cannot do in the game!

## 🚀 Features

✅ **User Authentication** - Custom JWT-based authentication with password hashing  
✅ **Permission Management** - Full CRUD operations for permissions  
✅ **Role Management** - Full CRUD operations for roles  
✅ **Role-Permission Assignment** - Visual interface to connect roles and permissions  
✅ **AI Command (Bonus)** - Natural language configuration using plain English  
✅ **Modern UI** - Built with Shadcn UI components and Tailwind CSS  
✅ **Type-Safe** - Full TypeScript implementation  
✅ **Database** - PostgreSQL with Prisma ORM  

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **UI Library**: Shadcn UI (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS

## 📦 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd rbac-configurator
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/rbac_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

4. **Set up the database**
```bash
# Create the database
npx prisma db push

# (Optional) Generate Prisma Client
npx prisma generate
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open the application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses the following tables:

- **users** - Stores user credentials
- **permissions** - Individual permissions (e.g., `can_edit_articles`)
- **roles** - User roles (e.g., `Administrator`, `Content Editor`)
- **role_permissions** - Junction table linking roles to permissions
- **user_roles** - Junction table linking users to roles

## 🎮 Usage

### 1. Sign Up / Log In
- Create an account at `/signup` or log in at `/login`
- Test credentials are provided in the submission

### 2. Manage Permissions
- Navigate to the "Permissions" tab
- Create permissions like `can_edit_posts`, `can_delete_users`
- Edit or delete existing permissions

### 3. Manage Roles
- Navigate to the "Roles" tab
- Create roles like `Administrator`, `Content Editor`, `Viewer`
- Edit or delete existing roles

### 4. Assign Permissions to Roles
- Navigate to the "Assign Permissions" tab
- Select a role from the dropdown
- Check/uncheck permissions to assign or remove them

### 5. Use AI Commands (Bonus Feature)
Try natural language commands like:
- `"Create a permission called publish_content"`
- `"Create a role called Editor"`
- `"Give the role 'Editor' the permission to 'edit_posts'"`

## 🧪 Test Credentials

**Email**: `admin@example.com`  
**Password**: `admin123`

*(You can create this account by signing up)*

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── permissions/  # Permission CRUD
│   │   ├── roles/        # Role CRUD
│   │   ├── role-permissions/ # Role-permission assignments
│   │   └── ai-command/   # AI natural language processing
│   ├── dashboard/        # Main dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── layout.tsx        # Root layout
├── components/
│   └── ui/               # Reusable Shadcn UI components
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── README.md
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A secure random string
4. Deploy!

### Database Setup

For production, use a managed PostgreSQL service:
- **Vercel Postgres**
- **Supabase**
- **Railway**
- **Neon**

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- HTTP-only cookies
- Protected API routes
- SQL injection prevention (Prisma)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Permissions
- `GET /api/permissions` - Get all permissions
- `POST /api/permissions` - Create permission
- `PUT /api/permissions` - Update permission
- `DELETE /api/permissions?id=<id>` - Delete permission

### Roles
- `GET /api/roles` - Get all roles
- `POST /api/roles` - Create role
- `PUT /api/roles` - Update role
- `DELETE /api/roles?id=<id>` - Delete role

### Role-Permissions
- `POST /api/role-permissions` - Assign permission to role
- `DELETE /api/role-permissions?roleId=<id>&permissionId=<id>` - Remove permission from role

### AI Command
- `POST /api/ai-command` - Execute natural language command

## 🤝 Contributing

This is an assignment project, but suggestions are welcome!

## 📄 License

ISC

---

**Built with ❤️ for the Full Stack Developer Intern Assignment**

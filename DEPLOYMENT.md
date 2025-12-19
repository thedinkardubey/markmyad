# Deployment Guide

## Prerequisites

Before deploying, you need:
1. A GitHub account
2. A Vercel account (free tier works)
3. A PostgreSQL database (Vercel Postgres, Supabase, or Railway)

## Step-by-Step Deployment to Vercel

### 1. Prepare Your Database

#### Option A: Vercel Postgres (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database" → "Postgres"
3. Note your database URL (format: `postgres://...`)

#### Option B: Supabase (Free)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection String → URI
4. Copy the connection string

#### Option C: Railway (Free)
1. Go to [Railway.app](https://railway.app)
2. Create a new project with PostgreSQL
3. Copy the connection string from the Connect tab

### 2. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: RBAC Configurator"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A random secure string (generate one at https://randomkeygen.com/)
5. Click "Deploy"

### 4. Set Up Database Schema

After deployment, run the database migration:

```bash
# Using Vercel CLI (install with: npm i -g vercel)
vercel env pull .env.local
npm run build  # This runs prisma generate
npx prisma db push
```

Or manually in your database client, run the SQL from `prisma/schema.prisma`

### 5. Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Sign up with a test account
3. Create permissions and roles
4. Test the AI command feature

## Environment Variables Reference

Required environment variables:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT secret key (must be at least 32 characters)
JWT_SECRET="your-super-secret-random-string-change-this-in-production-xyz123"
```

## Troubleshooting

### Build fails with Prisma error
- Make sure `DATABASE_URL` is set in Vercel environment variables
- Ensure the database is accessible from Vercel's servers

### Cannot connect to database
- Check if your database allows connections from all IPs (0.0.0.0/0)
- Verify the connection string format is correct
- For Supabase, use the "connection pooling" URL

### Authentication not working
- Verify `JWT_SECRET` is set and is the same across deployments
- Check browser cookies are enabled

## Production Checklist

- [ ] Database connection string is secure
- [ ] JWT_SECRET is a strong random string
- [ ] Environment variables are set in Vercel
- [ ] Database schema is deployed (`prisma db push`)
- [ ] Test account created and working
- [ ] All CRUD operations tested
- [ ] AI command feature tested
- [ ] Custom domain configured (optional)

## Monitoring

- Check Vercel deployment logs for errors
- Monitor database usage in your database provider dashboard
- Set up Vercel Analytics for traffic insights

## Support

For issues during deployment, refer to:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

# Deployment & Environment

Chào mừng bạn đến với phần Deployment & Environment! Đây là giai đoạn quan trọng để đưa ứng dụng từ development lên production một cách an toàn và hiệu quả.

## Mục tiêu học tập

Sau khi hoàn thành phần này, bạn sẽ có thể:

- Quản lý environment variables hiệu quả
- Deploy Node.js apps lên Railway và Render
- Deploy frontend apps lên Vercel và Netlify
- Setup CI/CD cơ bản với GitHub Actions
- Hiểu về containerization với Docker
- Monitor và scale applications

## Cấu trúc nội dung

### 1. [Environment Variables](./01-environment-variables.md)
- Environment configuration
- Security best practices
- Different deployment environments
- Config validation

### 2. [Railway Deployment](./02-railway-deployment.md)
- Railway platform overview
- Node.js deployment
- Database integration
- Custom domains
- Environment management

### 3. [Render Deployment](./03-render-deployment.md)
- Render platform features
- Web services deployment
- Static site hosting
- Background jobs
- Database setup

### 4. [Vercel & Netlify](./04-vercel-netlify.md)
- Frontend deployment strategies
- Serverless functions
- Build optimization
- Custom domains
- Performance monitoring

### 5. [CI/CD với GitHub Actions](./05-cicd-github-actions.md)
- Automated testing
- Build và deployment pipelines
- Environment secrets
- Multi-stage deployments

## Workflow học tập được đề xuất

1. **Environment Variables** - Foundation cho deployment
2. **Backend Deployment** - Railway hoặc Render
3. **Frontend Deployment** - Vercel hoặc Netlify
4. **Integration** - Connect frontend với deployed backend
5. **CI/CD Setup** - Automate the process

## Prerequisites

- Đã hoàn thành các phần trước (Node.js, Express, React)
- Có GitHub account
- Hiểu cơ bản về command line
- Basic knowledge về web architecture

## Deployment Strategies

### Development → Staging → Production
- **Development**: Local development environment
- **Staging**: Testing environment giống production
- **Production**: Live application cho users

### Platform Recommendations

**Backend (Node.js/Express):**
- **Railway** - Developer-friendly, great for startups
- **Render** - Simple deployment, good free tier
- **Heroku** - Industry standard (có phí)
- **DigitalOcean** - More control, VPS

**Frontend (React/Next.js):**
- **Vercel** - Tối ưu cho Next.js
- **Netlify** - Excellent cho static sites
- **GitHub Pages** - Free cho static sites
- **AWS S3 + CloudFront** - Enterprise solution

**Databases:**
- **Railway PostgreSQL** - Integrated với Railway
- **Render PostgreSQL** - Managed database
- **MongoDB Atlas** - Cloud MongoDB
- **PlanetScale** - Serverless MySQL

## Tài nguyên bổ sung

- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Lưu ý quan trọng**: 
- Luôn test thoroughly trước khi deploy lên production
- Setup monitoring cho production apps
- Backup data thường xuyên
- Follow security best practices
- Document deployment procedures cho team

# HTC-BE Node.js MySQL Auth API

## Endpoints

- POST `/api/auth/register` — Register a new user
- POST `/api/auth/login` — Login
- POST `/api/auth/forgot-password` — Send password reset email (Gmail SMTP)

## Setup

1. Copy `.env` and fill in your MySQL and Gmail SMTP credentials.
2. Run the SQL in `schema.sql` to create the `users` table.
3. Start the server: `npm run dev`

## Dev Script

Add to `package.json`:

```
"scripts": {
  "dev": "nodemon index.js"
}
```

## Environment Variables

- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET
- EMAIL_USER, EMAIL_PASS (Gmail SMTP)

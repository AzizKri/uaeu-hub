# UAEU Hub - Backend

The backend is based on cloudflare workers and uses the Hono framework for building APIs. It integrates with Cloudflare D1 for database management, SendGrid for email services, and Google OAuth for authentication.

## Structure

```
server/
├── src/                # Source code
│   ├── v3/            # API version 3
│   ├── index.ts       # Main entry point
│   └── dev.schema.sql # Database schema
├── test/              # Test files
└── migrations/        # Database migrations
```

## Environment Variables

All environment variables are outlined in the `wrangler.toml.example` file.

## API Endpoints

Detailed API documentation can be found in the [API Documentation](./docs/api.md) file.

## Database

The project uses Cloudflare D1 (SQLite) as the database. Schema can be found in `src/dev.schema.sql`.

## Dependencies

- `@cloudflare/workers-types`: Type definitions for Cloudflare Workers
- `wrangler`: CLI tool for Cloudflare Workers
- `hono`: Web framework
- `bcryptjs`: Password hashing
- `zod`: Schema validation
- `google-auth-library`: (Optional) For Google Authentication
- `@sendgrid/mail`: (Optional) Email service. You may use your own SendGrid API key or a different provider.

## Testing

Tests are written using Vitest. Run tests with:

```bash
npm run test
```

## Deployment

Deployment is handled through Wrangler CLI:

```bash
wrangler deploy
```

## Contributing

You may contribute to the project by submitting pull requests. Please ensure that your code adheres to the project's coding standards and includes tests for new features or changes.

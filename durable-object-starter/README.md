## General Setup

To create D1 and R2 resources via wrangler, you must go to https://dash.cloudflare.com/profile/api-tokens, and create API tokens that give edit access to these resources.

## Deployment

To deploy the backend, just run:

```
pnpm wrangler deploy
```

## D1

### Setup

The D1 database was created via:

```
pnpm wrangler d1 create cloudflare-app-d1-db
```

### Migrations

To list migrations, run:

```
pnpm wrangler d1 migrations list cloudflare-app-d1-db
```

To apply them locally, run:

```
pnpm wrangler d1 migrations apply cloudflare-app-d1-db --local
```

To apply remotely, just use `--remote` instead of `--local`.

## R2

### Setup

The R2 bucket was created via:

```
pnpm wrangler r2 bucket create cloudflare-app-r2-bucket
```

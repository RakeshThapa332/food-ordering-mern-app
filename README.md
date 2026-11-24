# FoodWorld

FoodWorld is a MERN restaurant ordering application. Customers can browse restaurants and menus, manage a single-restaurant cart, and pay through Stripe Checkout. Restaurant owners can maintain their restaurant profile, menu, and order statuses.

## Stack

- React 18, TypeScript, Vite, Tailwind CSS, Zustand
- Express, TypeScript, MongoDB, Mongoose
- JWT authentication in an HTTP-only cookie
- Cloudinary image storage, Mailtrap email, Stripe Checkout and webhooks

## Requirements

- Node.js 20 or newer and npm
- MongoDB connection string
- Cloudinary account for restaurant and menu image uploads
- Mailtrap API token for verification and password-reset emails
- Stripe test keys and the Stripe CLI to exercise payment locally

## Local setup

1. Copy `.env.example` to `.env` in the project root and fill in the required credentials.
2. Install dependencies:

   ```sh
   npm install
   npm install --prefix client
   ```

3. Start the API server from the project root:

   ```sh
   npm run dev
   ```

4. In a second terminal, start the Vite client:

   ```sh
   npm run dev --prefix client
   ```

   Open the URL printed by Vite (normally `http://localhost:5173`).

For local development, `VITE_API_BASE_URL` should point to the server API, for example `http://localhost:3000/api/v1`. The client also supports a same-origin `/api/v1` base for deployments where Express serves the built client.

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `PORT` | Server | Express port (defaults to `3000`) |
| `MONGO_URI` | Server | MongoDB connection string |
| `SECRET_KEY` | Server | Secret used to sign JWTs |
| `FRONTEND_URL` | Server | Frontend origin used for CORS, email links, and Stripe redirects |
| `VITE_API_BASE_URL` | Client | API base URL; use the full local API URL during separate Vite/server development |
| `SEED_OWNER_EMAIL` | Server | Email address granted restaurant-owner dashboard access when that account signs up |
| `CLOUD_NAME`, `API_KEY`, `API_SECRET` | Server | Cloudinary credentials |
| `MAILTRAP_API_TOKEN` | Server | Verification, welcome, and password-reset email delivery |
| `STRIPE_SECRET_KEY` | Server | Stripe test/live secret key |
| `WEBHOOK_ENDPOINT_SECRET` | Server | Stripe webhook signature secret |

Keep `.env` out of source control. The committed `.env.example` contains placeholders only. The configured owner account must complete email verification before using protected pages. `SEED_OWNER_EMAIL` is applied at account creation; for an already-existing account, set its `admin` flag through a trusted database administration process.

## Payments in test mode

Set `STRIPE_SECRET_KEY` to a Stripe test secret, then run:

```sh
npm run stripe
```

Copy the signing secret printed by Stripe CLI into `WEBHOOK_ENDPOINT_SECRET`. The application creates orders from database menu prices on the server; the browser-submitted price is not used to calculate the Stripe line items. The current checkout accepts card payments and uses Nepal as its allowed delivery country.

## Useful commands

```sh
npm run dev                         # Express API
npm run dev --prefix client         # Vite client
npm run build --prefix client       # Frontend TypeScript check and production build
npm run lint --prefix client        # Frontend ESLint
npx tsc --noEmit --target ES2020 --module commonjs --moduleResolution node --esModuleInterop --skipLibCheck --strict false --types node server/index.ts
```

In production, build the client and run the Express server with the required environment variables; Express serves `client/dist` as the frontend and handles `/api/v1` requests.

## Current scope

- One restaurant per owner account; menu items are managed under that restaurant.
- Restaurant discovery and menu browsing are public. Cart checkout and order/profile pages require a verified account.
- Dashboard totals and order statuses are based on stored restaurant orders; the application does not currently have ratings, delivery-fee calculation, inventory availability, or historical sales charts.
- There is no automated test suite in the repository yet. Builds and lint are available; Stripe, email delivery, Cloudinary uploads, and database workflows require configured external services for end-to-end testing.

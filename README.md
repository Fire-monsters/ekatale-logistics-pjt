e-katale/
│
├── apps/
│   ├── app1-farmer/          React Native — Farmer + Village Agent
│   ├── app2-consumer/        React Native — SME + Grocery + Consumer + Transport
│   ├── web-warehouse/        Next.js — Agro-Warehouse dashboard
│   └── web-admin/            Next.js — Admin panel
│
├── services/
│   ├── auth-service/         Login, OTP, JWT, RBAC
│   ├── user-service/         Profiles, KYC, village agent management
│   ├── listing-service/      Farmer produce listings
│   ├── order-service/        Purchase orders, consumer orders
│   ├── inventory-service/    Warehouse stock, SKUs, agro-shop inventory
│   ├── payment-service/      Escrow, MTN MoMo, disbursements, wallet
│   ├── transport-service/    Jobs, GPS tracking, driver assignment
│   ├── notification-service/ Push, SMS, USSD, WhatsApp
│   ├── agroShop-service/     Input listings, orders, village agent stock
│   └── ai-service/           Python FastAPI — all ML models
│
├── packages/
│   ├── types/                Shared TypeScript interfaces used everywhere
│   ├── utils/                Shared helper functions (date formatting, currency, etc.)
│   ├── ui/                   Shared React Native components (buttons, cards, inputs)
│   └── config/               Shared ESLint, TypeScript, environment config
│
├── infra/
│   ├── docker-compose.yml    Run everything locally
│   ├── terraform/            AWS infrastructure as code
│   └── k8s/                  Kubernetes deployment manifests
│
├── docs/
│   ├── PRD.md
│   ├── api-specs/            OpenAPI specs per service
│   └── architecture/         Architecture decision records
│
├── pnpm-workspace.yaml       Declares all packages in the monorepo
├── turbo.json                Turborepo build pipeline config
└── package.json              Root-level scripts

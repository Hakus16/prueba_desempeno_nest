# FleetCore API - Fleet Maintenance Management System

**Performance Assessment – Module 6.2 NestJS**  
**Coder:** Riwi Yesid Palacio  
**Clan:** Coder Clan Nodejs AM  

---

## 1. Project Overview

FleetCore is an enterprise-grade REST API built with **NestJS**, **TypeScript**, **TypeORM**, and **PostgreSQL**. It is designed to manage the full lifecycle of vehicle fleet maintenance (preventive and corrective), tracking vehicle availability, assigning mechanics and workshops, and enforcing strict scheduling and overlapping prevention rules.

---

## 2. Layered Architecture (Clean Architecture)

The project adheres to a strict **Layered Architecture** pattern across all domain modules:

```
src/
├── common/                  # Cross-cutting concerns (Guards, Decorators, Filters, Interceptors, Enums)
├── config/                  # Configuration & TypeORM factory
├── database/                # Idempotent database seeds
└── modules/
    ├── auth/                # Authentication & JWT issuance
    ├── users/               # User management
    ├── vehicles/            # Fleet vehicles
    ├── mechanics/           # Mechanics & technician assignment
    ├── workshops/           # Service workshops
    ├── maintenances/        # Maintenance lifecycle & state machine
    └── integrations/        # External partner integration via x-api-key
```

### Flow of Responsibilities per Layer:
1. **Presentation Layer (`controllers/` & `dto/`)**:
   - Handles HTTP requests and responses.
   - Applies security guards (`JwtAuthGuard`, `RolesGuard`, `ApiKeyGuard`).
   - Validates incoming payloads using `ValidationPipe` and `class-validator` DTOs.
   - Formats success responses using `TransformInterceptor`.
2. **Business / Application Layer (`services/`)**:
   - Contains core business logic and domain rules.
   - Handles maintenance state transitions, schedule conflict detection, and odometer checks.
   - Completely decoupled from direct database drivers or HTTP specifics.
3. **Data Access / Persistence Layer (`repositories/`)**:
   - Encapsulates database queries (`find`, `findOne`, `softDelete`, `save`).
   - Manages atomic transactions using TypeORM (`executeTransaction`).
4. **Domain / Model Layer (`entities/` & `constants/`)**:
   - Defines database entities, foreign keys, constraints, and status enums.

---

## 3. Prerequisites

- **Node.js**: v20.x or higher
- **NPM**: v10.x or higher
- **PostgreSQL**: v15+ (or Docker / Docker Compose)
- **Docker & Docker Compose** (for containerized deployment)

---

## 4. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Default `.env` configuration:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fleetcore
JWT_SECRET=cambia-este-secreto-super-seguro-fleetcore-2026
JWT_EXPIRES_IN=1h
API_KEYS=demo-key-partner-1,demo-key-partner-2
```

---

## 5. Installation and Execution

### Option A: Deployment with Docker Compose (Recommended)

Spins up PostgreSQL and the NestJS API in isolated containers connected via an internal bridge network with data volume persistence:

```bash
# Build images and start containers in background
docker compose up --build -d

# Populate the database with idempotent seeders
docker compose exec api npm run seed
```

To stop containers:
```bash
docker compose down
```

---

### Option B: Local Execution

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Ensure the PostgreSQL database exists locally:
   ```sql
   CREATE DATABASE fleetcore;
   ```

3. Run the initial database seeders:
   ```bash
   npm run seed
   ```

4. Start the application in development mode:
   ```bash
   npm run start:dev
   ```

---

## 6. Swagger API Documentation

Once the server is running, the interactive OpenAPI / Swagger documentation is available at:

 **URL:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs) *(or port `3000` depending on your environment)*

### Authentication in Swagger:
- **Bearer Token (JWT)**: Log in via `POST /api/auth/login`, copy the `accessToken`, and paste it into the **Authorize** dialog.
- **x-api-key**: Enter `demo-key-partner-1` in the header field to test `/api/integrations/*` routes.

---

## 7. Test Credentials (Seed Data)

The seeders populate the database idempotently with the following preconfigured records:

### A. Users & Authentication
| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@fleetcore.com` | `FleetCore2026*` | Full system administration |
| **TECHNICIAN** | `carlos.perez@fleetcore.com` | `FleetCore2026*` | Linked to mechanic Carlos Pérez |
| **TECHNICIAN** | `laura.gomez@fleetcore.com` | `FleetCore2026*` | Linked to mechanic Laura Gómez |

### B. Mechanics
- **Carlos Pérez** (`carlos.perez@fleetcore.com`): Status **Active**, linked to user account.
- **Laura Gómez** (`laura.gomez@fleetcore.com`): Status **Active**, linked to user account.
- **Roberto Díaz** (`roberto.diaz@fleetcore.com`): Status **Inactive** (used to test assignment rejection).

### C. Workshops
- **Taller Norte Principal**: Status **Active**.
- **Taller Sur Auxiliar**: Status **Inactive** (used to test assignment rejection).

### D. Vehicles
- `ABC123`: Status **AVAILABLE** (includes completed historical maintenance record).
- `XYZ789`: Status **AVAILABLE** (ready for new maintenance scheduling).
- `DEF456`: Status **IN_MAINTENANCE** (associated with active `IN_PROGRESS` maintenance).
- `GHI999`: Status **INACTIVE** (used to test inactive vehicle assignment rejection).

### E. API Keys for External Integrations
- `demo-key-partner-1`
- `demo-key-partner-2`

Example testing with cURL:
```bash
curl -H "x-api-key: demo-key-partner-1" http://localhost:3001/api/integrations/vehicles/ABC123/history
```

---

## 8. Standard Response and Error Format

### Unified Success Response (`TransformInterceptor`):
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-10-27T12:00:00.000Z"
}
```

### Unified Error Response (`HttpExceptionFilter`):
```json
{
  "success": false,
  "statusCode": 409,
  "message": "El vehículo ABC123 ya tiene un mantenimiento activo",
  "path": "/api/maintenances",
  "timestamp": "2026-10-27T12:00:00.000Z"
}
```

---

## 9. Implemented Business Rules

1. **Plate Uniqueness**: Duplicate license plates are strictly prevented with database and application-level checks.
2. **Inactive Vehicles**: Vehicles with `INACTIVE` status or soft-deleted cannot be scheduled for maintenance.
3. **Single Active Maintenance per Vehicle**: A vehicle cannot have more than one concurrent active maintenance (`SCHEDULED` or `IN_PROGRESS`).
4. **Odometer Validation**: Maintenance entry mileage cannot be lower than the vehicle's current odometer reading.
5. **Mechanic Schedule Overlap Prevention**: A mechanic cannot be assigned to overlapping maintenance schedules across any workshop.
6. **Atomic State Transitions (TypeORM Transactions)**:
   - Transitioning to `IN_PROGRESS` automatically marks the vehicle as `IN_MAINTENANCE`.
   - Transitioning to `COMPLETED` requires closing data (work description, final cost, completion date, final mileage), updates the vehicle odometer, and sets its status back to `AVAILABLE`.
   - Terminal states `COMPLETED` and `CANCELLED` cannot be reversed or transitioned to unauthorized states.

---

## 10. Deliverables & SQL Dump

- **Database Dump**: Complete PostgreSQL schema and seed data export available in [`fleetcore_dump.sql`](./fleetcore_dump.sql).
- **Swagger Evidence Screenshots** (available in [`evidencias/`](./evidencias/)):
  - [`01-swagger-overview.png`](./evidencias/01-swagger-overview.png): General overview of OpenAPI documentation and Bearer Auth.
  - [`02-auth-token-expired-401.png`](./evidencias/02-auth-token-expired-401.png): Verification of 401 Unauthorized token expiration handling.
  - [`03-vehicles-list-200.png`](./evidencias/03-vehicles-list-200.png): Vehicle listing with status filtering and availability.
  - [`04-vehicle-not-found-404.png`](./evidencias/04-vehicle-not-found-404.png): Standardized 404 Not Found error format.
  - [`05-vehicle-find-by-id-200.png`](./evidencias/05-vehicle-find-by-id-200.png): Vehicle details with maintenance relations.
  - [`06-mechanics-list-200.png`](./evidencias/06-mechanics-list-200.png): Mechanics listing with associated technician user accounts.
  - [`07-mechanic-find-by-id-200.png`](./evidencias/07-mechanic-find-by-id-200.png): Individual mechanic record by ID.
  - [`08-workshops-list-200.png`](./evidencias/08-workshops-list-200.png): Workshops listing with capacities and active/inactive statuses.
  - [`09-maintenances-list-200.png`](./evidencias/09-maintenances-list-200.png): Maintenance records with vehicle relations and in-progress status.

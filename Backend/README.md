# Smart Task Manager — Backend

Express + TypeScript + PostgreSQL (Prisma) REST API.

## Run it locally

1. Start Docker Desktop.
2. `npm install`
3. Copy `.env.example` to `.env` and set `JWT_SECRET` to a long random string.
4. `npm run db:up` — starts PostgreSQL in Docker (on port 5433)
5. `npm run db:migrate` — creates the tables
6. `npm run dev` — starts the API at http://localhost:5000 (restarts on file save)

`npm run db:studio` opens a browser UI to look at the database.

## Auth endpoints

| Method | URL            | Body                        | Success | Errors                  |
| ------ | -------------- | --------------------------- | ------- | ----------------------- |
| POST   | `/auth/signup` | `{ name, email, password }` | 201     | 400 invalid, 409 taken  |
| POST   | `/auth/login`  | `{ email, password }`       | 200     | 400 invalid, 401 wrong  |
| POST   | `/auth/logout` | —                           | 200     |                         |
| GET    | `/auth/me`     | — (needs cookie)            | 200     | 401 not logged in       |

Login and signup set an HttpOnly cookie named `token` (a JWT). The browser sends it
back automatically; the frontend must use `credentials: "include"` in `fetch`.

## Architecture (layered, SOLID)

```
Request -> Route -> Controller -> Service -> Repository -> Database
                    (HTTP only)   (rules)    (DB only)
```

Each layer depends on **interfaces**, not concrete classes. All real classes are
created and connected in one place: `src/container.ts`.

```
src/
  index.ts                         starts the server
  app.ts                           middleware + routes, in order
  container.ts                     builds and wires all classes (dependency injection)
  config/env.ts                    reads and checks .env
  config/cookie.ts                 auth cookie name + settings
  lib/prisma.ts                    shared database client
  types/user.types.ts              User / PublicUser shapes
  interfaces/                      contracts: IUserRepository, IPasswordHasher, ITokenService
  repositories/user.repository.ts  PrismaUserRepository - database reads/writes only
  services/auth.service.ts         AuthService - signup/login/current-user rules
  services/password-hasher.service.ts  BcryptPasswordHasher
  services/token.service.ts        JwtTokenService
  controllers/auth.controller.ts   AuthController - request in, response out
  routes/auth.routes.ts            URL -> controller method
  validators/auth.validators.ts    Zod input rules
  middleware/requireAuth.ts        blocks requests without a valid token
  middleware/errorHandler.ts       turns errors into JSON responses
  utils/AppError.ts                errors with HTTP status codes
prisma/schema.prisma               database tables
```

To add a new feature (e.g. Projects), follow the same pattern:
`IProjectRepository` -> `PrismaProjectRepository` -> `ProjectService` -> `ProjectController` -> `createProjectRouter`, then wire them in `container.ts`.

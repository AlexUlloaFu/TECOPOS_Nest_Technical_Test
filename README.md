# TECOPOS - Technical Test

Proyecto de prueba con microservicios en NestJS (`gateway`, `sso`, `banking`) y Kafka para comunicación interna.

## Instalación

```bash
git clone https://github.com/AlexUlloaFu/TECOPOS_Nest_Technical_Test.git
cd TECOPOS_Nest_Technical_Test
npm install
cp .env.example .env
```

Configura estos valores en `.env`:

- `DATABASE_URL` (base de datos de SSO).
- `BANKING_API_BASE_URL` (base URL de MockAPI, por ejemplo la que yo utilize fue `https://mockapi.io/clone/69caaf2dba5984c44bf3a0d2`).
- `KAFKA_BROKERS` (por defecto `kafka:9092` cuando corres con Docker Compose).
- `PORT` (puerto HTTP del gateway, por defecto `3000`).

## Uso

### Correr con Docker

```bash
docker compose up --build
```

### Correr en local (modo desarrollo)

```bash
npm run start:dev
```

Swagger queda en:

```text
http://localhost:3000/api/docs
```

## Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (requiere `Bearer <token>`)

### Banking

- `GET /api/banking/accounts` (requiere `Bearer <token>`)
  - Devuelve solo las cuentas del `email` del usuario autenticado.
- `GET /api/banking/operations` (requiere `Bearer <token>`)
  - Devuelve operaciones del usuario autenticado.
- `GET /api/banking/operations?accountId=<id>` (requiere `Bearer <token>`)
  - Devuelve operaciones de esa cuenta (si pertenece al usuario).
- `POST /api/banking/operations` (requiere `Bearer <token>`)
  - Crea una operación para una cuenta del usuario.

# TECOPOS - Technical Test

Microsistema dockerizado con arquitectura de microservicios usando NestJS.

## Arquitectura

| Servicio    | Descripción                          | Puerto |
| ----------- | ------------------------------------ | ------ |
| **Gateway** | API Gateway, Swagger, JWT guard      | 3000   |
| **SSO**     | Autenticación, registro, PostgreSQL  | 3001   |
| **Banking** | Cuentas bancarias y operaciones      | 3002   |

**Stack:** NestJS (monorepo) &middot; PostgreSQL 16 &middot; Sequelize &middot; Docker Compose &middot; Swagger

## Instalación

```bash
git clone https://github.com/AlexUlloaFu/TECOPOS_Nest_Technical_Test.git
cd TECOPOS_Nest_Technical_Test
npm install
cp .env.example .env
```

Edita `.env` con tus valores. Para usar [Neon](https://neon.tech) en lugar de Postgres local, define `DATABASE_URL` (la cadena pooled del dashboard).

## Ejecución

### Docker Compose

```bash
docker compose up --build        # primer arranque
docker compose up --build -d     # en background
docker compose down              # detener
```

### Desarrollo local

```bash
npm run start:dev                # los 3 servicios con watch
```

## Documentación API

```
http://localhost:3000/api/docs
```

## Tests

```bash
npm run test          # unitarios
npm run test:e2e      # e2e
npm run test:cov      # coverage
```

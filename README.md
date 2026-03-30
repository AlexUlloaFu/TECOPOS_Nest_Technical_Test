# TECOPOS - Technical Test

Microsistema dockerizado con arquitectura de microservicios usando NestJS.

## Arquitectura

| Servicio    | Descripción                          | Puerto |
| ----------- | ------------------------------------ | ------ |
| **Gateway** | API Gateway, Swagger, JWT guard      | 3000   |
| **SSO**     | Auth service (Kafka + Neon)          | 3001*  |
| **Banking** | Cuentas y operaciones (Kafka + API)  | 3002*  |
| **Kafka**   | Broker interno (request/reply)       | 9092   |

`*` SSO y Banking usan Kafka para comunicación interna con Gateway; los puertos 3001/3002 no se exponen públicamente.

**Stack:** NestJS (monorepo) &middot; Kafka (KRaft) &middot; Neon PostgreSQL &middot; Sequelize &middot; Docker Compose &middot; Swagger

## Instalación

```bash
git clone https://github.com/AlexUlloaFu/TECOPOS_Nest_Technical_Test.git
cd TECOPOS_Nest_Technical_Test
npm install
cp .env.example .env
```

Edita `.env` con tus valores:

- `DATABASE_URL` para SSO (Neon).
- `BANKING_API_BASE_URL` para el proveedor MockAPI.
- `KAFKA_BROKERS` para comunicación interna (ej. `kafka:9092` o `host1:9092,host2:9092`).

## Ejecución

### Docker Compose

```bash
docker compose up --build        # primer arranque
docker compose up --build -d     # en background
docker compose down              # detener
```

Compose levanta `kafka`, `sso`, `banking` y `gateway` en una red interna compartida.

### Desarrollo local

```bash
npm run start:dev                # los 3 servicios con watch
```

## Documentación API

```
http://localhost:3000/api/docs
```

## Endpoints principales (MVP)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer JWT)
- `GET /api/banking/accounts` (Bearer JWT)
- `GET /api/banking/operations` (Bearer JWT)

Internamente, `gateway -> sso` y `gateway -> banking` usan Kafka request/reply.

Los endpoints de banking leen datos de un proveedor externo ([MockAPI](https://mockapi.io/)). Solo configuras la base:

- `BANKING_API_BASE_URL` — por ejemplo `https://69caaf2dba5984c44bf3a0d1.mockapi.io/api`.

Las rutas de recurso `/accounts` y `/financeTransactions` van fijas en el código del microservicio banking.

Ejemplo de URL de operaciones: `https://69caaf2dba5984c44bf3a0d1.mockapi.io/api/financeTransactions`.

### Smoke test rápido

1. Obtener token en `POST /api/auth/login`.
2. En Swagger (`/api/docs`), presionar **Authorize** y pegar `Bearer <token>`.
3. Ejecutar `GET /api/banking/accounts` y `GET /api/banking/operations`.

### Troubleshooting Kafka rápido

- Ver estado de contenedores: `docker compose ps`
- Ver logs del broker: `docker compose logs kafka`
- Si hay problemas de red, reiniciar stack: `docker compose down && docker compose up --build -d`

## Tests

```bash
npm run test          # unitarios
npm run test:e2e      # e2e
npm run test:cov      # coverage
```

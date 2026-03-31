# TECOPOS - Technical Test

Microsistema dockerizado con arquitectura de microservicios usando NestJS.

## Arquitectura

| Servicio    | Descripción                         | Puerto |
| ----------- | ----------------------------------- | ------ |
| **Gateway** | API Gateway, Swagger, JWT guard     | 3000   |
| **SSO**     | Auth service (Kafka + Neon)         | 3001\* |
| **Banking** | Cuentas y operaciones (Kafka + API) | 3002\* |
| **Kafka**   | Broker interno (request/reply)      | 9092   |

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
- `GET /api/banking/operations` (Bearer JWT, devuelve todas las transacciones del usuario)
- `GET /api/banking/operations?accountId=<id>` (Bearer JWT, devuelve solo esa cuenta)
- `POST /api/banking/operations` (Bearer JWT, crea operación y publica evento Kafka)

Internamente, `gateway -> sso` y `gateway -> banking` usan Kafka request/reply.

Los endpoints de banking leen datos de un proveedor externo ([MockAPI](https://mockapi.io/)). Solo configuras la base:

- `BANKING_API_BASE_URL` — por ejemplo `https://69caaf2dba5984c44bf3a0d1.mockapi.io/api`.

Las rutas de recurso `/account` y `/financeTransactions` van fijas en el código del microservicio banking.

Modelo lógico actual (sin tablas físicas):

- `financialAccount`: representa la cuenta financiera y su dueño (`userEmail`).
- `financialTransaction`: cada transacción pertenece a una sola cuenta vía `financialAccountId`.
- La pertenencia del usuario se resuelve por `email` del JWT (no por `tenantId`).

Para que los endpoints devuelvan datos, MockAPI debe contener:

- En `/account`: `id` (o `financialAccountId`) y `email` (o `userEmail`).
- En `/financeTransactions`: `transactionId` (o `id`) y `financialAccountId` (o `accountId`).

Ejemplo de URL de operaciones: `https://69caaf2dba5984c44bf3a0d1.mockapi.io/api/financeTransactions`.

### Smoke test rápido

1. Obtener token en `POST /api/auth/login`.
2. En Swagger (`/api/docs`), presionar **Authorize** y pegar `Bearer <token>`.
3. Ejecutar `GET /api/banking/accounts`.
4. Ejecutar `GET /api/banking/operations` para ver todas las transacciones del usuario autenticado.
5. Elegir un `financialAccountId` de la respuesta de cuentas.
6. Ejecutar `GET /api/banking/operations?accountId=<financialAccountId>`.
7. Validar que en modo con `accountId` solo salgan movimientos de esa cuenta.
8. Crear una operación financiera con `POST /api/banking/operations` y validar que se publique el evento Kafka `banking.financial_operation.created`.
9. Verificar consumo en Gateway en logs: `Consumed banking.financial_operation.created ...`.

### Troubleshooting Kafka rápido

- Ver estado de contenedores: `docker compose ps`
- Ver logs del broker: `docker compose logs kafka`
- Si hay problemas de red, reiniciar stack: `docker compose down && docker compose up --build -d`

## Seguridad (Rate Limiting)

Gateway incluye limitación global de consultas para mitigar ráfagas tipo DDoS:

- Ventana: 60000 ms.
- Máximo por ventana: 60 requests por IP.

Cuando se supera el límite, la API responde `429 Too Many Requests`.

## Tests

```bash
npm run test          # unitarios
npm run test:e2e      # e2e
npm run test:cov      # coverage
```

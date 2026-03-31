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
- `BANKING_API_BASE_URL` (base URL de MockAPI, por ejemplo `https://xxxx.mockapi.io/api`).
- `KAFKA_BROKERS` (host:puerto del broker externo).
- `KAFKA_SSL` (`true` para Aiven/Confluent).
- `KAFKA_SASL_MECHANISM` (`plain`, `scram-sha-256` o `scram-sha-512`).
- `KAFKA_SASL_USERNAME`.
- `KAFKA_SASL_PASSWORD`.
- `KAFKA_SSL_REJECT_UNAUTHORIZED` (`true` recomendado; en testing puedes usar `false`).
- `KAFKA_SSL_CA_BASE64` (opcional, CA certificate en base64).
- `PORT` (puerto HTTP del gateway, por defecto `3000`).

## Uso

### Correr con Docker

```bash
docker compose up --build
```
Compose levanta `sso`, `banking` y `gateway` conectados a un Kafka externo.

Topicos Kafka usados (layout compacto de 5 topicos):

- `auth.commands`
- `auth.replies`
- `banking.commands`
- `banking.replies`
- `banking.events`

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

## Deploy en Render

- `tecopos-gateway` (público)
- `tecopos-sso` (privado)
- `tecopos-banking` (privado)

Despliegue en este orden: `sso` y `banking` -> `gateway`.

Notas:

- El gateway usa `PORT` del entorno.
- Los 3 servicios deben compartir los mismos valores `KAFKA_*`.

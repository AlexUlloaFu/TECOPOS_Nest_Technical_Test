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

## Deploy en Render

Este repo ya incluye `render.yaml` para desplegar:

- `tecopos-gateway` (público)
- `tecopos-sso` (privado)
- `tecopos-banking` (privado)
- `tecopos-kafka` (privado)

Pasos:

1. En Render, elige **New + > Blueprint**.
2. Conecta este repositorio.
3. Render detectará `render.yaml` y creará los 4 servicios.
4. Completa variables pendientes:
   - `DATABASE_URL` en `tecopos-sso`
   - `BANKING_API_BASE_URL` en `tecopos-banking`
5. Lanza el deploy.

Notas:

- El gateway usa `PORT` del entorno (Render lo inyecta automáticamente).
- Internamente los servicios se conectan por `KAFKA_BROKERS=tecopos-kafka:9092`.

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

## Kafka gestionado externo (opcional)

Para pruebas técnicas, levantar Kafka en Render está bien.  
Para un entorno más profesional, conviene usar un proveedor gestionado (por ejemplo Confluent Cloud, Aiven, Upstash Kafka o Redpanda Cloud).

Ventajas:

- mayor estabilidad (replicación y alta disponibilidad),
- menos operación manual,
- observabilidad y monitoreo listos,
- upgrades y seguridad manejados por el proveedor.

Si usas Kafka externo, solo cambia `KAFKA_BROKERS` en `gateway`, `sso` y `banking` por el broker del proveedor (y agrega credenciales/SASL si aplica).

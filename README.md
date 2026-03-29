# TECOPOS - Technical Test

Microsistema dockerizado con arquitectura de microservicios usando NestJS.

## Arquitectura

El sistema está compuesto por 3 microservicios:

| Servicio    | Descripción                                     | Puerto |
| ----------- | ----------------------------------------------- | ------ |
| **Gateway** | API Gateway - punto de entrada con Swagger docs | 3000   |
| **SSO**     | Single Sign-On - autenticación con PostgreSQL   | 3001   |
| **Banking** | Cuentas bancarias y operaciones                 | 3002   |

### Stack Tecnológico

- **Framework:** NestJS (monorepo)
- **Base de datos:** PostgreSQL 16
- **ORM:** Sequelize
- **Contenedores:** Docker
- **Documentación:** Swagger (OpenAPI)

## Requisitos Previos

- Node.js >= 20
- Docker & Docker Compose
- npm

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/AlexUlloaFu/TECOPOS_Nest_Technical_Test.git
cd TECOPOS_Nest_Technical_Test

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
```

## Ejecución

### Con Docker Compose

```bash
# Levantar todos los servicios
docker-compose up --build

# Levantar en background
docker-compose up --build -d

# Detener servicios
docker-compose down
```

### Desarrollo local

```bash
# Iniciar todos los servicios en modo watch
npm run start:dev

# O iniciar cada servicio individualmente
npm run start:gateway:dev
npm run start:sso:dev
npm run start:banking:dev
```

## Documentación API

Una vez levantado el sistema, la documentación Swagger está disponible en:

```
http://localhost:3000/api/docs
```

## Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

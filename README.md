# 🏥 CardioCenter — Sistema de Gestión de Citas Médicas

> **Versión:** 1.0.0 MVP  
> **Estado:** En desarrollo  
> **Licencia:** Privado / Propietario

Sistema de gestión de citas médicas para un centro de cardiología. Cada médico opera bajo un portal independiente con control de horarios, servicios y citas. Los pacientes pueden registrarse, explorar médicos y agendar citas.

## 🧱 Stack Tecnológico

- **Backend:** Node.js 20, TypeScript, Express, Prisma, Prisma Postgres
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **Cloud & Deployment:** Prisma Compute, Prisma Postgres

## 🚀 Inicio rápido

### Requisitos

- Node.js ≥ 20.x
- npm ≥ 10.x

### Pasos

1. Configurar variables de entorno:

```bash
cp backend/.env.example backend/.env
```

2. Instalar dependencias:

```bash
npm install
```

3. Aplicar migraciones y semillas:

```bash
npm run db:migrate -w backend
npm run db:seed -w backend
```

4. Iniciar desarrollo:

```bash
npm run dev
```

El backend estará en `http://localhost:4000` y el frontend en `http://localhost:5173`.

## 📁 Estructura del proyecto

```
cardio/
├── backend/          # API REST con Express + Prisma
├── frontend/         # Aplicación React con Vite
├── shared/           # Tipos compartidos
├── prisma.compute.ts # Configuración de despliegue en Prisma Compute
└── README.md
```

## 📝 Convenciones

- Archivos en `kebab-case.ts`
- Clases e interfaces en `PascalCase`
- Funciones y variables en `camelCase`
- Commits con [Conventional Commits](https://www.conventionalcommits.org/)

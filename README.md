# FleetCore API - Sistema de Gestión de Mantenimiento de Flota

**Prueba de Desempeño – Módulo 6.2 NestJS**  
**Coder:** Riwi Coder  
**Clan:** Coder Clan  

---

## 1. Descripción del Proyecto

FleetCore es una solución backend construida con **NestJS**, **TypeScript**, **TypeORM** y **PostgreSQL**, diseñada para administrar el ciclo de vida completo de los mantenimientos de una flota vehicular (preventivos y correctivos), gestionando la disponibilidad de los vehículos, la asignación de mecánicos y talleres, y evitando conflictos de programación y solapamiento de horarios.

---

## 2. Requisitos Previos

- **Node.js**: v20.x o superior
- **NPM**: v10.x o superior
- **PostgreSQL**: v15+ (o Docker / Docker Compose instalado)
- **Docker & Docker Compose** (opcional para despliegue automatizado)

---

## 3. Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```bash
cp .env.example .env
```

Contenido de `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fleetcore
JWT_SECRET=cambia-este-secreto-super-seguro-fleetcore-2026
JWT_EXPIRES_IN=1h
API_KEYS=demo-key-partner-1,demo-key-partner-2
```

---

## 4. Instalación y Ejecución

### Opción A: Despliegue con Docker y Docker Compose (Recomendado)

Levanta la base de datos PostgreSQL y la API en contenedores aislados con red interna y volumen persistente:

```bash
docker compose up --build -d
```

Para poblar la base de datos dentro del contenedor:
```bash
docker compose exec api npm run seed
```

Para detener los servicios:
```bash
docker compose down
```

---

### Opción B: Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Asegurarse de tener creada la base de datos `fleetcore` en PostgreSQL local:
   ```sql
   CREATE DATABASE fleetcore;
   ```

3. Ejecutar los seeders iniciales:
   ```bash
   npm run seed
   ```

4. Iniciar la aplicación en modo desarrollo:
   ```bash
   npm run start:dev
   ```

---

## 5. Documentación Swagger

Una vez iniciado el servidor, la documentación interactiva de OpenAPI / Swagger se encuentra disponible en:

 **URL:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Permite autenticar peticiones con:
- **Bearer Token (JWT)**: Copiar el `accessToken` obtenido en `/api/auth/login` y pegarlo en el botón "Authorize".
- **x-api-key**: Encabezado requerido para los endpoints de `/api/integrations/*`.

---

## 6. Credenciales de Prueba (Seeders)

Los seeders generan los siguientes usuarios y registros de prueba listos para usar:

### A. Usuarios y Autenticación
| Rol | Correo Electrónico | Contraseña | Notas |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@fleetcore.com` | `FleetCore2026*` | Acceso a gestión global |
| **TECHNICIAN** | `carlos.perez@fleetcore.com` | `FleetCore2026*` | Vinculado al mecánico Carlos Pérez |
| **TECHNICIAN** | `laura.gomez@fleetcore.com` | `FleetCore2026*` | Vinculada al mecánico Laura Gómez |

### B. Mecánicos Registrados
- **Carlos Pérez** (`carlos.perez@fleetcore.com`): Estado **Activo**, vinculado a usuario técnico.
- **Laura Gómez** (`laura.gomez@fleetcore.com`): Estado **Activo**, vinculada a usuario técnico.
- **Roberto Díaz** (`roberto.diaz@fleetcore.com`): Estado **Inactivo** (permite probar rechazo de asignación).

### C. Talleres Registrados
- **Taller Norte Principal**: Estado **Activo**.
- **Taller Sur Auxiliar**: Estado **Inactivo** (permite probar rechazo de asignación).

### D. Vehículos Registrados
- `ABC123`: Estado **AVAILABLE** (con historial previo de mantenimiento completado).
- `XYZ789`: Estado **AVAILABLE** (listo para nueva asignación).
- `DEF456`: Estado **IN_MAINTENANCE** (asociado al mantenimiento activo `IN_PROGRESS`).
- `GHI999`: Estado **INACTIVE** (permite validar bloqueo de nuevas asignaciones).

### E. API Keys para Integraciones Externas
- `demo-key-partner-1`
- `demo-key-partner-2`

Endpoint de prueba:
```bash
curl -H "x-api-key: demo-key-partner-1" http://localhost:3000/api/integrations/vehicles/ABC123/history
```

---

## 7. Estructura de Respuestas y Manejo de Errores

### Respuesta Exitosa Unificada (TransformInterceptor):
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2026-10-27T12:00:00.000Z"
}
```

### Respuesta de Error Unificada (HttpExceptionFilter):
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

## 8. Reglas de Negocio Implementadas

1. **Unicidad de Placas:** No se permiten dos vehículos con la misma placa.
2. **Vehículos Inactivos:** Un vehículo en estado `INACTIVE` no puede asociarse a nuevos mantenimientos.
3. **Mantenimiento Activo Exclusivo por Vehículo:** Un vehículo no puede tener más de un mantenimiento activo (`SCHEDULED` o `IN_PROGRESS`) a la vez.
4. **Validación de Odómetro:** El kilometraje inicial de un mantenimiento no puede ser inferior al actual del vehículo.
5. **Solapamiento de Horarios de Mecánicos:** Ningún mecánico puede tener dos mantenimientos activos cuyos intervalos de fecha/hora se solapen, sin importar el taller.
6. **Transición Atómica de Estados (Transacciones TypeORM):**
   - Transición a `IN_PROGRESS` cambia automáticamente el vehículo a `IN_MAINTENANCE`.
   - Transición a `COMPLETED` exige información de cierre (trabajo realizado, costo final, fecha fin, kilometraje final) y regresa el vehículo a `AVAILABLE` con kilometraje actualizado.
   - Estados terminales `COMPLETED` y `CANCELLED` no pueden revertirse ni reactivarse inválidamente.

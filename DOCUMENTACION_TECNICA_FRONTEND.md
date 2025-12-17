# 📚 Documentación Técnica - Frontend CampusConnect

> Documentación completa del módulo frontend del Portal del Docente

---

## 📋 Tabla de Contenidos

1. [Tecnologías y Stack](#tecnologías-y-stack)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Sistema de Autenticación JWT](#sistema-de-autenticación-jwt)
4. [Sistema de Cache](#sistema-de-cache)
5. [Loaders y Skeletons (Shimmer)](#loaders-y-skeletons-shimmer)
6. [Sistema de Notificaciones](#sistema-de-notificaciones)
7. [Endpoints de API](#endpoints-de-api)
8. [Páginas y Funcionalidades](#páginas-y-funcionalidades)

---

## 🛠️ Tecnologías y Stack

### Framework y Lenguaje

- **Next.js 14.2.16** (App Router)
  - Framework React para producción
  - Server-Side Rendering (SSR)
  - API Routes para proxies
  - Optimizaciones automáticas de imágenes y código

- **TypeScript 5.x**
  - Tipado estático
  - Mejor experiencia de desarrollo
  - Detección temprana de errores

- **React 18**
  - Biblioteca UI
  - Hooks personalizados
  - Componentes funcionales

### Estilos y UI

- **Tailwind CSS 4.1.9**
  - Framework CSS utility-first
  - Diseño responsive
  - Sistema de diseño consistente

- **Radix UI**
  - Componentes accesibles y sin estilos
  - Componentes usados:
    - `@radix-ui/react-dialog` - Modales
    - `@radix-ui/react-dropdown-menu` - Menús desplegables
    - `@radix-ui/react-select` - Selectores
    - `@radix-ui/react-checkbox` - Checkboxes
    - `@radix-ui/react-avatar` - Avatares
    - Y más...

- **Lucide React 0.454.0**
  - Biblioteca de iconos
  - Más de 1000 iconos disponibles

- **Geist Font**
  - Fuente tipográfica moderna
  - Optimizada para legibilidad

### Utilidades y Librerías

- **date-fns 3.6.0**
  - Manipulación de fechas
  - Formateo de fechas
  - Cálculos de tiempo

- **react-hook-form 7.60.0**
  - Manejo de formularios
  - Validación con Zod

- **Zod 3.25.67**
  - Validación de esquemas
  - TypeScript-first

- **recharts 2.15.4**
  - Gráficos y visualizaciones
  - Componentes de gráficos interactivos

- **next-themes 0.3.0**
  - Soporte para temas (claro/oscuro)
  - Persistencia de preferencias

### Herramientas de Desarrollo

- **PostCSS 8.5**
  - Procesamiento de CSS
  - Integración con Tailwind

- **ESLint**
  - Linting de código
  - Reglas de calidad

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
CampusConnect_FrontDocentes/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (proxies)
│   ├── [páginas]/        # Páginas de la aplicación
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── auth/             # Componentes de autenticación
│   ├── cursos/           # Componentes de cursos
│   ├── layout/           # Componentes de layout
│   ├── modals/           # Modales
│   ├── navbar/           # Navegación
│   └── ui/               # Componentes UI reutilizables
│       └── loaders/      # Skeletons y loaders
├── lib/                   # Lógica de negocio
│   ├── api/              # Servicios de API
│   │   └── services/     # Servicios por módulo
│   ├── config/           # Configuraciones
│   ├── hooks/            # Custom hooks
│   ├── types/            # Tipos TypeScript
│   └── utils/            # Utilidades
└── styles/               # Estilos globales
```

### Patrones de Diseño

- **Service Layer Pattern**: Servicios separados por dominio
- **Custom Hooks**: Lógica reutilizable encapsulada
- **Component Composition**: Componentes pequeños y reutilizables
- **API Client Pattern**: Cliente HTTP centralizado

---

## 🔐 Sistema de Autenticación JWT

### Descripción

El sistema utiliza **JSON Web Tokens (JWT)** para autenticación. Los tokens se obtienen desde el módulo Core y se almacenan en `localStorage` del navegador.

### Flujo de Autenticación

1. **Login desde Core**
   - El usuario inicia sesión en `https://core-frontend-2025-02.netlify.app`
   - Core genera un JWT con información del docente
   - El token se pasa como query parameter `?token=...` al redirigir

2. **Procesamiento del Token**
   - El frontend recibe el token en la URL
   - Se decodifica el JWT (sin verificación de firma en cliente)
   - Se extrae información del payload:
     - `sub`: UUID del docente
     - `email`: Email del docente
     - `name`/`nombre`: Nombre del docente
     - `roles`: Roles del docente
     - `wallet`: UUIDs de billeteras asociadas

3. **Almacenamiento**
   - Token guardado en `localStorage` como `auth_token`
   - Payload decodificado guardado como `jwt_payload`
   - Información del usuario como `auth_user`

4. **Validación**
   - Verificación de expiración del token (`exp`)
   - Validación de presencia del token
   - Limpieza automática si el token expira

### Implementación

**Archivo Principal**: `lib/api/services/auth.ts`

**Clase Principal**: `AuthService`

**Métodos Clave**:
- `processJWTFromCore(token: string)`: Procesa y almacena el token
- `isAuthenticated()`: Verifica si hay sesión activa
- `getToken()`: Obtiene el token actual
- `getTeacherUUID()`: Extrae UUID del docente del token
- `logout()`: Limpia la sesión

**Headers de Autenticación**:
- Para APIs externas (Cursos, Inscripciones): `Authorization: Bearer {token}`
- Para APIs del módulo docente: `X-Teacher-Id: {uuid}` (sin Bearer token)

### Seguridad

- ✅ Tokens almacenados en `localStorage` (persistencia entre sesiones)
- ✅ Validación de expiración automática
- ✅ Limpieza automática de tokens expirados
- ✅ Headers de autenticación en todas las peticiones
- ✅ Proxies de Next.js para evitar CORS

---

## 💾 Sistema de Cache

### Descripción

Sistema de cache en **localStorage** que permite mostrar datos instantáneamente mientras se actualizan en segundo plano. Mejora significativamente la experiencia del usuario al eliminar tiempos de espera.

### Implementación

**Archivo Principal**: `lib/utils/cache.ts`

**Clase**: `LocalStorageCache`

**Características**:
- Time To Live (TTL) configurable por tipo de dato
- Validación automática de expiración
- Limpieza automática de caches expirados
- Prefijo automático: `dashboard_cache_`
- Manejo de errores (localStorage lleno, etc.)

### Configuración de TTL

Definida en `lib/config/performance.ts`:

```typescript
CACHE_TTL: {
  COURSES: 60,       // 1 minuto
  CALENDAR: 180,     // 3 minutos
  WALLET: 60,        // 1 minuto
  DASHBOARD: 300,    // 5 minutos
  PROFILE: 600,      // 10 minutos
}
```

### Flujo de Funcionamiento

1. **Al cargar datos**:
   - Primero intenta cargar desde cache
   - Si hay cache válido → muestra datos inmediatamente
   - Si no hay cache → muestra loading

2. **Actualización en background**:
   - Siempre hace fetch al API
   - Actualiza el estado con datos frescos
   - Actualiza el cache con nuevo TTL

3. **Ventajas**:
   - ✅ Carga instantánea de datos
   - ✅ Datos siempre actualizados
   - ✅ Resiliencia ante fallos del API
   - ✅ Experiencia fluida sin esperas

### Páginas con Cache

| Página | Hook | TTL | Clave de Cache |
|--------|------|-----|----------------|
| Dashboard - Calendario | `useWeeklyCalendar` | 3 min | `calendar_events_{startDate}_{endDate}` |
| Dashboard - Próxima Clase | `useNextClass` | 2 min | `next_class` |
| Dashboard - Billetera | `useBalance` | 1 min | `wallet_balance` |
| Dashboard - Comedor | `useCanteenReservations` | 2 min | `canteen_reservations` |
| Calendario | `CalendarService.getWeeklyEvents` | 3 min | `calendar_events_{from}_{to}` |
| Comedor | `useCanteenReservations` | 2 min | `canteen_reservations` |
| Tienda | `useStoreOrders` | 3 min | `store_orders` |
| Cursos | `useCourses` | 1 min | `courses_all` |

---

## ⏳ Loaders y Skeletons (Shimmer)

### Descripción

Sistema de **skeletons con animación shimmer** que se muestran mientras cargan los datos. Proporcionan feedback visual al usuario y mejoran la percepción de velocidad.

### Implementación

**Ubicación**: `components/ui/loaders/`

**Componentes Disponibles**:

1. **`Skeleton`** (`skeleton.tsx`)
   - Componente base reutilizable
   - Animación shimmer automática
   - Personalizable con clases Tailwind

2. **`BalanceSkeleton`** (`balance-skeleton.tsx`)
   - Para el saldo de billetera
   - Formato de tarjeta con animación

3. **`CalendarSkeleton`** (`calendar-skeleton.tsx`)
   - Para el calendario semanal
   - Grid de días con celdas animadas

4. **`CourseCardSkeleton`** (`course-card-skeleton.tsx`)
   - Para tarjetas de cursos
   - Múltiples instancias configurables

5. **`NextClassSkeleton`** (`next-class-skeleton.tsx`)
   - Para la próxima clase del dashboard
   - Formato compacto

6. **`TransactionSkeleton`** (`transaction-skeleton.tsx`)
   - Para transacciones de billetera
   - Lista de items animados

7. **`CarouselSkeleton`** (`carousel-skeleton.tsx`)
   - Para carruseles de imágenes
   - Múltiples slides

8. **`StatsSkeleton`** (`stats-skeleton.tsx`)
   - Para estadísticas y métricas
   - Cards con números

9. **`InlineSkeleton`** (`inline-skeleton.tsx`)
   - Para elementos inline
   - Texto animado

### Características

- ✅ **Animación Shimmer**: Efecto de brillo que se desplaza
- ✅ **Diseño Consistente**: Colores slate/gray palette
- ✅ **Responsive**: Adaptable a diferentes tamaños de pantalla
- ✅ **Accesible**: No bloquea la interacción del usuario

### Uso

```typescript
import { CourseCardSkeleton, CalendarSkeleton } from '@/components/ui/loaders'

// Mientras carga
{isLoading && <CourseCardSkeleton count={6} />}

// Cuando hay datos
{!isLoading && courses.map(course => <CourseCard course={course} />)}
```

---

## 🔔 Sistema de Notificaciones

### Descripción

Sistema de notificaciones en tiempo real mediante **polling continuo** (simulando WebSocket). Las notificaciones se actualizan automáticamente cada 5 segundos mientras el docente tiene la sesión activa.

### Implementación

**Archivo Principal**: `lib/hooks/useNotifications.ts`

**Servicio**: `lib/api/services/notifications.ts`

**Configuración**: `lib/config/performance.ts`

```typescript
POLLING: {
  NOTIFICATIONS: 5000, // 5 segundos
}
```

### Características

- ✅ **Polling Continuo**: Consulta cada 5 segundos
- ✅ **Page Visibility API**: Pausa cuando la pestaña está oculta
- ✅ **Auto-reanudación**: Se reanuda al volver a la pestaña
- ✅ **Limpieza Automática**: Se detiene al cerrar sesión
- ✅ **Optimización**: Solo hace fetch cuando la página está visible

### Tipos de Notificaciones

1. **Notificaciones del Backend**
   - Almacenadas en base de datos
   - Tipos: `rejection`, `approval`, `assignment`, `event`
   - Endpoint: `GET /teachers/me/notifications`

2. **Notificaciones de Eventos Locales**
   - Generadas en el frontend
   - Para eventos académicos próximos
   - Almacenadas en `localStorage`

### Funcionalidades

- **Marcar como leída**: `PATCH /teachers/me/notifications/{id}/read`
- **Marcar todas como leídas**: Múltiples requests PATCH
- **Contador de no leídas**: Actualización en tiempo real
- **Dropdown de notificaciones**: Vista en el header

### Flujo de Polling

```
1. Usuario inicia sesión
   ↓
2. Hook se monta → fetch inmediato
   ↓
3. Inicia polling cada 5 segundos
   ↓
4. Pestaña oculta → polling pausado
   ↓
5. Pestaña visible → polling reanudado + fetch inmediato
   ↓
6. Usuario cierra sesión → polling detenido
```

---

## 🌐 Endpoints de API

### Arquitectura de Endpoints

El frontend utiliza **dos tipos de endpoints**:

1. **APIs Externas** (directas)
   - API de Cursos: `https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api`
   - API de Materias: `https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api/materias`
   - API de Billetera: `https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api`
   - API de Sedes: `https://backoffice-production-df78.up.railway.app/api/v1/sedes`

2. **APIs del Módulo Docente** (a través de proxies Next.js)
   - Base URL: `https://modulodocentefinal-production.up.railway.app`
   - Proxies en `/app/api/*` para evitar CORS

### Endpoints por Módulo

#### 🔐 Autenticación

**Base URL**: `https://modulodocentefinal-production.up.railway.app`

| Método | Endpoint | Descripción | Headers |
|--------|----------|-------------|---------|
| POST | `/api/auth/login` | Login del docente | `Content-Type`, `Accept` |
| POST | `/api/auth/refresh` | Refrescar token JWT | `Authorization: Bearer {token}` |
| GET | `/api/auth/me` | Obtener perfil del docente | `Authorization: Bearer {token}` |

**Nota**: La autenticación real se hace desde Core (`https://core-frontend-2025-02.netlify.app`), que redirige con el token JWT.

---

#### 📚 Cursos

**API Externa**: `https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/api/inscripciones?user_uuid={uuid}` | Obtener cursos del docente | `Authorization: Bearer {token}` | ✅ `/api/inscripciones` |
| GET | `/api/inscripciones?uuid_curso={uuid}` | Obtener inscripciones de un curso | `Authorization: Bearer {token}` | ✅ `/api/inscripciones` |
| GET | `/api/cursos/{cursoId}` | Detalles completos de un curso | `Authorization: Bearer {token}` | ❌ Directo |

**API del Módulo Docente**: `https://modulodocentefinal-production.up.railway.app`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/teaching/courses/mine` | Cursos del docente (formato interno) | `X-Teacher-Id: {uuid}` | ✅ `/api/teaching/courses/mine` |
| GET | `/teaching/courses/{id}` | Detalles de curso | `X-Teacher-Id: {uuid}` | ❌ Directo |
| GET | `/teaching/courses/{id}/roster` | Lista de alumnos del curso | `X-Teacher-Id: {uuid}` | ✅ `/api/courses/{id}/roster` |

---

#### 📝 Asistencia

**Base URL**: `https://modulodocentefinal-production.up.railway.app`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/teaching/courses/{courseId}/attendance/{date}` | Obtener asistencia de una fecha | `X-Teacher-Id: {uuid}` | ✅ `/api/attendance/{courseId}/{date}` |
| PATCH | `/teaching/courses/{courseId}/attendance/{date}` | Actualizar asistencia de una fecha | `X-Teacher-Id: {uuid}` | ✅ `/api/attendance/{courseId}/{date}` |
| GET | `/teaching/courses/{courseId}/attendance` | Obtener asistencia en rango de fechas | `X-Teacher-Id: {uuid}` | ✅ `/api/attendance/{courseId}` |
| GET | `/teaching/courses/{courseId}/attendance/records` | Obtener todos los registros de asistencia | `X-Teacher-Id: {uuid}` | ✅ `/api/attendance/{courseId}/records` |

---

#### 📊 Evaluaciones y Calificaciones

**Base URL**: `https://modulodocentefinal-production.up.railway.app`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/teaching/courses/{courseId}/assessments` | Obtener evaluaciones del curso | `X-Teacher-Id: {uuid}` | ✅ `/api/teaching/courses/{courseId}/assessments` |
| GET | `/teaching/assessments/{assessmentId}/grades` | Obtener calificaciones de una evaluación | `X-Teacher-Id: {uuid}` | ❌ Directo |
| POST | `/teaching/assessments/{assessmentId}:publish` | Publicar calificaciones | `X-Teacher-Id: {uuid}` | ❌ Directo |

---

#### 📄 Actas

**Base URL**: `https://modulodocentefinal-production.up.railway.app`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/teaching/courses/{courseId}/acts` | Obtener actas del curso | `X-Teacher-Id: {uuid}` | ❌ Directo |
| GET | `/teaching/courses/{courseId}/acts/preview` | Vista previa del acta | `X-Teacher-Id: {uuid}` | ✅ `/api/teaching/courses/{courseId}/acts/preview` |
| POST | `/teaching/courses/{courseId}/acts:confirm` | Confirmar acta | `X-Teacher-Id: {uuid}` | ❌ Directo |

---

#### 👤 Perfil del Docente

**Base URL**: `https://modulodocentefinal-production.up.railway.app`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/teachers/me` | Obtener perfil completo | `X-Teacher-Id: {uuid}` | ❌ Directo |
| GET | `/teachers/me/proposals` | Obtener propuestas de materias | `X-Teacher-Id: {uuid}` | ✅ `/api/teachers/me/proposals` |
| POST | `/teachers/me/proposals` | Crear propuesta de materia | `X-Teacher-Id: {uuid}` | ✅ `/api/teachers/me/proposals` |
| DELETE | `/teachers/me/proposals?subjectId={id}` | Eliminar propuesta | `X-Teacher-Id: {uuid}` | ✅ `/api/teachers/me/proposals` |
| PUT | `/teachers/me/proposals/{proposalId}` | Actualizar propuesta | `X-Teacher-Id: {uuid}` | ✅ `/api/teachers/me/proposals/{proposalId}` |
| PATCH | `/teachers/me/proposals/{proposalId}` | Cambiar disponibilidad de propuesta | `X-Teacher-Id: {uuid}` | ✅ `/api/teachers/me/proposals/{proposalId}` |

---

#### 📅 Disponibilidad Horaria

**Base URL**: `https://modulodocentefinal-production.up.railway.app`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/teachers/me/availability` | Obtener bloques de disponibilidad | `X-Teacher-Id: {uuid}` | ✅ `/api/teachers/me/availability` |
| POST | `/teachers/me/availability` | Crear bloque de disponibilidad | `X-Teacher-Id: {uuid}` | ✅ `/api/teachers/me/availability` |
| PATCH | `/teachers/me/availability/{blockId}` | Actualizar bloque de disponibilidad | `X-Teacher-Id: {uuid}` | ✅ `/api/teachers/me/availability/{blockId}` |
| DELETE | `/teachers/me/availability/{blockId}` | Eliminar bloque de disponibilidad | `X-Teacher-Id: {uuid}` | ✅ `/api/teachers/me/availability/{blockId}` |

---

#### 🔔 Notificaciones

**Base URL**: `https://modulodocentefinal-production.up.railway.app`

| Método | Endpoint | Descripción | Headers | Polling |
|--------|----------|-------------|---------|---------|
| GET | `/teachers/me/notifications` | Obtener notificaciones no leídas | `X-Teacher-Id: {uuid}` | ✅ Cada 5 segundos |
| PATCH | `/teachers/me/notifications/{id}/read` | Marcar notificación como leída | `X-Teacher-Id: {uuid}` | ❌ Manual |

**Características**:
- Polling continuo cada 5 segundos
- Se pausa cuando la pestaña está oculta
- Se reanuda automáticamente al volver

---

#### 📅 Calendario

**APIs Múltiples**:

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/api/clases-individuales/curso/{cursoUUID}` | Clases individuales de un curso | `Authorization: Bearer {token}` | ✅ `/api/clases-individuales/curso/{cursoUUID}` |
| GET | `/api/events?endDate={date}` | Eventos académicos | `X-Teacher-Id: {uuid}` | ✅ `/api/events` |
| GET | `/api/canteen/reservations` | Reservas de comedor (para calendario) | `X-Teacher-Id: {uuid}` | ✅ `/api/canteen/reservations` |

---

#### 💰 Billetera

**API Externa**: `https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/wallets/mine` | Obtener información de billetera | `Authorization: Bearer {token}` | ❌ Directo |
| GET | `/wallets/{uuid}/history` | Historial de transacciones | `Authorization: Bearer {token}` | ❌ Directo |

---

#### 🍽️ Comedor

**Base URL**: `https://modulodocentefinal-production.up.railway.app`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/teachers/me/canteen/reservations` | Obtener reservas del docente | `X-Teacher-Id: {uuid}` | ✅ `/api/canteen/reservations` |
| GET | `/teachers/me/canteen/reservations:export` | Exportar reservas (CSV) | `X-Teacher-Id: {uuid}` | ❌ Directo |

**API Externa para Locations**:

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/api/canteen/locations` | Obtener sedes de comedor | `X-Teacher-Id: {uuid}` | ✅ `/api/canteen/locations` |

---

#### 🛒 Tienda

**Base URL**: `https://modulodocentefinal-production.up.railway.app`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/teachers/me/store/orders` | Obtener órdenes de tienda | `X-Teacher-Id: {uuid}` | ✅ `/api/store/orders` |
| GET | `/teachers/me/store/orders:export` | Exportar órdenes (CSV) | `X-Teacher-Id: {uuid}` | ❌ Directo |

---

#### 🏢 Sedes (Admin)

**API Externa**: `https://backoffice-production-df78.up.railway.app/api/v1/sedes`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/api/v1/sedes` | Obtener todas las sedes | `Authorization: Bearer {token}` | ✅ `/api/sedes` |

---

#### 📖 Materias (Subjects)

**API Externa**: `https://jtseq9puk0.execute-api.us-east-1.amazonaws.com/api/materias`

| Método | Endpoint | Descripción | Headers | Proxy |
|--------|----------|-------------|---------|-------|
| GET | `/api/materias` | Obtener todas las materias | `Authorization: Bearer {token}` | ❌ Directo |
| GET | `/api/materias/{uuid}` | Obtener detalles de una materia | `Authorization: Bearer {token}` | ❌ Directo |

---

## 📄 Páginas y Funcionalidades

### 1. **Dashboard** (`/`)

**Descripción**: Página principal con resumen de información clave

**Componentes**:
- Calendario semanal
- Próxima clase
- Saldo de billetera
- Reservas de comedor
- Estadísticas

**Endpoints Utilizados**:
- `GET /api/teachers/me/calendar` - Calendario semanal
- `GET /api/clases-individuales/curso/{uuid}` - Clases individuales
- `GET /wallets/mine` - Saldo de billetera
- `GET /api/canteen/reservations` - Reservas de comedor
- `GET /api/events` - Eventos académicos

**Cache**: ✅ (3 min calendario, 2 min próxima clase, 1 min billetera)

**Loaders**: `CalendarSkeleton`, `NextClassSkeleton`, `BalanceSkeleton`

---

### 2. **Mis Cursos** (`/cursos`)

**Descripción**: Lista de todos los cursos del docente con filtros avanzados

**Funcionalidades**:
- Vista de cursos por período (1er Cuatr., 2do Cuatr., Verano, Otros)
- Filtros por sede, día, modalidad
- Búsqueda por nombre o código
- Cards informativos de cada curso

**Endpoints Utilizados**:
- `GET /api/inscripciones?user_uuid={uuid}` - Cursos del docente
- `GET /api/cursos/{id}` - Detalles de cada curso
- `GET /api/inscripciones?uuid_curso={uuid}` - Alumnos por curso

**Cache**: ✅ (1 minuto)

**Loaders**: `CourseCardSkeleton`

**Lógica Especial**:
- Mapeo inteligente de cursos a pestañas según año y período
- Uso del campo `desde` para determinar el año
- Normalización de períodos ("Primer cuatrimestre" → "1er Cuatr. 2025")

---

### 3. **Detalle de Curso** (`/cursos/[id]`)

**Descripción**: Vista detallada de un curso con todas sus funcionalidades

**Funcionalidades**:
- Información del curso
- Lista de alumnos
- Control de asistencia
- Sistema de calificaciones
- Gestión de evaluaciones
- Actas

**Endpoints Utilizados**:
- `GET /teaching/courses/{id}` - Detalles del curso
- `GET /teaching/courses/{id}/roster` - Lista de alumnos
- `GET /teaching/courses/{id}/attendance/{date}` - Asistencia por fecha
- `PATCH /teaching/courses/{id}/attendance/{date}` - Actualizar asistencia
- `GET /teaching/courses/{id}/attendance/records` - Historial de asistencia
- `GET /teaching/courses/{id}/assessments` - Evaluaciones
- `GET /teaching/assessments/{id}/grades` - Calificaciones
- `POST /teaching/assessments/{id}:publish` - Publicar calificaciones
- `GET /teaching/courses/{id}/acts` - Actas
- `GET /teaching/courses/{id}/acts/preview` - Vista previa de acta
- `POST /teaching/courses/{id}/acts:confirm` - Confirmar acta

**Loaders**: `InlineSkeleton`, `CourseCardSkeleton`

---

### 4. **Calendario** (`/calendario`)

**Descripción**: Vista de calendario mensual con eventos y clases

**Funcionalidades**:
- Vista mensual
- Eventos académicos
- Clases programadas
- Reservas de comedor

**Endpoints Utilizados**:
- `GET /api/clases-individuales/curso/{uuid}` - Clases individuales
- `GET /api/events?endDate={date}` - Eventos académicos
- `GET /api/canteen/reservations` - Reservas de comedor
- `GET /api/inscripciones?user_uuid={uuid}` - Cursos del docente

**Cache**: ✅ (3 minutos)

**Loaders**: `CalendarSkeleton`

---

### 5. **Billetera** (`/billetera`)

**Descripción**: Gestión de saldo y transacciones

**Funcionalidades**:
- Visualización de saldo
- Historial de transacciones
- Cargar saldo (página separada)

**Endpoints Utilizados**:
- `GET /wallets/mine` - Información de billetera
- `GET /wallets/{uuid}/history` - Historial de transacciones

**Cache**: ✅ (1 minuto)

**Loaders**: `BalanceSkeleton`, `TransactionSkeleton`

---

### 6. **Comedor** (`/comedor`)

**Descripción**: Historial de reservas de comedor

**Funcionalidades**:
- Lista de reservas
- Filtros por fecha y estado
- Exportación a CSV

**Endpoints Utilizados**:
- `GET /teachers/me/canteen/reservations` - Reservas del docente
- `GET /api/canteen/locations` - Sedes de comedor
- `GET /teachers/me/canteen/reservations:export` - Exportar CSV

**Cache**: ✅ (2 minutos)

**Loaders**: `TransactionSkeleton`

---

### 7. **Tienda** (`/tienda`)

**Descripción**: Historial de compras en la tienda

**Funcionalidades**:
- Lista de órdenes
- Detalles de cada orden
- Exportación a CSV

**Endpoints Utilizados**:
- `GET /teachers/me/store/orders` - Órdenes del docente
- `GET /teachers/me/store/orders:export` - Exportar CSV

**Cache**: ✅ (3 minutos)

**Loaders**: `TransactionSkeleton`

---

### 8. **Perfil** (`/perfil`)

**Descripción**: Gestión del perfil del docente

**Funcionalidades**:
- Información personal
- Propuestas de materias (crear, editar, eliminar, activar/desactivar)
- Disponibilidad horaria (crear, editar, eliminar bloques)

**Endpoints Utilizados**:
- `GET /teachers/me` - Perfil del docente
- `GET /teachers/me/proposals` - Propuestas de materias
- `POST /teachers/me/proposals` - Crear propuesta
- `DELETE /teachers/me/proposals?subjectId={id}` - Eliminar propuesta
- `PUT /teachers/me/proposals/{id}` - Actualizar propuesta
- `PATCH /teachers/me/proposals/{id}` - Cambiar disponibilidad
- `GET /teachers/me/availability` - Bloques de disponibilidad
- `POST /teachers/me/availability` - Crear bloque
- `PATCH /teachers/me/availability/{id}` - Actualizar bloque
- `DELETE /teachers/me/availability/{id}` - Eliminar bloque
- `GET /api/materias` - Lista de materias disponibles
- `GET /api/sedes` - Lista de sedes

**Cache**: ✅ (10 minutos perfil)

**Loaders**: `InlineSkeleton`

**Lógica Especial**:
- Optimistic updates para mejor UX
- Retry con exponential backoff
- Validaciones inteligentes (evitar duplicados, consolidación)

---

## 🔧 Configuraciones Importantes

### Variables de Entorno

```env
NEXT_PUBLIC_API_URL=https://modulodocentefinal-production.up.railway.app
NODE_ENV=production|development
```

### Configuración de App

**Archivo**: `lib/config/app.ts`

```typescript
APP_CONFIG = {
  USE_MOCK_AUTH: false,        // Autenticación real con JWT
  USE_MOCK_DATA: false,        // Datos reales del backend
  MOCK_TEACHER_ID: '1010',     // Solo para desarrollo
}
```

### Configuración de Performance

**Archivo**: `lib/config/performance.ts`

- TTL de cache por tipo de dato
- Tiempos de debounce/throttle
- Configuración de polling
- Optimizaciones de imágenes
- Feature flags

---

## 📊 Resumen de Tecnologías

| Categoría | Tecnología | Versión | Uso |
|-----------|-----------|---------|-----|
| Framework | Next.js | 14.2.16 | Framework principal |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI Library | React | 18 | Componentes |
| CSS | Tailwind CSS | 4.1.9 | Estilos |
| Componentes | Radix UI | Varios | Componentes accesibles |
| Iconos | Lucide React | 0.454.0 | Iconografía |
| Fechas | date-fns | 3.6.0 | Manipulación de fechas |
| Formularios | react-hook-form | 7.60.0 | Manejo de formularios |
| Validación | Zod | 3.25.67 | Validación de esquemas |
| Gráficos | recharts | 2.15.4 | Visualizaciones |
| Temas | next-themes | 0.3.0 | Soporte de temas |

---

## 🎯 Características Técnicas Destacadas

### 1. **Optimistic Updates**
- Actualizaciones inmediatas en la UI
- Rollback automático en caso de error
- Mejor experiencia de usuario

### 2. **Retry con Exponential Backoff**
- Reintentos automáticos en caso de fallo
- Backoff exponencial para no saturar el servidor
- Sincronización automática después de múltiples fallos

### 3. **Error Tracking**
- Sistema centralizado de errores
- Badges informativos con detalles
- Auto-eliminación después de 10 segundos

### 4. **Responsive Design**
- Mobile-first approach
- Breakpoints optimizados
- Componentes adaptativos

### 5. **Performance Optimizations**
- Lazy loading de imágenes
- Code splitting automático
- Prefetch inteligente
- Cache estratégico

---

## 📝 Notas Finales

- Todos los endpoints están documentados con su método HTTP, propósito y headers requeridos
- El sistema de cache mejora significativamente la velocidad de carga
- Los loaders proporcionan feedback visual constante
- El sistema de notificaciones funciona como WebSocket mediante polling
- La autenticación JWT es segura y robusta
- El código está completamente tipado con TypeScript

---

**Última actualización**: Diciembre 2025

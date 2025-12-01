# API Endpoints Documentation - CampusConnect FrontDocentes

**Last Updated:** December 1, 2025  
**Base URL:** `https://modulodocentefinal-production.up.railway.app`

This document provides a comprehensive screen-by-screen mapping of all backend endpoints used in the CampusConnect teacher frontend application.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard (Home)](#dashboard-home)
3. [Calendario (Calendar)](#calendario-calendar)
4. [Comedor (Canteen)](#comedor-canteen)
5. [Billetera (Wallet)](#billetera-wallet)
6. [Cursos (Courses)](#cursos-courses)
7. [Course Detail](#course-detail)
8. [Tienda (Store)](#tienda-store)
9. [Perfil (Profile)](#perfil-profile)
10. [Notifications](#notifications)
11. [Admin Features](#admin-features)

---

## Authentication

### Screen: `/test-backend` (Backend Test Page)
**File:** `app/test-backend/page.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose | Headers |
|--------|----------|---------|---------|
| GET | `/teachers/me` | Test basic connection | `X-Teacher-Id`, `X-Teacher-Roles` |
| POST | `/api/auth/login` | Teacher login | Standard |
| GET | `/api/auth/me` | Get authenticated profile | `Authorization: Bearer {token}` |
| GET | `/teaching/courses/mine` | Test authenticated endpoint | `Authorization: Bearer {token}` |

**Service:** `lib/api/services/auth.ts`

#### Login Flow:
```typescript
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  user: AuthUser,
  token: string
}
```

---

## Dashboard (Home)

### Screen: `/` (Dashboard)
**File:** `app/page.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose | Service | Hook |
|--------|----------|---------|---------|------|
| GET | `/teachers/me/account/balance` | Get wallet balance | WalletService | useBalance |
| GET | `/teaching/courses/mine` | Get teacher's courses (for next class) | CalendarService | useNextClass |
| GET | `/teaching/courses/mine` | Get weekly calendar events | CalendarService | useWeeklyCalendar |
| GET | `/teaching/courses/{courseId}/assessments` | Get course assessments (for calendar) | CalendarService | useWeeklyCalendar |
| GET | `/teachers/me/canteen/reservations` | Get canteen reservations | CanteenService | useCanteenReservations |

**Services:** 
- `lib/api/services/dashboard.ts`
- `lib/api/services/wallet.ts`
- `lib/api/services/calendar.ts`
- `lib/api/services/canteen.ts`

#### Balance Endpoint Details:
```typescript
GET /teachers/me/account/balance
Headers: {
  'X-Teacher-Id': '1010',
  'X-Teacher-Roles': 'TEACHER',
  'Accept': 'application/json'
}
Response: {
  balance: number
}
```

#### Next Class Calculation:
- Fetches `/teaching/courses/mine?term={term}&includePrevious=false`
- Calculates next occurrence based on course schedule (`diaSemana`, `turno`)
- Returns class details with days until next occurrence

---

## Calendario (Calendar)

### Screen: `/calendario` (Calendar View)
**File:** `app/calendario/page.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose | Query Parameters |
|--------|----------|---------|------------------|
| GET | `/teaching/courses/mine` | Get all teacher courses | `term=2025Q2&includePrevious=true` |
| GET | `/teaching/courses/{courseId}/assessments` | Get assessments per course | None |
| GET | `/teachers/me/canteen/reservations` | Get canteen reservations | None |

**Service:** `lib/api/services/calendar.ts`  
**Hook:** `lib/hooks/useCalendar.ts`

#### Weekly Events Details:
```typescript
GET /teaching/courses/mine?term=2025Q2&includePrevious=true
Response: Array<{
  courseId: number,
  materia: string,
  diaSemana: string,
  turno: string,
  aula: string,
  campus: string,
  periodo: string
}>
```

The service then:
1. Converts courses to class events based on `diaSemana` and `turno`
2. Fetches assessments for each course and adds as exam events
3. Fetches canteen reservations and adds as meeting events
4. Filters events by date range (`startDate`, `endDate`)

---

## Comedor (Canteen)

### Screen: `/comedor` (Canteen Reservations)
**File:** `app/comedor/page.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose | Proxy |
|--------|----------|---------|-------|
| GET | `/teachers/me/canteen/reservations` | Get all canteen reservations | Via `/api/canteen/reservations` |

**Service:** `lib/api/services/canteen.ts`  
**Hook:** `lib/hooks/useCanteen.ts`  
**API Route:** `app/api/canteen/reservations/route.ts`

#### Reservation Details:
```typescript
GET /api/canteen/reservations (internal proxy)
→ GET /teachers/me/canteen/reservations (backend)

Headers: {
  'X-Teacher-Id': '1010',
  'X-Teacher-Roles': 'TEACHER',
  'Accept': '*/*'
}

Response: {
  value: Array<{
    reservationId: number,
    scheduledAt: string, // ISO datetime
    menu: string,
    campus: string,
    status: string, // 'RESERVADO' | 'CONSUMIDO' | 'CANCELADO'
  }>,
  Count: number
}
```

#### Status Mapping:
- Backend: `RESERVADO` → Frontend: `Pendiente`
- Backend: `CONSUMIDO` → Frontend: `Finalizado`
- Backend: `CANCELADO` → Frontend: `Cancelado`

---

## Billetera (Wallet)

### Screen: `/billetera` (Wallet Dashboard)
**File:** `app/billetera/page.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose | Parameters |
|--------|----------|---------|-----------|
| GET | `/teachers/me/account/balance` | Get current balance | None |
| GET | `/teachers/me/wallet/history` | Get transaction history | `from={date}&to={date}` |
| GET | `/teachers/me` | Get teacher profile (for legajo) | None |

**Service:** `lib/api/services/wallet.ts`  
**Hooks:** `lib/hooks/useWallet.ts`, `lib/hooks/useTeacherProfile.ts`  
**Utility:** `lib/utils/postmanProxy.ts`

#### Balance via Postman Proxy:
```typescript
GET /teachers/me/account/balance
Headers: {
  'X-Teacher-Id': '1010',
  'X-Teacher-Roles': 'TEACHER',
  'User-Agent': 'PostmanRuntime/7.49.0',
  'Accept': 'application/json'
}
Response: {
  balance: number
}
```

#### Transaction History:
```typescript
GET /teachers/me/wallet/history?from=2025-01-01&to=2025-12-31
Response: Array<{
  nombre: string,
  tipo: 'EGRESO' | 'INGRESO',
  fecha: string,
  monto: number
}>
```

### Screen: `/billetera/cargar-saldo` (Load Balance)
**File:** `app/billetera/cargar-saldo/page.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| PUT | `/teachers/me/account/balance` | Credit account balance | `{ id: number, amount: number }` |

#### Credit Balance Details:
```typescript
PUT /teachers/me/account/balance
Headers: {
  'X-Teacher-Id': '1010',
  'X-Teacher-Roles': 'TEACHER',
  'Content-Type': 'application/json'
}
Body: {
  id: 1010,
  amount: number
}
Response: {
  balance: number
}
```

---

## Cursos (Courses)

### Screen: `/cursos` (Courses List)
**File:** `app/cursos/page.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose | Query Parameters |
|--------|----------|---------|------------------|
| GET | `/teaching/courses` | Get all available courses | `term={term}` |
| GET | `/teaching/courses/mine` | Get teacher's assigned courses | `term={term}` |

**Service:** `lib/api/services/courses.ts`  
**Hooks:** `lib/hooks/useCourses.ts`, `lib/hooks/useCourseFilters.ts`

#### Course List Response:
```typescript
GET /teaching/courses/mine?term=2025Q2
Response: Array<{
  courseId: number,
  materia: string,
  codigo: string,
  carrera: string,
  campus: string,
  diaSemana: string,
  turno: string,
  aula: string,
  periodo: string,
  inscritos: number,
  modalidad: string
}>
```

---

## Course Detail

### Screen: `/cursos/[id]` (Individual Course)
**File:** `app/cursos/[id]/page.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/teaching/courses/{id}` | Get course details |
| GET | `/teaching/courses/{id}/roster` | Get enrolled students |
| GET | `/teaching/courses/{id}/assessments` | Get course assessments |
| GET | `/teaching/assessments/{assessmentId}/grades` | Get grades for assessment |
| POST | `/teaching/assessments/{assessmentId}/grades` | Create/update grades |
| PUT | `/teaching/assessments/{assessmentId}:publish` | Publish grades |
| GET | `/teaching/courses/{id}/attendance` | Get all attendance records |
| GET | `/teaching/courses/{id}/attendance/{date}` | Get attendance for specific date |
| POST | `/teaching/courses/{id}/attendance/{date}` | Record attendance |
| GET | `/teaching/courses/{id}/acts` | Get acts/actas records |
| POST | `/teaching/courses/{id}/acts:preview` | Preview acts before confirmation |
| POST | `/teaching/courses/{id}/acts:confirm` | Confirm and finalize acts |

**Component:** `components/cursos/course-info.tsx`  
**Service:** `lib/api/services/courses.ts`

#### Course Detail Response:
```typescript
GET /teaching/courses/{id}
Response: {
  courseId: number,
  name: string,
  code: string,
  description: string,
  term: string,
  campus: string,
  schedule: {
    dayOfWeek: string,
    shift: string,
    classroom: string
  },
  enrolledCount: number
}
```

#### Roster Response:
```typescript
GET /teaching/courses/{id}/roster
Response: Array<{
  studentId: number,
  name: string,
  lastName: string,
  email: string,
  legajo: string,
  enrollmentDate: string
}>
```

#### Assessment and Grades:
```typescript
GET /teaching/courses/{id}/assessments
Response: Array<{
  assessmentId: number,
  type: string,
  date: string,
  description: string
}>

GET /teaching/assessments/{assessmentId}/grades
Response: Array<{
  studentId: number,
  grade: number,
  observations: string
}>

POST /teaching/assessments/{assessmentId}/grades
Body: Array<{
  studentId: number,
  grade: number,
  observations?: string
}>

PUT /teaching/assessments/{assessmentId}:publish
Response: {
  success: boolean,
  publishedCount: number
}
```

#### Attendance:
```typescript
GET /teaching/courses/{id}/attendance
Response: Array<{
  date: string,
  studentId: number,
  status: 'PRESENTE' | 'AUSENTE' | 'TARDANZA'
}>

POST /teaching/courses/{id}/attendance/{date}
Body: Array<{
  studentId: number,
  status: 'PRESENTE' | 'AUSENTE' | 'TARDANZA'
}>
```

#### Acts (Actas):
```typescript
GET /teaching/courses/{id}/acts
Response: Array<{
  actId: number,
  date: string,
  status: string,
  students: Array<{...}>
}>

POST /teaching/courses/{id}/acts:preview
Body: {
  courseId: number,
  finalGrades: Array<{
    studentId: number,
    grade: number
  }>
}
Response: {
  preview: {...}
}

POST /teaching/courses/{id}/acts:confirm
Body: {
  actId: number,
  signature: string
}
```

---

## Tienda (Store)

### Screen: `/tienda` (Store Orders)
**File:** `app/tienda/page.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/teachers/me/store/orders` | Get all store orders |
| GET | `/teachers/me/store/orders:export` | Export orders (CSV/Excel) |

**Service:** `lib/api/services/store.ts`  
**Hook:** `lib/hooks/useStore.ts`

#### Store Orders Response:
```typescript
GET /teachers/me/store/orders
Response: Array<{
  orderId: number,
  date: string,
  items: Array<{
    productName: string,
    quantity: number,
    price: number
  }>,
  total: number,
  status: string,
  campus: string
}>
```

---

## Perfil (Profile)

### Screen: `/perfil` (Teacher Profile)
**File:** `app/perfil/page.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose | Body/Params |
|--------|----------|---------|-------------|
| GET | `/teachers/me` | Get teacher profile | None |
| GET | `/teachers/me/proposals` | Get course proposals | None |
| POST | `/teachers/me/proposals` | Create new proposal | `{ subjectId: number }` |
| DELETE | `/teachers/me/proposals/{id}` | Delete proposal | None |
| GET | `/teachers/me/availability` | Get availability blocks | None |
| POST | `/teachers/me/availability` | Create availability block | `{ dayOfWeek, shift, modality, campuses[] }` |
| PATCH | `/teachers/me/availability/{id}` | Update availability block | `{ campuses[] }` or `{ modality }` |
| DELETE | `/teachers/me/availability/{id}` | Delete availability block | None |
| GET | `/admin/subjects` | Get all subjects (for modal) | None |
| GET | `/admin/sedes?onlyActive=true` | Get active campuses | None |

**Services:** 
- `lib/api/services/teacher.ts`
- `lib/api/services/subjects.ts`
- `lib/api/services/admin.ts`

**Hooks:** 
- `lib/hooks/useTeacherProfile.ts`
- `lib/hooks/useProposals.ts`
- `lib/hooks/useAvailability.ts`
- `lib/hooks/useSubjects.ts`
- `lib/hooks/useCampuses.ts`

#### Teacher Profile Response:
```typescript
GET /teachers/me
Response: {
  teacherId: number,
  name: string,
  lastName: string,
  email: string,
  phone: string,
  legajo: string,
  department: string,
  campus: string
}
```

#### Proposals:
```typescript
GET /teachers/me/proposals
Response: Array<{
  proposalId: number,
  subjectId: number,
  subjectName: string,
  status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO',
  createdAt: string,
  decidedAt: string | null,
  active: boolean
}>

POST /teachers/me/proposals
Body: {
  subjectId: number
}

DELETE /teachers/me/proposals/{id}
```

#### Availability:
```typescript
GET /teachers/me/availability
Response: Array<{
  id: number,
  dayOfWeek: string, // 'LUNES', 'MARTES', etc.
  shift: string, // 'MANIANA', 'TARDE', 'NOCHE'
  modality: string, // 'PRESENCIAL', 'VIRTUAL', 'AMBAS'
  campuses: string[] // ['ALEM', 'VIR', ...]
}>

POST /teachers/me/availability
Body: {
  dayOfWeek: string,
  shift: string,
  modality: string,
  campuses: string[]
}

PATCH /teachers/me/availability/{id}
Body: {
  campuses?: string[],
  modality?: string
}

DELETE /teachers/me/availability/{id}
```

#### Subjects and Campuses:
```typescript
GET /admin/subjects
Response: Array<{
  subjectId: number,
  name: string,
  code: string,
  career: string,
  active: boolean
}>

GET /admin/sedes?onlyActive=true
Response: Array<{
  sedeId: string,
  name: string,
  address: string,
  active: boolean
}>
```

---

## Notifications

### Component: `components/navbar/notifications-dropdown.tsx`

#### Endpoints Used:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/teachers/me/notifications` | Get all notifications |
| POST | `/teachers/me/notifications/{id}:read` | Mark notification as read |

**Service:** `lib/api/services/notifications.ts`  
**Hook:** `lib/hooks/useNotifications.ts`

#### Notifications Response:
```typescript
GET /teachers/me/notifications
Response: Array<{
  notificationId: number,
  title: string,
  message: string,
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS',
  read: boolean,
  createdAt: string
}>

POST /teachers/me/notifications/{id}:read
Response: {
  success: boolean
}
```

---

## Admin Features

### Used Across Multiple Screens

#### Endpoints:

| Method | Endpoint | Purpose | Used In |
|--------|----------|---------|---------|
| GET | `/admin/subjects` | Get all subjects | Profile (Add Subject Modal) |
| GET | `/admin/sedes` | Get all campuses | Profile (Availability Modal) |
| GET | `/admin/sedes?onlyActive=true` | Get active campuses only | Profile |

**Service:** `lib/api/services/admin.ts`  
**Hook:** `lib/hooks/useCampuses.ts`

---

## Authentication Headers

All requests use mock authentication headers in development:

```typescript
Headers: {
  'X-Teacher-Id': '1010',
  'X-Teacher-Roles': 'TEACHER',
  'Accept': 'application/json',
  'Content-Type': 'application/json' // For POST/PUT/PATCH
}
```

In production, these would be replaced with:
```typescript
Headers: {
  'Authorization': 'Bearer {jwt_token}'
}
```

---

## API Configuration

**File:** `lib/config/api.ts`

All endpoints are centrally configured in `API_CONFIG.ENDPOINTS`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://modulodocentefinal-production.up.railway.app',
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    
    // Courses
    COURSES: '/teaching/courses',
    MY_COURSES: '/teaching/courses/mine',
    COURSE_DETAIL: (id) => `/teaching/courses/${id}`,
    COURSE_ROSTER: (id) => `/teaching/courses/${id}/roster`,
    
    // Attendance
    ATTENDANCE: (courseId, date) => `/teaching/courses/${courseId}/attendance/${date}`,
    ATTENDANCE_RANGE: (courseId) => `/teaching/courses/${courseId}/attendance`,
    
    // Assessments & Grades
    ASSESSMENTS: (courseId) => `/teaching/courses/${courseId}/assessments`,
    GRADES: (assessmentId) => `/teaching/assessments/${assessmentId}/grades`,
    PUBLISH_GRADES: (assessmentId) => `/teaching/assessments/${assessmentId}:publish`,
    
    // Teacher Profile
    TEACHER_PROFILE: '/teachers/me',
    TEACHER_AVAILABILITY: '/teachers/me/availability',
    TEACHER_PROPOSALS: '/teachers/me/proposals',
    TEACHER_NOTIFICATIONS: '/teachers/me/notifications',
    
    // Account & Services
    ACCOUNT_BALANCE: '/teachers/me/account/balance',
    WALLET_HISTORY: '/teachers/me/wallet/history',
    CANTEEN_RESERVATIONS: '/teachers/me/canteen/reservations',
    STORE_ORDERS: '/teachers/me/store/orders',
    STORE_EXPORT: '/teachers/me/store/orders:export',
    
    // Acts
    COURSE_ACTS: (courseId) => `/teaching/courses/${courseId}/acts`,
    COURSE_ACTS_PREVIEW: (courseId) => `/teaching/courses/${courseId}/acts:preview`,
    ACTS_CONFIRM: '/teaching/acts:confirm',
    
    // Admin
    ADMIN_SUBJECTS: '/admin/subjects',
    ADMIN_CAMPUSES: '/admin/sedes'
  }
}
```

---

## Error Handling

All services return standardized `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  data: T | null,
  success: boolean,
  message?: string,
  error?: string
}
```

Common error scenarios:
- **401 Unauthorized:** Invalid or missing authentication headers
- **404 Not Found:** Resource doesn't exist (course, student, etc.)
- **500 Internal Server Error:** Backend processing error
- **Network errors:** Timeout, CORS, connection failures

---

## Notes

1. **Mock Mode:** The application uses `X-Teacher-Id` and `X-Teacher-Roles` headers to simulate authentication in development.

2. **Postman Proxy:** The `postmanProxy` utility (`lib/utils/postmanProxy.ts`) is used specifically for wallet balance endpoints to ensure consistent header management.

3. **Internal API Routes:** Some endpoints (like canteen reservations) are proxied through Next.js API routes (`/api/canteen/reservations`) to avoid CORS issues.

4. **Date Formats:** 
   - Dates are typically in `YYYY-MM-DD` format
   - Timestamps use ISO 8601 with timezone (e.g., `2025-11-09T12:59:09.816054401-03:00`)

5. **Query Parameters:**
   - `term`: Academic term (e.g., `2025Q1`, `2025Q2`)
   - `includePrevious`: Boolean to include previous terms
   - `from` / `to`: Date range filters
   - `onlyActive`: Filter for active records only

---

**End of Documentation**

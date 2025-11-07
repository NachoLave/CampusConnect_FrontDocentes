# 📚 API Reference - Portal Docente

**Base URL:** `https://modulodocentefinal-production.up.railway.app`  
**Fecha:** Noviembre 2025  
**Versión:** 2.0

---

## 🔐 Autenticación

Todos los endpoints requieren estos headers:

```http
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

Para endpoints de admin:
```http
X-Teacher-Id: 2000
X-Teacher-Roles: ADMIN
```

---

## 📋 Índice

1. [Perfil y Cursos](#1-perfil-y-cursos)
2. [Asistencia](#2-asistencia)
3. [Evaluaciones y Calificaciones](#3-evaluaciones-y-calificaciones)
4. [Actas](#4-actas)
5. [Disponibilidad](#5-disponibilidad)
6. [Propuestas del Docente](#6-propuestas-del-docente)
7. [Calendario](#7-calendario)
8. [Notificaciones](#8-notificaciones)
9. [Cuenta y Recursos](#9-cuenta-y-recursos)
10. [Admin - Propuestas](#10-admin---propuestas)
11. [Admin - Materias](#11-admin---materias)
12. [Admin - Sedes](#12-admin---sedes)

---

# 1. Perfil y Cursos

## GET /teachers/me

Obtener perfil del docente.

**Request:**
```http
GET /teachers/me
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
{
  "teacherId": 1000,
  "email": "docente@campusconnect.edu",
  "name": "Juan Pérez",
  "activo": true,
  "role": "TITULAR",
  "legajo": "1137535",
  "cantidadCursosDictados": 7
}
```

**Campos:**
- `teacherId` (Long)
- `email` (String)
- `name` (String)
- `activo` (boolean)
- `role` (String)
- `legajo` (String)
- `cantidadCursosDictados` (Long)

---

## GET /teachers/me/courses

Listar cursos del docente.

**Request:**
```http
GET /teachers/me/courses?period=2025Q1
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Query Parameters:**
- `period` (String, opcional): Período académico

**Response:** `200 OK`
```json
[
  {
    "courseId": 2000,
    "subjectId": 500,
    "subjectName": "Matemática I",
    "comision": "A",
    "campus": "Centro",
    "classroom": "Aula 101",
    "term": "2025Q1",
    "diaSemana": "LUNES",
    "turno": "MANANA",
    "rol": "TITULAR"
  }
]
```

**Campos:**
- `courseId` (Long)
- `subjectId` (Long)
- `subjectName` (String)
- `comision` (String)
- `campus` (String)
- `classroom` (String)
- `term` (String)
- `diaSemana` (String)
- `turno` (Enum): MANANA, TARDE, NOCHE
- `rol` (Enum): TITULAR, ADJUNTO, JTP, AYUDANTE

---

## GET /teaching/courses/mine

Obtener cursos por término.

**Request:**
```http
GET /teaching/courses/mine?term=2025Q1&includePrevious=true
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Query Parameters:**
- `term` (String, opcional): Término académico
- `includePrevious` (Boolean, default: true): Incluir términos anteriores

**Response:** `200 OK`
```json
[
  {
    "courseId": 2000,
    "materia": "Matemática I",
    "comision": "A",
    "periodo": "2025Q1",
    "modalidad": "PRESENCIAL",
    "campus": "Centro",
    "aula": "Aula 101",
    "diaSemana": "LUNES",
    "turno": "MANANA",
    "studentCount": 30,
    "orDefault": [
      {
        "teacherId": 1000,
        "nombre": "Juan Pérez",
        "rol": "TITULAR"
      }
    ]
  }
]
```

**Campos:**
- `courseId` (Long)
- `materia` (String)
- `comision` (String)
- `periodo` (String)
- `modalidad` (Enum): PRESENCIAL, VIRTUAL, HIBRIDA
- `campus` (String)
- `aula` (String)
- `diaSemana` (String)
- `turno` (Enum)
- `studentCount` (long)
- `orDefault` (Array)
  - `teacherId` (Long)
  - `nombre` (String)
  - `rol` (String)

---

## GET /teaching/courses/{courseId}

Detalle de un curso.

**Request:**
```http
GET /teaching/courses/2000
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
{
  "courseId": 2000,
  "subjectId": 500,
  "subjectName": "Matemática I",
  "comision": "A",
  "campus": "Centro",
  "classroom": "Aula 101",
  "term": "2025Q1",
  "diaSemana": "LUNES",
  "turno": "MANANA",
  "modalidad": "PRESENCIAL",
  "promocionable": true,
  "titulares": [
    {
      "teacherId": 1000,
      "name": "Juan Pérez",
      "email": "juan@campusconnect.edu",
      "role": "TITULAR"
    }
  ],
  "auxiliares": [
    {
      "teacherId": 1001,
      "name": "María García",
      "email": "maria@campusconnect.edu",
      "role": "JTP"
    }
  ]
}
```

**Campos:**
- `courseId` (Long)
- `subjectId` (Long)
- `subjectName` (String)
- `comision` (String)
- `campus` (String)
- `classroom` (String)
- `term` (String)
- `diaSemana` (String)
- `turno` (Enum)
- `modalidad` (Enum)
- `promocionable` (boolean)
- `titulares` (Array)
  - `teacherId` (Long)
  - `name` (String)
  - `email` (String)
  - `role` (Enum): TITULAR
- `auxiliares` (Array)
  - `teacherId` (Long)
  - `name` (String)
  - `email` (String)
  - `role` (Enum): JTP, AYUDANTE, ADJUNTO

---

## GET /teaching/courses/{courseId}/roster

Lista de estudiantes del curso.

**Request:**
```http
GET /teaching/courses/2000/roster
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "studentId": 3000,
    "studentName": "María González",
    "status": "ACTIVO",
    "legajo": "2023001",
    "email": "maria.gonzalez@estudiantes.campusconnect.edu",
    "dni": 12345678,
    "activo": true
  }
]
```

**Campos:**
- `studentId` (Long)
- `studentName` (String)
- `status` (Enum): ACTIVO, INACTIVO, RETIRADO
- `legajo` (String)
- `email` (String)
- `dni` (Integer)
- `activo` (boolean)

---

# 2. Asistencia

## GET /teaching/courses/{courseId}/attendance/{date}

Obtener asistencia de una fecha.

**Request:**
```http
GET /teaching/courses/2000/attendance/2025-10-15
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Path Parameters:**
- `courseId` (Long)
- `date` (LocalDate): Formato YYYY-MM-DD

**Response:** `200 OK`
```json
{
  "courseId": 2000,
  "date": "2025-10-15",
  "items": [
    {
      "studentId": 3000,
      "studentName": "María González",
      "status": "PRESENTE"
    }
  ]
}
```

**Campos:**
- `courseId` (Long)
- `date` (LocalDate)
- `items` (Array)
  - `studentId` (Long)
  - `studentName` (String)
  - `status` (String): PRESENTE, AUSENTE, TARDE, JUSTIFICADO

---

## PUT /teaching/courses/{courseId}/attendance/{date}

Guardar asistencia.

**Request:**
```http
PUT /teaching/courses/2000/attendance/2025-10-15
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
Content-Type: application/json

{
  "items": [
    {
      "studentId": 3000,
      "status": "PRESENTE"
    },
    {
      "studentId": 3001,
      "status": "AUSENTE"
    }
  ]
}
```

**Request Body:**
- `items` (Array, requerido)
  - `studentId` (Long, requerido)
  - `status` (String, requerido)

**Response:** `200 OK`
```json
{
  "courseId": 2000,
  "date": "2025-10-15",
  "items": [
    {
      "studentId": 3000,
      "studentName": "María González",
      "status": "PRESENTE"
    }
  ]
}
```

---

## GET /teaching/courses/{courseId}/attendance

Resumen de asistencia.

**Request:**
```http
GET /teaching/courses/2000/attendance?from=2025-10-01&to=2025-10-31
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Query Parameters:**
- `from` (LocalDate, opcional)
- `to` (LocalDate, opcional)

**Response:** `200 OK`
```json
[
  {
    "date": "2025-10-15",
    "presentes": 28,
    "ausentes": 2,
    "mediasFaltas": 0
  }
]
```

**Campos:**
- `date` (LocalDate)
- `presentes` (long)
- `ausentes` (long)
- `mediasFaltas` (long)

---

## GET /teaching/courses/{courseId}/attendance/records

Obtener todos los registros de asistencia del curso.

**Request:**
```http
GET /teaching/courses/2000/attendance/records
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "courseId": 2000,
    "date": "2025-10-15",
    "items": [
      {
        "studentId": 3000,
        "studentName": "María González",
        "status": "PRESENTE"
      }
    ]
  },
  {
    "courseId": 2000,
    "date": "2025-10-22",
    "items": [
      {
        "studentId": 3000,
        "studentName": "María González",
        "status": "AUSENTE"
      }
    ]
  }
]
```

**Campos:**
- Array de `AttendanceRecordDto`
  - `courseId` (Long)
  - `date` (LocalDate)
  - `items` (Array)
    - `studentId` (Long)
    - `studentName` (String)
    - `status` (String): PRESENTE, AUSENTE, TARDE, JUSTIFICADO

---

# 3. Evaluaciones y Calificaciones

## GET /teaching/courses/{courseId}/assessments

Listar evaluaciones.

**Request:**
```http
GET /teaching/courses/2000/assessments
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "assessmentId": 5000,
    "courseId": 2000,
    "type": "PARCIAL",
    "date": "2025-11-15"
  }
]
```

**Campos:**
- `assessmentId` (Long)
- `courseId` (Long)
- `type` (Enum): PARCIAL, FINAL, RECUPERATORIO, TRABAJO_PRACTICO
- `date` (LocalDate)

---

## POST /teaching/courses/{courseId}/assessments

Crear evaluación.

**Request:**
```http
POST /teaching/courses/2000/assessments
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
Content-Type: application/json

{
  "tipo": "PARCIAL",
  "fecha": "2025-11-15"
}
```

**Request Body:**
- `tipo` (Enum, requerido)
- `fecha` (LocalDate, requerido)

**Response:** `201 CREATED`
```json
{
  "assessmentId": 5000,
  "courseId": 2000,
  "type": "PARCIAL",
  "date": "2025-11-15"
}
```

---

## GET /teaching/assessments/{assessmentId}/grades

Obtener calificaciones.

**Request:**
```http
GET /teaching/assessments/5000/grades
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "studentId": 3000,
    "grade": "8",
    "published": false
  }
]
```

**Campos:**
- `studentId` (Long)
- `grade` (String): "1"-"10", "AUSENTE", o null
- `published` (boolean)

---

## PUT /teaching/assessments/{assessmentId}/grades

Guardar calificaciones.

**Request:**
```http
PUT /teaching/assessments/5000/grades
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
Content-Type: application/json

{
  "courseId": 2000,
  "grades": [
    {
      "studentId": 3000,
      "grade": "8"
    },
    {
      "studentId": 3001,
      "grade": "7"
    }
  ]
}
```

**Request Body:**
- `courseId` (Long, requerido)
- `grades` (Array, requerido)
  - `studentId` (Long, requerido)
  - `grade` (String, opcional)

**Response:** `204 NO CONTENT`

---

## POST /teaching/assessments/{assessmentId}:publish

Publicar calificaciones.

**Request:**
```http
POST /teaching/assessments/5000:publish
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
Idempotency-Key: uuid-123-456
```

**Headers Opcionales:**
- `Idempotency-Key` (String)

**Response:** `200 OK`
```json
{
  "assessmentId": 5000,
  "publishedCount": 30,
  "publishedAt": "2025-10-29T15:30:00-03:00"
}
```

**Campos:**
- `assessmentId` (Long)
- `publishedCount` (int)
- `publishedAt` (OffsetDateTime)

---

## GET /teaching/courses/{courseId}/grades

Calificaciones consolidadas del curso.

**Request:**
```http
GET /teaching/courses/2000/grades
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "assessmentId": 5000,
    "tipo": "PARCIAL",
    "fecha": "2025-11-15",
    "grades": [
      {
        "studentId": 3000,
        "grade": "8",
        "published": false
      }
    ]
  }
]
```

**Campos:**
- `assessmentId` (Long)
- `tipo` (Enum)
- `fecha` (LocalDate)
- `grades` (Array)
  - `studentId` (Long)
  - `grade` (String)
  - `published` (boolean)

---

# 4. Actas

## GET /teaching/courses/{courseId}/acts

Listar actas.

**Request:**
```http
GET /teaching/courses/2000/acts
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "actaId": 7000,
    "courseId": 2000,
    "periodo": "2025Q1",
    "estado": "CERRADA",
    "windowOpenAt": "2025-12-01T00:00:00",
    "windowCloseAt": "2025-12-31T23:59:59",
    "cerradaEn": "2025-12-15T18:00:00",
    "items": []
  }
]
```

**Campos:**
- `actaId` (Long)
- `courseId` (Long)
- `periodo` (String)
- `estado` (Enum): ABIERTA, CERRADA
- `windowOpenAt` (LocalDateTime)
- `windowCloseAt` (LocalDateTime)
- `cerradaEn` (LocalDateTime, nullable)
- `items` (Array)

---

## GET /teaching/courses/{courseId}/acts:preview

Vista previa del acta.

**Request:**
```http
GET /teaching/courses/2000/acts:preview
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
{
  "courseId": 2000,
  "periodo": "2025Q1",
  "items": [
    {
      "studentId": 3000,
      "eval1": "8",
      "eval2": "9",
      "eval3": null,
      "eval4": null,
      "recupTarget": null,
      "recupNota": null,
      "cursadaNota": "8.5",
      "finalNota": "9",
      "asistenciaPct": 95,
      "promocionable": true,
      "correlativasOk": true,
      "estadoFinal": "APROBADO",
      "notaMateria": "9"
    }
  ]
}
```

**Campos:**
- `courseId` (Long)
- `periodo` (String)
- `items` (Array)
  - `studentId` (Long)
  - `eval1` (String, nullable)
  - `eval2` (String, nullable)
  - `eval3` (String, nullable)
  - `eval4` (String, nullable)
  - `recupTarget` (Integer, nullable)
  - `recupNota` (String, nullable)
  - `cursadaNota` (String, nullable)
  - `finalNota` (String, nullable)
  - `asistenciaPct` (Integer, nullable)
  - `promocionable` (boolean)
  - `correlativasOk` (boolean)
  - `estadoFinal` (Enum): APROBADO, DESAPROBADO, AUSENTE, PENDIENTE
  - `notaMateria` (String, nullable)

---

## POST /teaching/courses/{courseId}/acts:confirm

Confirmar y cerrar acta.

**Request:**
```http
POST /teaching/courses/2000/acts:confirm
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `201 CREATED`
```json
{
  "actaId": 7000,
  "courseId": 2000,
  "periodo": "2025Q1",
  "estado": "CERRADA",
  "windowOpenAt": "2025-12-01T00:00:00",
  "windowCloseAt": "2025-12-31T23:59:59",
  "cerradaEn": "2025-12-15T18:00:00",
  "items": []
}
```

---

# 5. Disponibilidad

## GET /teachers/me/availability

Obtener disponibilidad.

**Request:**
```http
GET /teachers/me/availability
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "dayOfWeek": "LUNES",
    "shift": "MANANA",
    "modality": "PRESENCIAL",
    "campuses": ["Centro", "Norte"]
  }
]
```

**Campos:**
- `dayOfWeek` (String): LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO
- `shift` (Enum): MANANA, TARDE, NOCHE
- `modality` (Enum): PRESENCIAL, VIRTUAL, HIBRIDA
- `campuses` (List<String>)

---

## PUT /teachers/me/availability

Actualizar disponibilidad.

**Request:**
```http
PUT /teachers/me/availability
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
Content-Type: application/json

{
  "blocks": [
    {
      "dayOfWeek": "LUNES",
      "shift": "MANANA",
      "modality": "PRESENCIAL",
      "campuses": ["Centro"]
    }
  ]
}
```

**Request Body:**
- `blocks` (Array, requerido)
  - `dayOfWeek` (String, requerido)
  - `shift` (Enum, requerido)
  - `modality` (Enum, requerido)
  - `campuses` (List<String>, opcional)

**Response:** `204 NO CONTENT`

---

# 6. Propuestas del Docente

## GET /teachers/me/proposals

Listar propuestas.

**Request:**
```http
GET /teachers/me/proposals
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "proposalId": 9000,
    "subjectId": 501,
    "subjectName": "Física I",
    "status": "PENDIENTE",
    "createdAt": "2025-10-10T10:00:00",
    "decidedAt": null,
    "active": true
  }
]
```

**Campos:**
- `proposalId` (Long)
- `subjectId` (Long)
- `subjectName` (String)
- `status` (Enum): PENDIENTE, APROBADA, RECHAZADA
- `createdAt` (LocalDateTime)
- `decidedAt` (LocalDateTime, nullable)
- `active` (boolean)

---

## POST /teachers/me/proposals

Crear propuesta.

**Request:**
```http
POST /teachers/me/proposals
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
Content-Type: application/json

{
  "subjectId": 501
}
```

**Request Body:**
- `subjectId` (Long, requerido)

**Response:** `201 CREATED`
```json
{
  "proposalId": 9000,
  "subjectId": 501,
  "subjectName": "Física I",
  "status": "PENDIENTE",
  "createdAt": "2025-10-29T15:00:00",
  "decidedAt": null,
  "active": true
}
```

---

## DELETE /teachers/me/proposals

Eliminar propuesta pendiente.

**Request:**
```http
DELETE /teachers/me/proposals?subjectId=501
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Query Parameters:**
- `subjectId` (Long, requerido)

**Response:** `204 NO CONTENT`

---

## PATCH /teachers/me/proposals/{proposalId}/toggle-availability

Toggle disponibilidad de propuesta aprobada.

**Descripción:** Permite al docente indicar si quiere aparecer como disponible para dictar una materia aprobada.

**Request:**
```http
PATCH /teachers/me/proposals/9000/toggle-availability
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Path Parameters:**
- `proposalId` (Long, requerido)

**Response:** `200 OK`
```json
{
  "proposalId": 9000,
  "subjectId": 501,
  "subjectName": "Física I",
  "status": "APROBADA",
  "createdAt": "2025-10-10T10:00:00",
  "decidedAt": "2025-10-15T14:00:00",
  "active": true
}
```

**Nota:** Solo aplicable a propuestas en estado APROBADA.

---

## PUT /teachers/me/proposals/{proposalId}

Actualizar estado de propuesta (Admin).

**Request:**
```http
PUT /teachers/me/proposals/9000
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
Content-Type: application/json

{
  "decision": "APROBADA"
}
```

**Path Parameters:**
- `proposalId` (Long, requerido)

**Request Body:**
- `decision` (String, requerido): "APROBADA" o "RECHAZADA"

**Response:** `200 OK`
```json
{
  "proposalId": 9000,
  "subjectId": 501,
  "subjectName": "Física I",
  "status": "APROBADA",
  "createdAt": "2025-10-10T10:00:00",
  "decidedAt": "2025-11-05T16:30:00",
  "active": true
}
```

---

# 7. Calendario

## GET /teachers/me/calendar

Obtener eventos del calendario.

**Request:**
```http
GET /teachers/me/calendar?from=2025-10-01&to=2025-10-31
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Query Parameters:**
- `from` (LocalDate, opcional)
- `to` (LocalDate, opcional)

**Response:** `200 OK`
```json
[
  {
    "source": "COURSE",
    "title": "Matemática I - Comisión A",
    "start": "2025-10-15T08:00:00-03:00",
    "end": "2025-10-15T10:00:00-03:00",
    "link": "/teaching/courses/2000",
    "campus": "Centro"
  }
]
```

**Campos:**
- `source` (String)
- `title` (String)
- `start` (OffsetDateTime)
- `end` (OffsetDateTime)
- `link` (String, nullable)
- `campus` (String, nullable)

---

## GET /teachers/me/calendar/next

Obtener próxima clase del docente.

**Request:**
```http
GET /teachers/me/calendar/next
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK` (si hay próxima clase)
```json
{
  "cursoId": 2000,
  "materia": "Matemática I",
  "comision": "A",
  "turno": "MANANA",
  "modalidad": "PRESENCIAL",
  "campus": "Centro",
  "aula": "Aula 101",
  "fecha": "2025-11-06",
  "startAt": "2025-11-06T08:00:00-03:00",
  "endAt": "2025-11-06T10:00:00-03:00",
  "cursoFechaInicio": "2025-10-01",
  "cursoFechaFin": "2025-12-31"
}
```

**Response:** `204 NO CONTENT` (si no hay próxima clase)

**Campos:**
- `cursoId` (Long)
- `materia` (String)
- `comision` (String)
- `turno` (String)
- `modalidad` (String)
- `campus` (String)
- `aula` (String, nullable)
- `fecha` (LocalDate)
- `startAt` (OffsetDateTime)
- `endAt` (OffsetDateTime)
- `cursoFechaInicio` (LocalDate)
- `cursoFechaFin` (LocalDate)

---

# 8. Notificaciones

## GET /teachers/me/notifications

Listar notificaciones.

**Request:**
```http
GET /teachers/me/notifications
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "notificationId": 10000,
    "title": "Nueva asignación",
    "message": "Has sido asignado a Matemática I",
    "link": "/teaching/courses/2000",
    "read": false,
    "createdAt": "2025-10-29T10:00:00-03:00"
  }
]
```

**Campos:**
- `notificationId` (Long)
- `title` (String)
- `message` (String)
- `link` (String, nullable)
- `read` (boolean)
- `createdAt` (OffsetDateTime)

---

## POST /teachers/me/notifications/{notificationId}:read

Marcar notificación como leída.

**Request:**
```http
POST /teachers/me/notifications/10000:read
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `204 NO CONTENT`

---

# 9. Cuenta y Recursos

## GET /teachers/me/account/balance

Obtener saldo.

**Request:**
```http
GET /teachers/me/account/balance
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
{
  "balance": 5000.50
}
```

**Campos:**
- `balance` (BigDecimal)

---

## PUT /teachers/me/account/balance

Cargar saldo.

**Request:**
```http
PUT /teachers/me/account/balance
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
Content-Type: application/json

{
  "amount": 1000.00
}
```

**Request Body:**
- `amount` (BigDecimal, requerido)

**Response:** `200 OK`
```json
{
  "message": "Saldo cargado exitosamente",
  "new_balance": 6000.50
}
```

**Campos:**
- `message` (String)
- `new_balance` (BigDecimal)

---

## GET /teachers/me/canteen/reservations

Listar reservas de comedor.

**Request:**
```http
GET /teachers/me/canteen/reservations
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "reservationId": 12000,
    "scheduledAt": "2025-10-30T12:00:00-03:00",
    "menu": "Milanesas con puré",
    "campus": "Centro",
    "status": "CONFIRMADA"
  }
]
```

**Campos:**
- `reservationId` (Long)
- `scheduledAt` (OffsetDateTime)
- `menu` (String)
- `campus` (String)
- `status` (String)

---

## GET /teachers/me/canteen/reservations:export

Exportar reservas en CSV.

**Request:**
```http
GET /teachers/me/canteen/reservations:export
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```
Content-Type: text/csv; charset=UTF-8
Content-Disposition: attachment; filename=reservations.csv

reservationId,scheduledAt,menu,campus,status
12000,2025-10-30T12:00:00-03:00,Milanesas con puré,Centro,CONFIRMADA
```

---

## GET /teachers/me/store/orders

Listar órdenes de tienda.

**Request:**
```http
GET /teachers/me/store/orders
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```json
[
  {
    "orderId": 13000,
    "placedAt": "2025-10-25T15:30:00-03:00",
    "total": 8200.00,
    "status": "ENTREGADO",
    "items": [
      {
        "product": "Remera institucional",
        "quantity": 2,
        "unitPrice": 3500.00
      }
    ]
  }
]
```

**Campos:**
- `orderId` (Long)
- `placedAt` (OffsetDateTime)
- `total` (BigDecimal)
- `status` (String)
- `items` (List)
  - `product` (String)
  - `quantity` (int)
  - `unitPrice` (BigDecimal)

---

## GET /teachers/me/store/orders:export

Exportar órdenes en CSV.

**Request:**
```http
GET /teachers/me/store/orders:export
X-Teacher-Id: 1000
X-Teacher-Roles: TITULAR
```

**Response:** `200 OK`
```
Content-Type: text/csv; charset=UTF-8
Content-Disposition: attachment; filename=orders.csv

orderId,placedAt,product,quantity,unitPrice,total,status
13000,2025-10-25T15:30:00-03:00,Remera institucional,2,3500.00,8200.00,ENTREGADO
```

---

# 10. Admin - Propuestas

## GET /admin/proposals

Listar todas las propuestas (Admin).

**Request:**
```http
GET /admin/proposals
X-Teacher-Id: 2000
X-Teacher-Roles: ADMIN
```

**Response:** `200 OK`
```json
[
  {
    "proposalId": 9000,
    "docenteId": 1000,
    "subjectId": 501,
    "subjectName": "Física I",
    "status": "PENDIENTE",
    "createdAt": "2025-10-10T10:00:00",
    "decidedAt": null,
    "active": true
  }
]
```

**Campos:**
- `proposalId` (Long)
- `docenteId` (Long)
- `subjectId` (Long)
- `subjectName` (String)
- `status` (Enum): PENDIENTE, APROBADA, RECHAZADA
- `createdAt` (LocalDateTime)
- `decidedAt` (LocalDateTime, nullable)
- `active` (boolean)

---

## POST /admin/proposals/decision

Aprobar/Rechazar propuesta por ID (Admin).

**Request:**
```http
POST /admin/proposals/decision
X-Teacher-Id: 2000
X-Teacher-Roles: ADMIN
Content-Type: application/json

{
  "proposalId": 9000,
  "decision": "APROBADA",
  "motivo": "Cumple requisitos"
}
```

**Request Body:**
- `proposalId` (Long, requerido)
- `decision` (String, requerido): "APROBADA" o "RECHAZADA"
- `motivo` (String, opcional)

**Response:** `200 OK`
```json
{
  "proposalId": 9000,
  "subjectId": 501,
  "subjectName": "Física I",
  "status": "APROBADA",
  "createdAt": "2025-10-10T10:00:00",
  "decidedAt": "2025-11-05T16:00:00",
  "active": true
}
```

---

# 11. Admin - Materias

## GET /admin/subjects

Listar todas las materias (Admin).

**Request:**
```http
GET /admin/subjects
X-Teacher-Id: 2000
X-Teacher-Roles: ADMIN
```

**Response:** `200 OK`
```json
[
  {
    "subjectId": 500,
    "subjectName": "Matemática I",
    "careerId": 10,
    "careerName": "Ingeniería en Sistemas",
    "careerCode": "ING-SIS"
  },
  {
    "subjectId": 501,
    "subjectName": "Física I",
    "careerId": 10,
    "careerName": "Ingeniería en Sistemas",
    "careerCode": "ING-SIS"
  }
]
```

**Campos:**
- `subjectId` (Long)
- `subjectName` (String)
- `careerId` (Long)
- `careerName` (String)
- `careerCode` (String)

---

# 12. Admin - Sedes

## GET /admin/sedes

Listar todas las sedes (Admin).

**Request:**
```http
GET /admin/sedes?onlyActive=true
X-Teacher-Id: 2000
X-Teacher-Roles: ADMIN
```

**Query Parameters:**
- `onlyActive` (boolean, default: true): Filtrar solo sedes activas

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "code": "CEN",
    "name": "Centro",
    "active": true
  },
  {
    "id": 2,
    "code": "NOR",
    "name": "Norte",
    "active": true
  }
]
```

**Campos:**
- `id` (Long)
- `code` (String)
- `name` (String)
- `active` (boolean)

---

## 📋 Códigos HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Operación exitosa sin contenido |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Sin autenticación |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## 📋 Tipos de Datos

- **Long**: Número entero largo
- **String**: Cadena de texto
- **boolean**: true/false
- **int**: Número entero
- **BigDecimal**: Número decimal preciso
- **LocalDate**: Fecha (YYYY-MM-DD)
- **LocalDateTime**: Fecha y hora sin zona horaria
- **OffsetDateTime**: Fecha y hora con zona horaria
- **List/Array**: Lista de elementos
- **nullable**: Puede ser null

---

## 📊 Resumen de Endpoints

**Total:** 39 endpoints

- **Docente:** 27 endpoints
- **Admin:** 4 endpoints
- **Recursos (Cuenta, Comedor, Tienda):** 6 endpoints
- **Otros:** 2 endpoints

---

**Versión:** 2.0  
**Última actualización:** Noviembre 2025

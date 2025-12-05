# Portal Docente - Documentación Completa de API

Este documento contiene la documentación exhaustiva de todos los endpoints del backend del Portal Docente de Campus Connect.

**Base URL:** `/` (depende del entorno de deployment)  
**Autenticación:** JWT Bearer Token (modo mock disponible para desarrollo)  
**Formato de fechas:** ISO-8601  
**Formato de studentId:** UUID v4 (String) - Ej: `"a3b5f6d4-9c28-4b41-bb90-9d36a92f4b17"`

---

## Índice de Controladores

| Controlador | Base Path | Descripción |
|-------------|-----------|-------------|
| [TeachersController](#1-teacherscontroller) | `/teachers/me` | Perfil y cursos del docente |
| [TeacherAccountController](#2-teacheraccountcontroller) | `/teachers/me` | Cuenta, balance y consumos |
| [WalletController](#3-walletcontroller) | `/teachers/me/wallet` | Billetera e historial financiero |
| [TeacherAvailabilityController](#4-teacheravailabilitycontroller) | `/teachers/me/availability` | Disponibilidad horaria |
| [TeacherProposalController](#5-teacherproposalcontroller) | `/teachers/me/proposals` | Propuestas de dictado |
| [TeacherCalendarController](#6-teachercalendarcontroller) | `/teachers/me/calendar` | Calendario académico |
| [TeacherNotificationController](#7-teachernotificationcontroller) | `/teachers/me/notifications` | Notificaciones |
| [TeachingCoursesController](#8-teachingcoursescontroller) | `/teaching/courses` | Gestión de cursos |
| [AssessmentController](#9-assessmentcontroller) | `/teaching` | Evaluaciones y calificaciones |
| [AttendanceController](#10-attendancecontroller) | `/teaching/courses/{courseId}/attendance` | Asistencia |
| [ActaController](#11-actacontroller) | `/teaching/courses/{courseId}` | Actas de cierre |
| [AdminProposalController](#12-adminproposalcontroller) | `/admin/proposals` | Admin - Propuestas |
| [AdminSubjectController](#13-adminsubjectcontroller) | `/admin/subjects` | Admin - Materias |
| [AdminSedeController](#14-adminsedecontroller) | `/admin/sedes` | Admin - Sedes |
| [AttendanceEventController](#15-attendanceeventcontroller) | `/api/events/attendance` | Eventos de asistencia (interno) |

---

## Tipos de Datos Comunes (Enums)

### Modalidad
```
PRESENCIAL | VIRTUAL | AMBAS
```

### Turno
```
MANIANA | TARDE | NOCHE
```

### TipoEvaluacion
```
PARCIAL_1 | PARCIAL_2 | TP | FINAL | RECUPERATORIO
```

### EstadoPropuesta
```
PENDIENTE | APROBADA | RECHAZADA
```

### EstadoActa
```
ABIERTO | CERRADO
```

### EstadoFinal
```
PROMOCIONADA | APROBADA | A_FINAL_PREVIO | RECURSA | AUSENTE
```

### EstadoInscripcion
```
REGULAR | LIBRE | ACTIVA | BAJA
```

### RolDocente
```
TITULAR | AYUDANTE
```

### RolCurso
```
ALUMNO | TITULAR | AUXILIAR
```

### EstadoAsistencia (para requests)
```
PRESENTE | AUSENTE | MEDIA_FALTA | P | A | M
```

---

## 1. TeachersController

**Base Path:** `/teachers/me`

### 1.1 GET `/teachers/me` - Obtener perfil del docente

Retorna el perfil del docente autenticado.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
```json
{
  "teacherId": 1,
  "email": "docente@universidad.edu",
  "name": "Juan Pérez",
  "activo": true,
  "role": "DOCENTE",
  "legajo": "D-12345",
  "cantidadCursosDictados": 5
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `teacherId` | Long | ID único del docente |
| `email` | String | Correo electrónico |
| `name` | String | Nombre completo |
| `activo` | boolean | Si está activo en el sistema |
| `role` | String | Rol del usuario |
| `legajo` | String | Número de legajo |
| `cantidadCursosDictados` | Long | Cantidad de cursos dictados |

---

### 1.2 GET `/teachers/me/courses` - Listar cursos del docente

Retorna los cursos asignados al docente.

**Parámetros de entrada (Query):**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `period` | String | No | Período académico (ej: "2024-1") |

**Respuesta (200 OK):**
```json
[
  {
    "courseId": 101,
    "subjectId": 10,
    "subjectName": "Programación I",
    "comision": "A",
    "campus": "CENTRAL",
    "classroom": "Aula 301",
    "term": "2024-1",
    "diaSemana": "LUNES",
    "turno": "MANIANA",
    "rol": "TITULAR"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `courseId` | Long | ID del curso |
| `subjectId` | Long | ID de la materia |
| `subjectName` | String | Nombre de la materia |
| `comision` | String | Comisión/división |
| `campus` | String | Código de sede |
| `classroom` | String | Aula asignada |
| `term` | String | Período académico |
| `diaSemana` | String | Día de la semana |
| `turno` | Turno | Turno de cursada |
| `rol` | RolDocente | Rol del docente en el curso |

---

## 2. TeacherAccountController

**Base Path:** `/teachers/me`

### 2.1 GET `/teachers/me/account/balance` - Obtener saldo

Retorna el saldo actual de la cuenta del docente.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
```json
{
  "balance": 15000.50
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `balance` | BigDecimal | Saldo actual (2 decimales) |

---

### 2.2 PUT/POST `/teachers/me/account/balance` - Cargar saldo

Registra una carga de saldo en la cuenta.

**Parámetros de entrada (Body):**
```json
{
  "amount": 5000.00
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `amount` | BigDecimal | Sí | Monto a cargar (debe ser > 0) |

**Respuesta (200 OK):**
```json
{
  "ok": true,
  "topupId": 123,
  "newBalance": 20000.50
}
```

**Errores posibles:**
- `400 Bad Request`: Si `amount` es null o <= 0

---

### 2.3 GET `/teachers/me/canteen/reservations` - Listar reservas de comedor

Retorna las reservas de comedor del docente.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
```json
[
  {
    "reservationId": 1,
    "scheduledAt": "2024-03-15T12:30:00Z",
    "menu": "Menú ejecutivo",
    "campus": "CENTRAL",
    "status": "CONFIRMADA"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `reservationId` | Long | ID de la reserva |
| `scheduledAt` | OffsetDateTime | Fecha y hora programada |
| `menu` | String | Tipo de menú |
| `campus` | String | Sede del comedor |
| `status` | String | Estado de la reserva |

---

### 2.4 GET `/teachers/me/canteen/reservations:export` - Exportar reservas CSV

Descarga las reservas en formato CSV.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
- `Content-Type: text/csv; charset=UTF-8`
- `Content-Disposition: attachment; filename=reservations.csv`
- Body: Archivo CSV

---

### 2.5 GET `/teachers/me/store/orders` - Listar pedidos de tienda

Retorna los pedidos de tienda del docente.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
```json
[
  {
    "orderId": 1,
    "placedAt": "2024-03-15T10:00:00Z",
    "total": 2500.00,
    "status": "ENTREGADO",
    "items": [
      {
        "product": "Cuaderno A4",
        "quantity": 2,
        "unitPrice": 500.00
      }
    ]
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `orderId` | Long | ID del pedido |
| `placedAt` | OffsetDateTime | Fecha del pedido |
| `total` | BigDecimal | Total del pedido |
| `status` | String | Estado del pedido |
| `items` | Array | Lista de productos |
| `items[].product` | String | Nombre del producto |
| `items[].quantity` | int | Cantidad |
| `items[].unitPrice` | BigDecimal | Precio unitario |

---

### 2.6 GET `/teachers/me/store/orders:export` - Exportar pedidos CSV

Descarga los pedidos en formato CSV.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
- `Content-Type: text/csv; charset=UTF-8`
- `Content-Disposition: attachment; filename=orders.csv`
- Body: Archivo CSV

---

## 3. WalletController

**Base Path:** `/teachers/me/wallet`

### 3.1 GET `/teachers/me/wallet/history` - Historial de movimientos

Retorna el historial de movimientos de la billetera.

**Parámetros de entrada (Query):**

| Parámetro | Tipo | Requerido | Formato | Descripción |
|-----------|------|-----------|---------|-------------|
| `from` | LocalDate | No | yyyy-MM-dd | Fecha desde |
| `to` | LocalDate | No | yyyy-MM-dd | Fecha hasta |

**Respuesta (200 OK):**
```json
[
  {
    "nombre": "Carga de saldo",
    "tipo": "INGRESO",
    "fecha": "2024-03-15T10:00:00Z",
    "monto": 5000.00
  },
  {
    "nombre": "Comedor - Menú ejecutivo",
    "tipo": "EGRESO",
    "fecha": "2024-03-15T12:30:00Z",
    "monto": -850.00
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | String | Descripción del movimiento |
| `tipo` | String | "INGRESO" o "EGRESO" |
| `fecha` | OffsetDateTime | Fecha y hora |
| `monto` | BigDecimal | Monto (+ ingresos, - egresos) |

---

### 3.2 GET `/teachers/me/wallet/summary` - Resumen de billetera

Retorna el resumen con total y lista de movimientos.

**Parámetros de entrada (Query):**

| Parámetro | Tipo | Requerido | Formato | Descripción |
|-----------|------|-----------|---------|-------------|
| `from` | LocalDate | No | yyyy-MM-dd | Fecha desde |
| `to` | LocalDate | No | yyyy-MM-dd | Fecha hasta |

**Respuesta (200 OK):**
```json
{
  "total": 15000.50,
  "items": [
    {
      "name": "Carga de saldo",
      "type": "TOPUP",
      "date": "2024-03-15T10:00:00Z",
      "amount": 5000.00
    },
    {
      "name": "Menú ejecutivo",
      "type": "CANTEEN",
      "date": "2024-03-15T12:30:00Z",
      "amount": -850.00
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total` | BigDecimal | Saldo total del período |
| `items` | Array | Lista de movimientos |
| `items[].name` | String | Descripción |
| `items[].type` | String | TOPUP, LIBRARY, STORE, CANTEEN |
| `items[].date` | OffsetDateTime | Fecha y hora |
| `items[].amount` | BigDecimal | Monto |

---

### 3.3 POST `/teachers/me/wallet/topup` - Registrar carga de saldo

Registra una carga de saldo manual.

**Parámetros de entrada (Body):**
```json
{
  "id": null,
  "docenteId": null,
  "createdAt": null,
  "amount": 5000.00,
  "method": "MANUAL",
  "description": "Carga de saldo"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `amount` | BigDecimal | Sí | Monto a cargar |
| `method` | String | No | Método de pago |
| `description` | String | No | Descripción |

**Respuesta (201 Created):**
```json
{
  "id": 123,
  "docenteId": 1,
  "createdAt": "2024-03-15T10:00:00Z",
  "amount": 5000.00,
  "method": "MANUAL",
  "description": "Carga de saldo"
}
```

---

## 4. TeacherAvailabilityController

**Base Path:** `/teachers/me/availability`

### 4.1 GET `/teachers/me/availability` - Listar bloques de disponibilidad

Retorna todos los bloques de disponibilidad del docente.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "dayOfWeek": "LUNES",
    "shift": "MANIANA",
    "modality": "PRESENCIAL",
    "campuses": ["CENTRAL", "NORTE"]
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Long | ID del bloque |
| `dayOfWeek` | String | Día de la semana |
| `shift` | Turno | Turno |
| `modality` | Modalidad | Modalidad |
| `campuses` | Array<String> | Lista de códigos de sedes |

---

### 4.2 POST `/teachers/me/availability` - Agregar bloque

Agrega un nuevo bloque de disponibilidad.

**Parámetros de entrada (Body):**
```json
{
  "dayOfWeek": "MARTES",
  "shift": "TARDE",
  "modality": "PRESENCIAL",
  "campuses": ["CENTRAL"]
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `dayOfWeek` | String | Sí | Día de la semana |
| `shift` | Turno | Sí | Turno (MANIANA, TARDE, NOCHE) |
| `modality` | Modalidad | Sí | Modalidad |
| `campuses` | Array<String> | No | Códigos de sedes |

**Respuesta (201 Created):**
```json
{
  "id": 2,
  "dayOfWeek": "MARTES",
  "shift": "TARDE",
  "modality": "PRESENCIAL",
  "campuses": ["CENTRAL"]
}
```

---

### 4.3 PATCH `/teachers/me/availability/{id}` - Modificar bloque

Modifica la modalidad y/o sedes de un bloque específico.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `id` | Path | Long | Sí | ID del bloque |

**Body:**
```json
{
  "modality": "VIRTUAL",
  "campuses": []
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `modality` | Modalidad | No | Nueva modalidad |
| `campuses` | Array<String> | Sí | Nuevas sedes (no puede ser null) |

**Respuesta (200 OK):**
```json
{
  "id": 1,
  "dayOfWeek": "LUNES",
  "shift": "MANIANA",
  "modality": "VIRTUAL",
  "campuses": []
}
```

---

### 4.4 DELETE `/teachers/me/availability/{id}` - Eliminar bloque

Elimina un bloque de disponibilidad.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `id` | Path | Long | Sí | ID del bloque |

**Respuesta:** `204 No Content`

---

## 5. TeacherProposalController

**Base Path:** `/teachers/me/proposals`

### 5.1 GET `/teachers/me/proposals` - Listar propuestas

Retorna las propuestas de dictado del docente.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
```json
[
  {
    "proposalId": 1,
    "subjectId": 10,
    "subjectName": "Programación I",
    "status": "PENDIENTE",
    "createdAt": "2024-03-01T10:00:00",
    "decidedAt": null,
    "active": false
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `proposalId` | Long | ID de la propuesta |
| `subjectId` | Long | ID de la materia |
| `subjectName` | String | Nombre de la materia |
| `status` | EstadoPropuesta | Estado |
| `createdAt` | LocalDateTime | Fecha de creación |
| `decidedAt` | LocalDateTime | Fecha de decisión (null si pendiente) |
| `active` | boolean | Si está activa (para aprobadas) |

---

### 5.2 POST `/teachers/me/proposals` - Crear propuesta

Crea una nueva propuesta de dictado.

**Parámetros de entrada (Body):**
```json
{
  "subjectId": 10
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `subjectId` | Long | Sí | ID de la materia |

**Respuesta (201 Created):**
```json
{
  "proposalId": 2,
  "subjectId": 10,
  "subjectName": "Programación I",
  "status": "PENDIENTE",
  "createdAt": "2024-03-15T10:00:00",
  "decidedAt": null,
  "active": false
}
```

---

### 5.3 DELETE `/teachers/me/proposals?subjectId={subjectId}` - Eliminar propuesta pendiente

Elimina una propuesta pendiente del docente por materia.

**Parámetros de entrada (Query):**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `subjectId` | Long | Sí | ID de la materia |

**Respuesta:** `204 No Content`

---

### 5.4 PATCH `/teachers/me/proposals/{proposalId}/toggle-availability` - Toggle disponibilidad

Cambia el estado de disponibilidad de una propuesta aprobada.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `proposalId` | Path | Long | Sí | ID de la propuesta |

**Respuesta (200 OK):**
```json
{
  "proposalId": 1,
  "subjectId": 10,
  "subjectName": "Programación I",
  "status": "APROBADA",
  "createdAt": "2024-03-01T10:00:00",
  "decidedAt": "2024-03-05T14:00:00",
  "active": true
}
```

---

### 5.5 PUT `/teachers/me/proposals/{proposalId}` - Actualizar estado (Admin)

Permite al administrador aprobar o rechazar una propuesta.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `proposalId` | Path | Long | Sí | ID de la propuesta |

**Body:**
```json
{
  "decision": "APROBADA"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `decision` | String | Sí | "APROBADA" o "RECHAZADA" |

**Respuesta (200 OK):**
```json
{
  "proposalId": 1,
  "subjectId": 10,
  "subjectName": "Programación I",
  "status": "APROBADA",
  "createdAt": "2024-03-01T10:00:00",
  "decidedAt": "2024-03-15T10:00:00",
  "active": false
}
```

**Errores:**
- `400 Bad Request`: Si `decision` es null o vacío

---

## 6. TeacherCalendarController

**Base Path:** `/teachers/me/calendar`

### 6.1 GET `/teachers/me/calendar` - Obtener calendario

Retorna los eventos del calendario del docente.

**Parámetros de entrada (Query):**

| Parámetro | Tipo | Requerido | Formato | Descripción |
|-----------|------|-----------|---------|-------------|
| `from` | LocalDate | No | yyyy-MM-dd | Fecha desde |
| `to` | LocalDate | No | yyyy-MM-dd | Fecha hasta |

**Respuesta (200 OK):**
```json
[
  {
    "source": "CURSO",
    "title": "Programación I - Comisión A",
    "start": "2024-03-15T08:00:00Z",
    "end": "2024-03-15T12:00:00Z",
    "link": "/teaching/courses/101",
    "campus": "CENTRAL"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `source` | String | Origen del evento |
| `title` | String | Título |
| `start` | OffsetDateTime | Inicio |
| `end` | OffsetDateTime | Fin |
| `link` | String | Enlace relacionado |
| `campus` | String | Sede |

---

### 6.2 GET `/teachers/me/calendar/next` - Próxima clase

Retorna la información de la próxima clase.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
```json
{
  "cursoId": 101,
  "materia": "Programación I",
  "comision": "A",
  "turno": "MANIANA",
  "modalidad": "PRESENCIAL",
  "campus": "CENTRAL",
  "aula": "Aula 301",
  "fecha": "2024-03-15",
  "startAt": "2024-03-15T08:00:00Z",
  "endAt": "2024-03-15T12:00:00Z",
  "cursoFechaInicio": "2024-03-01",
  "cursoFechaFin": "2024-07-15"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cursoId` | Long | ID del curso |
| `materia` | String | Nombre de la materia |
| `comision` | String | Comisión |
| `turno` | String | Turno |
| `modalidad` | String | Modalidad |
| `campus` | String | Sede |
| `aula` | String | Aula (null si VIRTUAL) |
| `fecha` | LocalDate | Fecha de la clase |
| `startAt` | OffsetDateTime | Hora de inicio |
| `endAt` | OffsetDateTime | Hora de fin |
| `cursoFechaInicio` | LocalDate | Inicio del curso |
| `cursoFechaFin` | LocalDate | Fin del curso |

**Respuesta:** `204 No Content` si no hay próxima clase

---

## 7. TeacherNotificationController

**Base Path:** `/teachers/me/notifications`

### 7.1 GET `/teachers/me/notifications` - Listar notificaciones

Retorna las notificaciones del docente.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
```json
[
  {
    "notificationId": 1,
    "title": "Nueva asignación",
    "message": "Se te ha asignado el curso Programación I",
    "link": "/teaching/courses/101",
    "read": false,
    "createdAt": "2024-03-15T10:00:00Z"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `notificationId` | Long | ID de la notificación |
| `title` | String | Título |
| `message` | String | Mensaje |
| `link` | String | Enlace relacionado |
| `read` | boolean | Si fue leída |
| `createdAt` | OffsetDateTime | Fecha de creación |

---

### 7.2 POST `/teachers/me/notifications/{notificationId}:read` - Marcar como leída

Marca una notificación como leída.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `notificationId` | Path | Long | Sí | ID de la notificación |

**Respuesta:** `204 No Content`

---

## 8. TeachingCoursesController

**Base Path:** `/teaching/courses`

### 8.1 GET `/teaching/courses/mine` - Mis cursos (detallado)

Retorna los cursos del docente con información detallada.

**Parámetros de entrada (Query):**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `term` | String | No | - | Período académico |
| `includePrevious` | boolean | No | true | Incluir períodos anteriores |

**Respuesta (200 OK):**
```json
[
  {
    "courseId": 101,
    "materia": "Programación I",
    "comision": "A",
    "periodo": "2024-1",
    "modalidad": "PRESENCIAL",
    "campus": "CENTRAL",
    "aula": "Aula 301",
    "diaSemana": "LUNES",
    "turno": "MANIANA",
    "promocionable": true,
    "studentCount": 35,
    "orDefault": [
      {
        "teacherId": 1,
        "nombre": "Juan Pérez",
        "rol": "TITULAR"
      }
    ]
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `courseId` | Long | ID del curso |
| `materia` | String | Nombre de la materia |
| `comision` | String | Comisión |
| `periodo` | String | Período académico |
| `modalidad` | Modalidad | Modalidad |
| `campus` | String | Sede |
| `aula` | String | Aula |
| `diaSemana` | String | Día de la semana |
| `turno` | Turno | Turno |
| `promocionable` | boolean | Si permite promoción |
| `studentCount` | long | Cantidad de estudiantes |
| `orDefault` | Array | Lista de docentes |

---

### 8.2 GET `/teaching/courses/{courseId}` - Detalle de curso

Retorna el detalle completo de un curso.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `courseId` | Path | Long | Sí | ID del curso |

**Respuesta (200 OK):**
```json
{
  "courseId": 101,
  "subjectId": 10,
  "subjectName": "Programación I",
  "comision": "A",
  "campus": "CENTRAL",
  "classroom": "Aula 301",
  "term": "2024-1",
  "diaSemana": "LUNES",
  "turno": "MANIANA",
  "modalidad": "PRESENCIAL",
  "promocionable": true,
  "titulares": [
    {
      "teacherId": 1,
      "name": "Juan Pérez",
      "email": "jperez@universidad.edu",
      "legajo": "D-12345",
      "role": "TITULAR"
    }
  ],
  "auxiliares": [
    {
      "teacherId": 2,
      "name": "María García",
      "email": "mgarcia@universidad.edu",
      "legajo": "D-12346",
      "role": "AUXILIAR"
    }
  ],
  "actaEstado": "ABIERTO"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `courseId` | Long | ID del curso |
| `subjectId` | Long | ID de la materia |
| `subjectName` | String | Nombre de la materia |
| `comision` | String | Comisión |
| `campus` | String | Sede |
| `classroom` | String | Aula |
| `term` | String | Período |
| `diaSemana` | String | Día de la semana |
| `turno` | Turno | Turno |
| `modalidad` | Modalidad | Modalidad |
| `promocionable` | boolean | Si permite promoción |
| `titulares` | Array | Docentes titulares |
| `auxiliares` | Array | Docentes auxiliares |
| `actaEstado` | String | Estado del acta |

---

### 8.3 GET `/teaching/courses/{courseId}/roster` - Lista de alumnos

Retorna la lista de alumnos inscriptos en el curso.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `courseId` | Path | Long | Sí | ID del curso |

**Respuesta (200 OK):**
```json
[
  {
    "studentId": "a3b5f6d4-9c28-4b41-bb90-9d36a92f4b17",
    "studentName": "Ana López",
    "status": "REGULAR",
    "legajo": "A-54321",
    "email": "alopez@estudiante.edu",
    "dni": 40123456,
    "activo": true
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `studentId` | String (UUID) | ID único del estudiante |
| `studentName` | String | Nombre completo |
| `status` | EstadoInscripcion | Estado de inscripción |
| `legajo` | String | Número de legajo |
| `email` | String | Email |
| `dni` | Integer | DNI |
| `activo` | boolean | Si está activo |

---

## 9. AssessmentController

**Base Path:** `/teaching`

### 9.1 GET `/teaching/courses/{courseId}/assessments` - Listar evaluaciones

Retorna las evaluaciones de un curso.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `courseId` | Path | Long | Sí | ID del curso |

**Respuesta (200 OK):**
```json
[
  {
    "assessmentId": 1,
    "courseId": 101,
    "type": "PARCIAL_1",
    "date": "2024-04-15"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `assessmentId` | Long | ID de la evaluación |
| `courseId` | Long | ID del curso |
| `type` | TipoEvaluacion | Tipo de evaluación |
| `date` | LocalDate | Fecha de la evaluación |

---

### 9.2 POST `/teaching/courses/{courseId}/assessments` - Crear evaluación

Crea una nueva evaluación para el curso.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `courseId` | Path | Long | Sí | ID del curso |

**Body:**
```json
{
  "tipo": "PARCIAL_1",
  "fecha": "2024-04-15"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `tipo` | TipoEvaluacion | Sí | Tipo de evaluación |
| `fecha` | LocalDate | Sí | Fecha |

**Respuesta (201 Created):**
```json
{
  "assessmentId": 1,
  "courseId": 101,
  "type": "PARCIAL_1",
  "date": "2024-04-15"
}
```

---

### 9.3 GET `/teaching/assessments/{assessmentId}/grades` - Listar calificaciones

Retorna las calificaciones de una evaluación.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `assessmentId` | Path | Long | Sí | ID de la evaluación |

**Respuesta (200 OK):**
```json
[
  {
    "studentId": "a3b5f6d4-9c28-4b41-bb90-9d36a92f4b17",
    "studentName": "Ana López",
    "legajo": "A-54321",
    "grade": "8",
    "published": false,
    "assessmentId": 1,
    "assessmentName": "PARCIAL_1",
    "courseId": 101
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `studentId` | String (UUID) | ID único del estudiante |
| `studentName` | String | Nombre |
| `legajo` | String | Legajo |
| `grade` | String | Calificación |
| `published` | boolean | Si fue publicada |
| `assessmentId` | Long | ID de la evaluación |
| `assessmentName` | String | Nombre de la evaluación |
| `courseId` | Long | ID del curso |

---

### 9.4 PUT `/teaching/assessments/{assessmentId}/grades` - Guardar calificaciones

Guarda/actualiza las calificaciones de una evaluación.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `assessmentId` | Path | Long | Sí | ID de la evaluación |

**Body:**
```json
{
  "courseId": 101,
  "grades": [
    {
      "studentId": "a3b5f6d4-9c28-4b41-bb90-9d36a92f4b17",
      "grade": "8"
    },
    {
      "studentId": "b4c6g7e5-0d39-5c52-cc01-0e47b03g5c28",
      "grade": "7"
    }
  ]
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `courseId` | Long | Sí | ID del curso |
| `grades` | Array | Sí | Lista de calificaciones (no vacía) |
| `grades[].studentId` | String (UUID) | Sí | ID único del estudiante |
| `grades[].grade` | String | No | Calificación (null = sin calificar) |

**Respuesta:** `204 No Content`

---

### 9.5 PUT `/teaching/assessments/{assessmentId}/grades:publish` - Guardar y publicar

Guarda las calificaciones y publica las pendientes.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `assessmentId` | Path | Long | Sí | ID de la evaluación |

**Body:** (igual que 9.4)

**Respuesta (200 OK):**
```json
{
  "assessmentId": 1,
  "publishedCount": 15,
  "publishedAt": "2024-04-20T10:00:00Z"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `assessmentId` | Long | ID de la evaluación |
| `publishedCount` | int | Cantidad publicadas |
| `publishedAt` | OffsetDateTime | Fecha de publicación |

---

### 9.6 POST `/teaching/assessments/{assessmentId}:publish` - Publicar calificaciones

Publica las calificaciones pendientes de una evaluación.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `assessmentId` | Path | Long | Sí | ID de la evaluación |

**Respuesta (200 OK):**
```json
{
  "assessmentId": 1,
  "publishedCount": 15,
  "publishedAt": "2024-04-20T10:00:00Z"
}
```

---

### 9.7 GET `/teaching/courses/{courseId}/grades` - Todas las calificaciones del curso

Retorna todas las calificaciones de todas las evaluaciones del curso.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `courseId` | Path | Long | Sí | ID del curso |

**Respuesta (200 OK):**
```json
[
  {
    "assessmentId": 1,
    "tipo": "PARCIAL_1",
    "fecha": "2024-04-15",
    "grades": [
      {
        "studentId": "a3b5f6d4-9c28-4b41-bb90-9d36a92f4b17",
        "studentName": "Ana López",
        "legajo": "A-54321",
        "grade": "8",
        "published": true,
        "assessmentId": 1,
        "assessmentName": "PARCIAL_1",
        "courseId": 101
      }
    ]
  }
]
```

---

## 10. AttendanceController

**Base Path:** `/teaching/courses/{courseId}/attendance`

### 10.1 GET `/teaching/courses/{courseId}/attendance/{date}` - Obtener asistencia de fecha

Retorna la asistencia de una fecha específica.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Formato | Descripción |
|-----------|-----------|------|-----------|---------|-------------|
| `courseId` | Path | Long | Sí | - | ID del curso |
| `date` | Path | LocalDate | Sí | yyyy-MM-dd | Fecha |

**Respuesta (200 OK):**
```json
{
  "courseId": 101,
  "date": "2024-03-15",
  "items": [
    {
      "studentId": "a3b5f6d4-9c28-4b41-bb90-9d36a92f4b17",
      "studentName": "Ana López",
      "legajo": "A-54321",
      "status": "PRESENTE"
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `courseId` | Long | ID del curso |
| `date` | LocalDate | Fecha |
| `items` | Array | Lista de asistencias |
| `items[].studentId` | String (UUID) | ID único del estudiante |
| `items[].studentName` | String | Nombre |
| `items[].legajo` | String | Legajo |
| `items[].status` | String | Estado de asistencia |

---

### 10.2 PUT `/teaching/courses/{courseId}/attendance/{date}` - Guardar asistencia

Guarda o actualiza la asistencia de una fecha.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Formato | Descripción |
|-----------|-----------|------|-----------|---------|-------------|
| `courseId` | Path | Long | Sí | - | ID del curso |
| `date` | Path | LocalDate | Sí | yyyy-MM-dd | Fecha |

**Body:**
```json
{
  "items": [
    {
      "studentId": "a3b5f6d4-9c28-4b41-bb90-9d36a92f4b17",
      "status": "PRESENTE"
    },
    {
      "studentId": "b4c6g7e5-0d39-5c52-cc01-0e47b03g5c28",
      "status": "AUSENTE"
    }
  ]
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `items` | Array | Sí | Lista de asistencias (no vacía) |
| `items[].studentId` | String (UUID) | Sí | ID único del estudiante |
| `items[].status` | String | Sí | PRESENTE, AUSENTE, MEDIA_FALTA, P, A, M |

**Respuesta (200 OK):**
```json
{
  "courseId": 101,
  "date": "2024-03-15",
  "items": [
    {
      "studentId": "a3b5f6d4-9c28-4b41-bb90-9d36a92f4b17",
      "studentName": "Ana López",
      "legajo": "A-54321",
      "status": "PRESENTE"
    }
  ]
}
```

---

### 10.3 GET `/teaching/courses/{courseId}/attendance` - Resumen de asistencia

Retorna el resumen de asistencia por fechas.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Formato | Descripción |
|-----------|-----------|------|-----------|---------|-------------|
| `courseId` | Path | Long | Sí | - | ID del curso |
| `from` | Query | LocalDate | No | yyyy-MM-dd | Fecha desde |
| `to` | Query | LocalDate | No | yyyy-MM-dd | Fecha hasta |

**Respuesta (200 OK):**
```json
[
  {
    "date": "2024-03-15",
    "presentes": 30,
    "ausentes": 5,
    "mediasFaltas": 2
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `date` | LocalDate | Fecha |
| `presentes` | long | Cantidad presentes |
| `ausentes` | long | Cantidad ausentes |
| `mediasFaltas` | long | Cantidad medias faltas |

---

### 10.4 GET `/teaching/courses/{courseId}/attendance/records` - Todos los registros

Retorna todos los registros de asistencia del curso.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `courseId` | Path | Long | Sí | ID del curso |

**Respuesta (200 OK):**
```json
[
  {
    "courseId": 101,
    "date": "2024-03-15",
    "items": [...]
  },
  {
    "courseId": 101,
    "date": "2024-03-22",
    "items": [...]
  }
]
```

---

## 11. ActaController

**Base Path:** `/teaching/courses/{courseId}`

### 11.1 GET `/teaching/courses/{courseId}/acts` - Listar actas

Retorna las actas del curso.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `courseId` | Path | Long | Sí | ID del curso |

**Respuesta (200 OK):**
```json
[
  {
    "actaId": 1,
    "courseId": 101,
    "periodo": "2024-1",
    "estado": "ABIERTO",
    "windowOpenAt": "2024-07-01T00:00:00",
    "windowCloseAt": "2024-07-15T23:59:59",
    "cerradaEn": null,
    "items": [
      {
        "studentId": "a3b5f6d4-9c28-4b41-bb90-9d36a92f4b17",
        "studentName": "Ana López",
        "legajo": "A-54321",
        "email": "alopez@estudiante.edu",
        "eval1": "8",
        "eval2": "7",
        "eval3": null,
        "eval4": null,
        "recupTarget": null,
        "recupNota": null,
        "cursadaNota": "7.5",
        "finalNota": null,
        "asistenciaPct": 85,
        "promocionable": true,
        "correlativasOk": true,
        "estadoFinal": "APROBADA",
        "notaMateria": "8"
      }
    ]
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `actaId` | Long | ID del acta |
| `courseId` | Long | ID del curso |
| `periodo` | String | Período académico |
| `estado` | EstadoActa | ABIERTO o CERRADO |
| `windowOpenAt` | LocalDateTime | Inicio ventana de cierre |
| `windowCloseAt` | LocalDateTime | Fin ventana de cierre |
| `cerradaEn` | LocalDateTime | Fecha de cierre (null si abierta) |
| `items` | Array | Detalle por alumno |
| `items[].studentId` | String (UUID) | ID único del estudiante |
| `items[].studentName` | String | Nombre del estudiante |
| `items[].legajo` | String | Legajo del estudiante |
| `items[].email` | String | Email del estudiante |
| `items[].eval1-4` | String | Notas de evaluaciones |
| `items[].recupTarget` | Integer | Parcial a recuperar (1-4) |
| `items[].recupNota` | String | Nota del recuperatorio |
| `items[].cursadaNota` | String | Nota de cursada |
| `items[].finalNota` | String | Nota del final |
| `items[].asistenciaPct` | Integer | Porcentaje de asistencia |
| `items[].promocionable` | boolean | Si puede promocionar |
| `items[].correlativasOk` | boolean | Si tiene correlativas OK |
| `items[].estadoFinal` | EstadoFinal | Estado final académico |
| `items[].notaMateria` | String | Nota final de la materia |

---

### 11.2 GET `/teaching/courses/{courseId}/acts:preview` - Vista previa del acta

Retorna una vista previa del acta antes de confirmar.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `courseId` | Path | Long | Sí | ID del curso |

**Respuesta (200 OK):**
```json
{
  "courseId": 101,
  "periodo": "2024-1",
  "courseName": "Programación I - Comisión A",
  "turno": "MANIANA",
  "studentCount": 35,
  "titulares": [
    {
      "teacherId": 1,
      "name": "Juan Pérez",
      "email": "jperez@universidad.edu",
      "legajo": "D-12345",
      "role": "TITULAR"
    }
  ],
  "auxiliares": [...],
  "items": [...]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `courseId` | Long | ID del curso |
| `periodo` | String | Período |
| `courseName` | String | Nombre completo del curso |
| `turno` | String | Turno |
| `studentCount` | int | Cantidad de estudiantes |
| `titulares` | Array | Docentes titulares |
| `auxiliares` | Array | Docentes auxiliares |
| `items` | Array | Detalle por alumno |

---

### 11.3 POST `/teaching/courses/{courseId}/acts:confirm` - Confirmar acta

Confirma y cierra el acta del curso.

**Parámetros de entrada:**

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|-----------|-----------|------|-----------|-------------|
| `courseId` | Path | Long | Sí | ID del curso |

**Respuesta (201 Created):**
```json
{
  "actaId": 1,
  "courseId": 101,
  "periodo": "2024-1",
  "estado": "CERRADO",
  "windowOpenAt": "2024-07-01T00:00:00",
  "windowCloseAt": "2024-07-15T23:59:59",
  "cerradaEn": "2024-07-10T15:30:00",
  "items": [...]
}
```

---

## 12. AdminProposalController

**Base Path:** `/admin/proposals`

### 12.1 GET `/admin/proposals` - Listar todas las propuestas

Retorna todas las propuestas para el administrador.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
```json
[
  {
    "proposalId": 1,
    "docenteId": 1,
    "subjectId": 10,
    "subjectName": "Programación I",
    "status": "PENDIENTE",
    "createdAt": "2024-03-01T10:00:00",
    "decidedAt": null,
    "active": false
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `proposalId` | Long | ID de la propuesta |
| `docenteId` | Long | ID del docente |
| `subjectId` | Long | ID de la materia |
| `subjectName` | String | Nombre de la materia |
| `status` | EstadoPropuesta | Estado |
| `createdAt` | LocalDateTime | Fecha de creación |
| `decidedAt` | LocalDateTime | Fecha de decisión |
| `active` | boolean | Si está activa |

---

### 12.2 POST `/admin/proposals/decision` - Decidir propuesta

Aprueba o rechaza una propuesta.

**Parámetros de entrada (Body):**
```json
{
  "proposalId": 1,
  "decision": "APROBADA",
  "motivo": "Cumple con los requisitos"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `proposalId` | Long | Sí | ID de la propuesta |
| `decision` | String | Sí | "APROBADA" o "RECHAZADA" |
| `motivo` | String | No | Motivo de la decisión |

**Respuesta (200 OK):**
```json
{
  "proposalId": 1,
  "subjectId": 10,
  "subjectName": "Programación I",
  "status": "APROBADA",
  "createdAt": "2024-03-01T10:00:00",
  "decidedAt": "2024-03-15T10:00:00",
  "active": false
}
```

---

## 13. AdminSubjectController

**Base Path:** `/admin/subjects`

### 13.1 GET `/admin/subjects` - Listar materias

Retorna todas las materias del sistema.

**Parámetros de entrada:** Ninguno

**Respuesta (200 OK):**
```json
[
  {
    "subjectId": 10,
    "subjectName": "Programación I",
    "careerId": 1,
    "careerName": "Ingeniería en Sistemas",
    "careerCode": "ISI"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `subjectId` | Long | ID de la materia |
| `subjectName` | String | Nombre |
| `careerId` | Long | ID de la carrera |
| `careerName` | String | Nombre de la carrera |
| `careerCode` | String | Código de la carrera |

---

## 14. AdminSedeController

**Base Path:** `/admin/sedes`

### 14.1 GET `/admin/sedes` - Listar sedes

Retorna las sedes del sistema.

**Parámetros de entrada (Query):**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `onlyActive` | boolean | No | true | Solo sedes activas |

**Respuesta (200 OK):**
```json
[
  {
    "id": 1,
    "code": "CENTRAL",
    "name": "Campus Central",
    "active": true
  },
  {
    "id": 2,
    "code": "NORTE",
    "name": "Campus Norte",
    "active": true
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Long | ID de la sede |
| `code` | String | Código único |
| `name` | String | Nombre completo |
| `active` | boolean | Si está activa |

---

## 15. AttendanceEventController

**Base Path:** `/api/events/attendance`

> **Nota:** Estos endpoints son internos para el procesamiento de eventos del patrón Outbox.

### 15.1 POST `/api/events/attendance` - Procesar evento individual

Procesa un evento de asistencia individual.

**Parámetros de entrada (Body):**
```json
{
  "eventId": "uuid-string",
  "eventType": "asistencia.registrada",
  "producer": "teachers-portal",
  "schemaVersion": "1.0",
  "occurredAt": "2024-03-15T10:00:00Z",
  "correlationId": "corr-123",
  "attributes": {},
  "payload": {
    "courseId": 101,
    "date": "2024-03-15",
    "items": [...]
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `eventId` | String | UUID del evento |
| `eventType` | String | Tipo de evento |
| `producer` | String | Sistema origen |
| `schemaVersion` | String | Versión del esquema |
| `occurredAt` | OffsetDateTime | Timestamp del evento |
| `correlationId` | String | ID de correlación |
| `attributes` | Map | Atributos adicionales |
| `payload` | Object | Datos del evento |

**Respuesta:** `202 Accepted`

**Errores:** `422 Unprocessable Entity` en caso de error

---

### 15.2 POST `/api/events/attendance/batch` - Procesar lote de eventos

Procesa un lote de eventos de asistencia.

**Parámetros de entrada (Body):** (igual que 15.1)

**Respuesta:** `202 Accepted`

**Errores:** `422 Unprocessable Entity` en caso de error

---

## Resumen de Endpoints

| # | Método | Endpoint | Descripción |
|---|--------|----------|-------------|
| 1 | GET | `/teachers/me` | Perfil del docente |
| 2 | GET | `/teachers/me/courses` | Cursos del docente |
| 3 | GET | `/teachers/me/account/balance` | Saldo de cuenta |
| 4 | PUT/POST | `/teachers/me/account/balance` | Cargar saldo |
| 5 | GET | `/teachers/me/canteen/reservations` | Reservas de comedor |
| 6 | GET | `/teachers/me/canteen/reservations:export` | Exportar reservas CSV |
| 7 | GET | `/teachers/me/store/orders` | Pedidos de tienda |
| 8 | GET | `/teachers/me/store/orders:export` | Exportar pedidos CSV |
| 9 | GET | `/teachers/me/wallet/history` | Historial de billetera |
| 10 | GET | `/teachers/me/wallet/summary` | Resumen de billetera |
| 11 | POST | `/teachers/me/wallet/topup` | Registrar carga de saldo |
| 12 | GET | `/teachers/me/availability` | Listar disponibilidad |
| 13 | POST | `/teachers/me/availability` | Agregar bloque |
| 14 | PATCH | `/teachers/me/availability/{id}` | Modificar bloque |
| 15 | DELETE | `/teachers/me/availability/{id}` | Eliminar bloque |
| 16 | GET | `/teachers/me/proposals` | Listar propuestas |
| 17 | POST | `/teachers/me/proposals` | Crear propuesta |
| 18 | DELETE | `/teachers/me/proposals?subjectId={id}` | Eliminar propuesta |
| 19 | PATCH | `/teachers/me/proposals/{id}/toggle-availability` | Toggle disponibilidad |
| 20 | PUT | `/teachers/me/proposals/{id}` | Actualizar estado |
| 21 | GET | `/teachers/me/calendar` | Calendario |
| 22 | GET | `/teachers/me/calendar/next` | Próxima clase |
| 23 | GET | `/teachers/me/notifications` | Notificaciones |
| 24 | POST | `/teachers/me/notifications/{id}:read` | Marcar como leída |
| 25 | GET | `/teaching/courses/mine` | Mis cursos (detallado) |
| 26 | GET | `/teaching/courses/{id}` | Detalle de curso |
| 27 | GET | `/teaching/courses/{id}/roster` | Lista de alumnos |
| 28 | GET | `/teaching/courses/{id}/assessments` | Evaluaciones del curso |
| 29 | POST | `/teaching/courses/{id}/assessments` | Crear evaluación |
| 30 | GET | `/teaching/assessments/{id}/grades` | Calificaciones de evaluación |
| 31 | PUT | `/teaching/assessments/{id}/grades` | Guardar calificaciones |
| 32 | PUT | `/teaching/assessments/{id}/grades:publish` | Guardar y publicar |
| 33 | POST | `/teaching/assessments/{id}:publish` | Publicar calificaciones |
| 34 | GET | `/teaching/courses/{id}/grades` | Todas las calificaciones |
| 35 | GET | `/teaching/courses/{id}/attendance/{date}` | Asistencia de fecha |
| 36 | PUT | `/teaching/courses/{id}/attendance/{date}` | Guardar asistencia |
| 37 | GET | `/teaching/courses/{id}/attendance` | Resumen de asistencia |
| 38 | GET | `/teaching/courses/{id}/attendance/records` | Todos los registros |
| 39 | GET | `/teaching/courses/{id}/acts` | Listar actas |
| 40 | GET | `/teaching/courses/{id}/acts:preview` | Vista previa acta |
| 41 | POST | `/teaching/courses/{id}/acts:confirm` | Confirmar acta |
| 42 | GET | `/admin/proposals` | Listar todas las propuestas |
| 43 | POST | `/admin/proposals/decision` | Decidir propuesta |
| 44 | GET | `/admin/subjects` | Listar materias |
| 45 | GET | `/admin/sedes` | Listar sedes |
| 46 | POST | `/api/events/attendance` | Evento de asistencia |
| 47 | POST | `/api/events/attendance/batch` | Lote de eventos |

---

## Notas Adicionales

### Autenticación

En modo desarrollo (`portal.docente.jwt.mock-mode=true`), se pueden usar los headers:
- `X-Teacher-Id`: ID del docente
- `X-Teacher-Roles`: Roles del docente

### Manejo de Errores

Los errores siguen el formato Problem Details (RFC 7807):
```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Mensaje de error específico",
  "instance": "/path/del/request"
}
```

### Códigos HTTP Comunes

| Código | Significado |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 202 | Accepted - Aceptado para procesamiento |
| 204 | No Content - Sin contenido (operación exitosa) |
| 400 | Bad Request - Error de validación |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Error de procesamiento |
| 500 | Internal Server Error - Error del servidor |

---

*Documento generado el: 2024-12-03*  
*Última actualización: 2025-06-03 - studentId cambiado de Long a UUID String*  
*Versión del API: 1.1*


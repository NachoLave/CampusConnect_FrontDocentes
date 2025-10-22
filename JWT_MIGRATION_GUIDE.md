# 🔄 Migración de Mock a JWT - Guía Completa

## 📋 Cambios Necesarios (Muy Simples)

### 1. **Cambio Principal - Solo 1 línea**
```typescript
// lib/config/app.ts
export const APP_CONFIG = {
  USE_MOCK_AUTH: false,  // ← Cambiar de true a false
  USE_MOCK_DATA: false,  // Ya está bien
  // Los demás campos se ignorarán automáticamente
}
```

### 2. **Headers Automáticos**
El servicio ya está preparado para usar JWT automáticamente:

**Modo Mock (actual):**
```http
X-Teacher-Id: 1010
X-Teacher-Roles: TITULAR
```

**Modo JWT (automático):**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Flujo de Autenticación Real

### **Login**
```typescript
// Cuando el usuario haga login
const response = await authService.login({
  email: 'docente@campus.edu',
  password: 'password123'
})

// El JWT se guarda automáticamente en localStorage
// Y se usa en todas las peticiones siguientes
```

### **Peticiones Automáticas**
```typescript
// Todas las peticiones usarán automáticamente el JWT
const reservations = await CanteenService.getReservations()
// Headers: Authorization: Bearer <jwt-token>
```

### **Refresh Automático**
```typescript
// Si el token expira, se refresca automáticamente
// Si falla el refresh, se hace logout automático
```

## 🔧 Estructura del JWT Esperado

El backend debería devolver un JWT con esta estructura:

```json
{
  "sub": "1010",           // Teacher ID
  "email": "docente@campus.edu",
  "name": "Dr. Juan Pérez",
  "roles": ["TITULAR"],
  "department": "Ingeniería",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## 🚀 Ventajas de la Estructura Actual

✅ **Cambio mínimo**: Solo 1 línea de código
✅ **Backward compatible**: Funciona con mock y JWT
✅ **Automático**: No necesitas cambiar cada servicio
✅ **Seguro**: Manejo automático de refresh y logout
✅ **Persistente**: Sesión se mantiene entre recargas

## 📝 Ejemplo de Uso

```typescript
// 1. Login (una sola vez)
await authService.login({ email, password })

// 2. Usar servicios (automático)
const reservations = await CanteenService.getReservations()
const courses = await CoursesService.getCourses()
const wallet = await WalletService.getBalance()

// 3. Logout (cuando sea necesario)
authService.logout()
```

## 🔍 Debugging

Para ver qué headers se están enviando:
```typescript
// En la consola del navegador verás:
// 🔗 URL de la petición: https://api.com/teachers/me/canteen/reservations
// 📋 Headers de la petición: { Authorization: "Bearer ...", ... }
```

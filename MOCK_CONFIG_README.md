# 🔧 Configuración de Modo Mock vs Real

## 📋 Resumen

El frontend está configurado para usar **datos reales del backend** con **autenticación mock** mientras esperamos que el módulo de autenticación esté disponible.

## ⚙️ Configuración Actual

### Archivo: `lib/config/app.ts`

```typescript
export const APP_CONFIG = {
  // Cambiar a false cuando el módulo de autenticación esté disponible
  USE_MOCK_AUTH: true,
  
  // Cambiar a false cuando quieras usar datos reales del backend
  USE_MOCK_DATA: false, // ✅ CONFIGURADO PARA USAR DATOS REALES
  
  // ID del docente para modo mock
  MOCK_TEACHER_ID: '1010', // ✅ CONFIGURADO PARA DOCENTE 1010
  
  // Email del docente para modo mock
  MOCK_TEACHER_EMAIL: 'docente@campus.com',
  
  // Nombre del docente para modo mock
  MOCK_TEACHER_NAME: 'Docente Test',
  
  // Roles del docente para modo mock
  MOCK_TEACHER_ROLES: 'TEACHER'
}
```

## 🎯 Estado Actual

- ✅ **Docente 1010** configurado
- ✅ **Datos reales** del backend habilitados
- ✅ **Autenticación mock** funcionando
- ✅ **Fallback** a datos mock si falla conexión real
- ⏳ **Esperando** que Railway funcione correctamente

## 🔄 Indicadores Visuales

Verás estos badges en la pantalla:
- 🔧 **Auth Mock (Docente 1010)** - Indica que la autenticación es mock
- 🌐 **Datos Reales del Backend** - Indica que está usando datos reales

## 💰 Balance Esperado

El endpoint `/teachers/me/account/balance` debería devolver:
```json
{
  "balance": 12500.50
}
```

**Balance esperado para docente 1010: $12,500.50**

## 🚨 Problema Actual

El backend en Railway está devolviendo error 500. Esto indica que:

1. **El modo mock no está habilitado** en Railway
2. **Faltan variables de entorno** en Railway
3. **Hay un problema con la base de datos** en Railway

## 🔧 Para solucionar en Railway:

1. **Verificar variables de entorno:**
   ```
   PORTAL_DOCENTE_JWT_MOCK_MODE=true
   PORTAL_DOCENTE_JWT_HMAC_SECRET=campusconnect-secret
   PORTAL_DOCENTE_TIME_ZONE=America/Argentina/Buenos_Aires
   ```

2. **Revisar logs de Railway** para ver el error específico

3. **Verificar que PostgreSQL esté funcionando** correctamente

## 🚀 Una vez solucionado Railway:

El frontend ya está configurado para:
- ✅ Usar datos reales del backend
- ✅ Mostrar el balance real del docente 1010
- ✅ Mantener el mismo formato visual
- ✅ Hacer fallback a datos mock si es necesario

## 📝 Próximos pasos

1. **Solucionar** el error 500 en Railway
2. **Verificar** que el balance se muestre correctamente
3. **Cambiar** `USE_MOCK_AUTH` a `false` cuando llegue el módulo de auth

# Sistema de Cache y Manejo de Errores - Documentación Final

## 📋 Índice

1. [Sistema de Cache](#sistema-de-cache)
   - [Arquitectura](#arquitectura)
   - [Implementación](#implementación)
   - [Páginas con Cache](#páginas-con-cache)
   - [Configuración y TTL](#configuración-y-ttl)
   - [Flujo de Funcionamiento](#flujo-de-funcionamiento)
2. [Sistema de Manejo de Errores](#sistema-de-manejo-de-errores)
   - [Resumen](#resumen)
   - [Características Principales](#características-principales)

---

## 🗄️ Sistema de Cache

### Arquitectura

El sistema de cache utiliza **localStorage** del navegador para almacenar datos temporalmente, permitiendo mostrar información instantáneamente mientras se actualiza en segundo plano.

**Componente Principal**: `lib/utils/cache.ts` - Clase `LocalStorageCache`

### Implementación

#### 1. **Clase LocalStorageCache** (`lib/utils/cache.ts`)

Sistema genérico de cache con Time To Live (TTL) configurable:

```typescript
interface CachedData<T> {
  data: T
  timestamp: number
  ttl: number // Time to live en milisegundos
}
```

**Métodos principales:**
- `get<T>(key: string)`: Obtiene datos del cache si no han expirado
- `set<T>(key: string, data: T, ttl: number)`: Guarda datos con TTL específico
- `remove(key: string)`: Elimina un item específico
- `clearExpired()`: Limpia todos los caches expirados
- `clearAll()`: Limpia todo el cache

**Características:**
- Prefijo automático: `dashboard_cache_` para todas las claves
- Validación de expiración automática
- Limpieza automática de caches expirados al cargar el módulo
- Manejo de errores (localStorage lleno, etc.)

#### 2. **Patrón de Implementación en Hooks**

Todos los hooks siguen el mismo patrón:

```typescript
const fetchData = useCallback(async () => {
  // 1. Intentar cargar desde cache primero
  const cachedData = LocalStorageCache.get<DataType>(CACHE_KEY)
  
  if (cachedData) {
    // 2. Mostrar datos cacheados inmediatamente
    setData(cachedData)
    setLoadingState({ isLoading: false, error: null })
  } else {
    // 3. Si no hay cache, mostrar loading
    setLoadingState({ isLoading: true, error: null })
  }

  // 4. SIEMPRE hacer fetch para actualizar en background
  try {
    const response = await Service.getData()
    
    if (response.success) {
      // 5. Actualizar estado y cache
      setData(response.data)
      LocalStorageCache.set(CACHE_KEY, response.data, CACHE_TTL)
      setLoadingState({ isLoading: false, error: null })
    }
  } catch (error) {
    // 6. Manejo de errores (solo si no hay cache)
    if (!cachedData) {
      setLoadingState({ isLoading: false, error: errorMessage })
    }
  }
}, [])
```

### Páginas con Cache

#### 1. **Dashboard** (`/`)

**Hooks con cache:**
- `useWeeklyCalendar`: Eventos del calendario
- `useNextClass`: Próxima clase
- `useBalance`: Saldo de billetera
- `useCanteenReservations`: Reservas de comedor

**TTL:**
- Calendario: **3 minutos**
- Próxima clase: **2 minutos**
- Billetera: **1 minuto**
- Comedor: **2 minutos**

#### 2. **Calendario** (`/calendario`)

**Implementación:**
- Cache de eventos del año completo
- Clave: `calendar_events_YYYY-MM-DD_YYYY-MM-DD`
- TTL: **3 minutos**

**Código:**
```typescript
const cacheKey = `calendar_events_${fromIso}_${toIso}`
const cachedData = LocalStorageCache.get(cacheKey)

if (cachedData) {
  setBackendEvents(cachedData.events)
  setLoadingEvents(false)
}

// Siempre hacer fetch en background
const res = await CalendarService.getWeeklyEvents(fromIso, toIso)
LocalStorageCache.set(cacheKey, { events: res.data, errors: res.errors }, 3 * 60 * 1000)
```

#### 3. **Comedor** (`/comedor`)

**Hook:** `useCanteenReservations`
- TTL: **2 minutos**
- Cache de todas las reservas del usuario

#### 4. **Tienda** (`/tienda`)

**Hook:** `useStoreOrders`
- TTL: **3 minutos**
- Cache de órdenes de tienda

### Configuración y TTL

| Página/Componente | Hook | TTL | Clave de Cache |
|------------------|------|-----|----------------|
| Dashboard - Calendario | `useWeeklyCalendar` | 3 min | `calendar_events_{startDate}_{endDate}` |
| Dashboard - Próxima Clase | `useNextClass` | 2 min | `next_class` |
| Dashboard - Billetera | `useBalance` | 1 min | `wallet_balance` |
| Dashboard - Comedor | `useCanteenReservations` | 2 min | `canteen_reservations` |
| Calendario | `CalendarService.getWeeklyEvents` | 3 min | `calendar_events_{from}_{to}` |
| Comedor | `useCanteenReservations` | 2 min | `canteen_reservations` |
| Tienda | `useStoreOrders` | 3 min | `store_orders` |

**Nota:** Todos los TTL están en milisegundos (ej: `3 * 60 * 1000` = 3 minutos)

### Flujo de Funcionamiento

```
┌─────────────────────────────────────────────────────────┐
│ Usuario carga página                                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Hook intenta cargar desde cache                     │
│    LocalStorageCache.get(key)                          │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────────┐
│ Cache válido │    │ Sin cache        │
└──────┬───────┘    └────────┬─────────┘
       │                     │
       │                     ▼
       │            ┌──────────────────┐
       │            │ Mostrar loading│
       │            └────────┬─────────┘
       │                     │
       ▼                     │
┌─────────────────────────────┐
│ 2. Mostrar datos cacheados   │
│    setData(cachedData)       │
│    isLoading = false         │
└──────────────┬───────────────┘
               │
               │ (En paralelo)
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Hacer fetch al API en background     │
│    await Service.getData()              │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐ ┌──────────────┐
│ Éxito        │ │ Error        │
└──────┬───────┘ └──────┬───────┘
       │                │
       ▼                │
┌───────────────────────┐
│ 4. Actualizar estado   │
│    setData(newData)    │
│                        │
│ 5. Actualizar cache    │
│    LocalStorageCache   │
│    .set(key, data, TTL)│
└───────────────────────┘
```

**Ventajas:**
- ✅ **Carga instantánea**: Los usuarios ven datos inmediatamente
- ✅ **Actualización en background**: Los datos siempre se actualizan
- ✅ **No bloqueante**: Si el API falla, se muestran datos cacheados
- ✅ **Experiencia fluida**: Sin pantallas de carga largas

### Detalles Técnicos

#### Limpieza Automática

El sistema limpia automáticamente caches expirados:
- Al cargar el módulo `cache.ts`
- Al intentar escribir cuando localStorage está lleno

#### Validación de Expiración

```typescript
const now = Date.now()
if (now - parsed.timestamp > parsed.ttl) {
  // Cache expirado, eliminarlo
  localStorage.removeItem(key)
  return null
}
```

#### Manejo de Errores

- Si `localStorage` está lleno, intenta limpiar caches expirados
- Si falla la lectura, retorna `null` (sin bloquear)
- Si falla la escritura, registra warning pero no bloquea

---

## ⚠️ Sistema de Manejo de Errores

### Resumen

Sistema centralizado que captura y muestra errores de endpoints mediante badges temporales con información detallada: **módulo**, **endpoint**, **método HTTP** y **código de error**.

### Componentes Principales

1. **Error Tracker** (`lib/utils/error-tracker.ts`)
   - Registro centralizado de errores
   - Auto-eliminación después de 10 segundos

2. **Error Badge** (`components/ui/error-badge.tsx`)
   - Badge temporal con información del error
   - Colores según código HTTP (rojo 5xx, naranja 4xx, amarillo otros)

3. **Hook de Notificaciones** (`lib/hooks/useErrorNotifications.ts`)
   - Suscripción a cambios en errores
   - Funciones para cerrar/limpiar errores

4. **Visualización Global** (`components/layout/main-layout.tsx`)
   - Badges visibles en todas las páginas (esquina superior derecha)
   - Máximo 3 errores visibles simultáneamente

### Características Principales

✅ **No bloqueante**: La aplicación sigue funcionando aunque fallen endpoints  
✅ **Informativo**: Muestra módulo, endpoint, método y código de error  
✅ **Temporal**: Los badges se auto-eliminan después de 10 segundos  
✅ **Manual**: Los usuarios pueden cerrar badges con botón X  
✅ **Automático**: Se integra en todos los servicios sin cambios adicionales  
✅ **Global**: Visible en todas las páginas automáticamente  

### Integración

**API Client** (`lib/utils/api.ts`):
- Todos los métodos HTTP (GET, POST, PUT, PATCH, DELETE) registran errores automáticamente
- Captura errores HTTP (4xx, 5xx), errores de red y excepciones

**Proxies de Next.js**:
- `/api/teachers/me/notifications` (GET)
- `/api/teachers/me/notifications/[id]/read` (PATCH)
- `/api/events` (GET)
- `/api/canteen/reservations` (GET)
- `/api/clases-individuales/curso/[cursoUUID]` (GET)

### Información Mostrada

Cada badge muestra:
- **Módulo**: "Notificaciones", "Comedor", "Eventos Académicos", etc.
- **Método y Endpoint**: "GET /api/teachers/me/notifications"
- **Código de error**: "Error 500", "Error 404", etc.
- **Mensaje**: Mensaje descriptivo del servidor

### Ejemplo Visual

```
┌─────────────────────────────────────────┐
│ ⚠️ Notificaciones              [X]      │
│ GET /api/teachers/me/notifications       │
│ Error 500                                │
│ Internal Server Error                    │
└─────────────────────────────────────────┘
```

---

## 📊 Resumen Comparativo

| Aspecto | Cache | Errores |
|---------|-------|---------|
| **Tecnología** | localStorage | In-memory (Map) |
| **Persistencia** | Persiste entre sesiones | Solo durante sesión |
| **TTL** | 1-3 minutos | 10 segundos |
| **Actualización** | Background fetch | Auto-eliminación |
| **Visibilidad** | Transparente (datos) | Badges visibles |
| **Propósito** | Mejorar velocidad de carga | Informar sobre fallos |

---

## 🎯 Beneficios para la Entrega Final

### Cache
1. **Performance**: Carga instantánea de datos
2. **Experiencia de usuario**: Sin esperas largas
3. **Resiliencia**: Funciona aunque el API sea lento
4. **Eficiencia**: Reduce llamadas innecesarias al API

### Errores
1. **Visibilidad**: Sabemos exactamente qué falló
2. **Debugging**: Información detallada para identificar problemas
3. **Profesionalismo**: Manejo de errores robusto y visible
4. **Trazabilidad**: Todos los errores quedan registrados con timestamp

---

## 📝 Notas Finales

- El cache se limpia automáticamente cuando expira
- Los errores se eliminan automáticamente después de 10 segundos
- Ambos sistemas funcionan de forma independiente y no bloqueante
- El cache mejora la experiencia del usuario
- El sistema de errores facilita el debugging y la integración con otros módulos

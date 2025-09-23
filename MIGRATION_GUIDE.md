# Guía de Migración - Reestructuración del Frontend

## 📋 Resumen de Cambios

Este proyecto ha sido reestructurado para facilitar la conexión con el backend y seguir mejores prácticas de desarrollo. Los cambios principales incluyen:

### 🗂️ Nueva Estructura de Carpetas

```
lib/
├── api/
│   └── services/          # Servicios para comunicación con API
│       ├── courses.ts     # Servicio de cursos
│       ├── calendar.ts    # Servicio de calendario
│       ├── wallet.ts      # Servicio de billetera
│       ├── dashboard.ts   # Servicio de dashboard
│       └── index.ts       # Exportaciones centralizadas
├── config/
│   └── api.ts            # Configuración de endpoints y URLs
├── data/                 # Datos mockeados en JSON
│   ├── courses.json
│   ├── calendar.json
│   ├── wallet.json
│   └── carousel.json
├── hooks/                # Hooks personalizados
│   ├── useCourses.ts
│   ├── useWallet.ts
│   ├── useCalendar.ts
│   ├── useDashboard.ts
│   └── index.ts
├── types/
│   └── index.ts          # Tipos TypeScript centralizados
└── utils/
    ├── api.ts            # Cliente HTTP
    ├── error-handler.ts  # Manejo de errores
    └── loading.ts        # Estados de carga
```

## 🔄 Migración de Componentes

### Antes (Datos hardcodeados)
```tsx
const courses = [
  { id: 1, title: "Curso 1", ... },
  // más datos hardcodeados
]

export function CoursesGrid() {
  const [courses, setCourses] = useState(hardcodedCourses)
  // lógica del componente
}
```

### Después (Usando servicios y hooks)
```tsx
import { useCourses } from '@/lib/hooks'
import { LoadingStates } from '@/lib/utils/loading'

export function CoursesGrid() {
  const { courses, isLoading, error, refetch } = useCourses()
  
  if (isLoading) return <LoadingStates.CourseCardSkeleton />
  if (error) return <div>Error: {error}</div>
  
  return (
    // renderizar cursos
  )
}
```

## 🛠️ Servicios API

### Estructura de Servicios
Cada módulo tiene su propio servicio con métodos específicos:

```tsx
// lib/api/services/courses.ts
export class CoursesService {
  static async getCourses(): Promise<ApiResponse<Course[]>> {
    // Lógica para obtener cursos (mock o real)
  }
  
  static async getCourseById(id: number): Promise<ApiResponse<Course>> {
    // Lógica para obtener curso específico
  }
}
```

### Configuración de Entornos
```tsx
// lib/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
}
```

## 🎣 Hooks Personalizados

### Hook de Cursos
```tsx
const { courses, isLoading, error, refetch } = useCourses()
const { course, isLoading, error } = useCourse(courseId)
const { sedes, days } = useCourseOptions()
```

### Hook de Billetera
```tsx
const { walletInfo, transactions, isLoading, error } = useWallet()
const { balance } = useBalance()
const { loadBalance, makePayment } = useWalletActions()
```

### Hook de Calendario
```tsx
const { calendarData, isLoading, error } = useCalendar()
const { events } = useEventsByDate(date)
const { nextClass } = useNextClass()
```

## 🔗 Conexión con Backend

### Modo Desarrollo (Mock)
Por defecto, la aplicación usa datos mockeados desde archivos JSON en `lib/data/`.

### Modo Producción (API Real)
Para conectar con el backend real:

1. **Configurar variables de entorno:**
```env
NEXT_PUBLIC_API_URL=https://tu-backend.com/api
NEXT_PUBLIC_USE_MOCK_DATA=false
```

2. **Los servicios automáticamente cambiarán** de datos mock a llamadas HTTP reales.

## 🎨 Estados de Carga

### Componentes Skeleton
```tsx
import { LoadingStates } from '@/lib/utils/loading'

// Diferentes tipos de skeleton
<LoadingStates.CourseCardSkeleton />
<LoadingStates.TransactionSkeleton />
<LoadingStates.EventSkeleton />
<LoadingStates.CarouselSkeleton />
```

### Renderizado Condicional
```tsx
import { renderWithState } from '@/lib/utils/loading'

return renderWithState({
  isLoading,
  error,
  data: courses,
  loadingComponent: <LoadingStates.CourseCardSkeleton />,
  successComponent: (courses) => <CoursesGrid courses={courses} />
})
```

## 🚨 Manejo de Errores

### Hook de Manejo de Errores
```tsx
import { useErrorHandler } from '@/lib/utils/error-handler'

const { handleError } = useErrorHandler()

try {
  await someAsyncOperation()
} catch (error) {
  const friendlyMessage = handleError(error)
  // Mostrar mensaje amigable al usuario
}
```

## 📝 Tipos TypeScript

Todos los tipos están centralizados en `lib/types/index.ts`:

```tsx
import type { Course, Teacher, Transaction, WalletInfo } from '@/lib/types'
```

## 🔄 Migración Paso a Paso

### 1. Componentes Ya Migrados
- ✅ `components/cursos/courses-grid.tsx`
- ✅ `app/page.tsx` (Dashboard)
- ✅ `app/billetera/page.tsx`

### 2. Próximos Pasos para Migrar Otros Componentes

Para migrar un componente existente:

1. **Identificar datos hardcodeados**
2. **Mover datos a archivos JSON** en `lib/data/`
3. **Crear o usar servicio existente** en `lib/api/services/`
4. **Crear hook personalizado** si no existe
5. **Refactorizar componente** para usar el hook
6. **Agregar estados de carga y error**

### Ejemplo de Migración:
```tsx
// ANTES
const data = [hardcoded data]

// DESPUÉS
const { data, isLoading, error } = useCustomHook()

if (isLoading) return <SkeletonComponent />
if (error) return <ErrorComponent error={error} />
return <SuccessComponent data={data} />
```

## 🚀 Beneficios de la Nueva Estructura

1. **Separación de responsabilidades** - Datos, lógica y UI separados
2. **Reutilización** - Hooks y servicios reutilizables
3. **Fácil testing** - Servicios y hooks fáciles de testear
4. **Migración gradual** - Cambio de mock a API real sin tocar componentes
5. **Mejor UX** - Estados de carga y error consistentes
6. **Mantenibilidad** - Código más organizado y fácil de mantener

## 🔧 Comandos Útiles

```bash
# Desarrollo con datos mock
npm run dev

# Para usar API real, configurar .env.local:
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=https://tu-backend.com/api
```

## 📞 Próximos Pasos

1. **Testear la funcionalidad actual** - Verificar que todo funciona como antes
2. **Configurar backend** - Cuando esté listo, cambiar las variables de entorno
3. **Migrar componentes restantes** - Aplicar el mismo patrón a otros componentes
4. **Agregar tests** - Crear tests para servicios y hooks
5. **Optimizaciones** - Cache, paginación, etc.

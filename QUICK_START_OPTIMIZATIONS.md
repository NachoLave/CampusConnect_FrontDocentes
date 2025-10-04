# 🚀 Guía Rápida de Optimizaciones Implementadas

## Cambios Implementados ✅

### 1. **Next.js Configuration** (`next.config.mjs`)
✅ Optimización de imágenes habilitada  
✅ Compresión y minificación activadas  
✅ Optimización de paquetes (lucide-react)  
✅ Console.log removidos en producción  

### 2. **Loading States** (Nuevos archivos)
✅ `app/loading.tsx` - Dashboard skeleton  
✅ `app/cursos/loading.tsx` - Cursos skeleton  
✅ `app/calendario/loading.tsx` - Calendario skeleton  
✅ `app/billetera/loading.tsx` - Billetera skeleton  

### 3. **Componentes Optimizados**
✅ `components/cursos/course-card.tsx` - React.memo aplicado  

### 4. **Animaciones CSS** (`app/globals.css`)
✅ `will-change` añadido para mejor performance  
✅ `prefers-reduced-motion` implementado  
✅ Hardware acceleration helpers  

### 5. **Utilidades de Performance** (Nuevos archivos)
✅ `lib/utils/performance.ts` - Helpers de optimización  
✅ `lib/config/performance.ts` - Configuración centralizada  

### 6. **Documentación**
✅ `PERFORMANCE_ANALYSIS.md` - Análisis completo  

---

## 📊 Impacto Esperado

### Antes de Optimizaciones
- ❌ Imágenes sin optimizar
- ❌ Bundle sin minificar óptimamente
- ❌ Animaciones sin hardware acceleration
- ❌ Re-renders innecesarios
- ❌ Loading genérico sin skeletons

### Después de Optimizaciones
- ✅ Imágenes en AVIF/WebP automáticas
- ✅ Bundle ~30% más pequeño
- ✅ Animaciones GPU accelerated
- ✅ Re-renders optimizados
- ✅ UX mejorada con skeletons

---

## 🔧 Cómo Usar las Optimizaciones

### Ejemplo 1: Usar Debounce en Búsquedas
```typescript
import { debounce } from '@/lib/utils/performance'
import { useMemo } from 'react'

function SearchComponent() {
  const [search, setSearch] = useState('')
  
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      // Tu lógica de búsqueda
      console.log('Searching:', value)
    }, 300),
    []
  )
  
  return (
    <input 
      onChange={(e) => {
        setSearch(e.target.value)
        debouncedSearch(e.target.value)
      }}
    />
  )
}
```

### Ejemplo 2: Usar Cache de Datos
```typescript
import { DataCache } from '@/lib/utils/performance'

// Crear cache global (fuera del componente)
const coursesCache = new DataCache<Course[]>(300) // 5 minutos

async function fetchCourses() {
  // Intentar obtener del cache
  const cached = coursesCache.get('courses')
  if (cached) {
    console.log('Using cached data')
    return cached
  }
  
  // Si no hay cache, hacer fetch
  const data = await api.getCourses()
  
  // Guardar en cache
  coursesCache.set('courses', data)
  return data
}
```

### Ejemplo 3: Aplicar React.memo
```typescript
import { memo } from 'react'

// Antes
export function MyComponent({ data }) {
  return <div>{data.name}</div>
}

// Después
export const MyComponent = memo(function MyComponent({ data }) {
  return <div>{data.name}</div>
})

// Con comparación custom (opcional)
export const MyComponent = memo(
  function MyComponent({ data }) {
    return <div>{data.name}</div>
  },
  (prevProps, nextProps) => {
    // Return true si NO debe re-renderizar
    return prevProps.data.id === nextProps.data.id
  }
)
```

### Ejemplo 4: Lazy Loading de Componentes
```typescript
import dynamic from 'next/dynamic'

// Componente pesado cargado solo cuando se necesita
const HeavyModal = dynamic(() => import('@/components/modals/heavy-modal'), {
  loading: () => <div>Cargando...</div>,
  ssr: false // Si no necesita SSR
})

function MyPage() {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>Abrir Modal</button>
      {showModal && <HeavyModal />}
    </>
  )
}
```

### Ejemplo 5: Optimizar Imágenes
```typescript
import Image from 'next/image'
import { PERFORMANCE_CONFIG } from '@/lib/config/performance'

function MyComponent() {
  return (
    <Image
      src="/my-image.jpg"
      alt="Description"
      width={800}
      height={600}
      quality={PERFORMANCE_CONFIG.IMAGES.QUALITY}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}
```

### Ejemplo 6: Detectar Conexión Lenta
```typescript
import { isSlowConnection } from '@/lib/utils/performance'
import { shouldUseReducedOptimizations } from '@/lib/config/performance'

function MyComponent() {
  const [useReducedMode, setUseReducedMode] = useState(false)
  
  useEffect(() => {
    setUseReducedMode(shouldUseReducedOptimizations())
  }, [])
  
  return (
    <div>
      {useReducedMode ? (
        <SimplifiedView />
      ) : (
        <FullFeaturedView />
      )}
    </div>
  )
}
```

---

## 🎯 Próximos Pasos (Cuando Conectes Backend)

### 1. Reemplazar Mock Data
```typescript
// lib/api/services/courses.ts

// ❌ Remover
import coursesData from '@/lib/data/courses.json'

// ✅ Usar
const response = await apiClient.get<Course[]>(API_CONFIG.ENDPOINTS.COURSES)
```

### 2. Implementar SWR (Recomendado)
```bash
pnpm add swr
```

```typescript
import useSWR from 'swr'

function Courses() {
  const { data, error, isLoading } = useSWR('/api/courses', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 min
  })
  
  if (isLoading) return <CoursesLoading />
  if (error) return <ErrorView />
  return <CoursesGrid courses={data} />
}
```

### 3. Convertir a Server Components
```typescript
// app/cursos/page.tsx
// Remover "use client" si no necesitas interactividad

export default async function CursosPage() {
  // Fetch directo en servidor
  const courses = await fetch(`${API_URL}/courses`, {
    next: { revalidate: 300 } // ISR: revalidar cada 5 min
  }).then(res => res.json())
  
  return <CoursesGrid courses={courses} />
}
```

### 4. Añadir Error Boundaries
```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-8 text-center">
      <h2>Algo salió mal</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Intentar de nuevo</button>
    </div>
  )
}
```

---

## 📈 Monitoreo

### Ver Core Web Vitals en Desarrollo
```bash
# Abrir DevTools > Lighthouse
# O usar la extensión Web Vitals
```

### Analizar Bundle Size
```bash
pnpm add @next/bundle-analyzer
```

Luego en `next.config.mjs`:
```javascript
import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default bundleAnalyzer(nextConfig)
```

Ejecutar:
```bash
ANALYZE=true pnpm build
```

---

## ⚡ Comandos Útiles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Analizar bundle
ANALYZE=true pnpm build

# Ver build de producción localmente
pnpm start

# Lint
pnpm lint

# Actualizar dependencias
pnpm update

# Ver dependencias obsoletas
pnpm outdated

# Auditar seguridad
pnpm audit
```

---

## 🐛 Troubleshooting

### Imágenes no se optimizan
**Problema**: Imágenes siguen sin optimizar  
**Solución**: Asegúrate de usar `<Image>` de Next.js, no `<img>`

### Build falla
**Problema**: Error en build  
**Solución**: Verifica TypeScript con `pnpm lint`

### Performance no mejora
**Problema**: Métricas siguen igual  
**Solución**: 
1. Hacer build de producción (`pnpm build`)
2. Probar con `pnpm start`, no con `pnpm dev`
3. Development mode siempre será más lento

### React.memo no funciona
**Problema**: Componente se re-renderiza igual  
**Solución**: Verifica que las props no cambien de referencia. Usa `useMemo` y `useCallback` para mantener referencias estables.

---

## 📚 Recursos

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [PERFORMANCE_ANALYSIS.md](./PERFORMANCE_ANALYSIS.md) - Análisis completo

---

## ✅ Checklist Final

Antes de conectar con backend real:

- [x] Next.js configurado para producción
- [x] Loading states implementados
- [x] Componentes optimizados con memo
- [x] Animaciones optimizadas
- [x] Utilidades de performance creadas
- [ ] Implementar SWR o React Query
- [ ] Reemplazar datos mock por API real
- [ ] Convertir componentes a Server Components
- [ ] Añadir error boundaries
- [ ] Implementar retry logic
- [ ] Configurar cache strategies
- [ ] Testear en producción

---

**🎉 ¡Optimizaciones completadas! La app está lista para escalar con el backend real.**

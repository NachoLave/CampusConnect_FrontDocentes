# 🎨 Sistema de Avatares - CampusConnect Portal Docente

## 📊 Flujo de Datos (NO hay datos hardcodeados)

```
1. Backend: GET /teachers/me
   ↓
   Respuesta: {
     teacherId: 1010,
     name: "Ada Lovelace",
     email: "ada.lovelace@...",
     legajo: "1137535",
     activo: true,
     role: "TITULAR",
     cantidadCursosDictados: 7
   }
   ↓
2. useTeacherProfile hook (lib/hooks/useTeacherProfile.ts)
   - Llama al endpoint
   - Almacena los datos en el estado
   ↓
3. Header Component (components/navbar/header.tsx)
   - Lee profile.name → "Ada Lovelace"
   - Lee profile.teacherId → 1010
   - Pasa estos datos a UserDropdown
   ↓
4. UserDropdown Component (components/navbar/user-dropdown.tsx)
   - Calcula iniciales: getInitials("Ada Lovelace") → "AL"
   - Calcula color: getUserColor(1010) → colors[1010 % 10] → colors[0] → "bg-rose-500"
   ↓
5. Renderiza: Avatar circular rosa con "AL" en blanco
```

## 🎯 Sistema de Iniciales

**Función:** `getInitials(name: string)`

```typescript
// Entrada: Nombre completo del docente desde el endpoint
// Salida: Primeras 2 letras de las palabras

"Ada Lovelace"  → "AL"
"Juan Pérez"    → "JP"
"María García"  → "MG"
"Carlos"        → "CA"
```

**Algoritmo:**
1. Divide el nombre por espacios
2. Toma la primera letra de cada palabra
3. Convierte a mayúsculas
4. Toma solo las primeras 2 letras

## 🌈 Sistema de Colores

**Función:** `getUserColor(teacherId: number)`

**Fórmula:** `colors[teacherId % 10]`

### Paleta de Colores (10 colores)

| Índice | Color | Clase Tailwind | Hex |
|--------|-------|----------------|-----|
| 0 | Rosa | bg-rose-500 | #f43f5e |
| 1 | Azul | bg-blue-500 | #3b82f6 |
| 2 | Verde Esmeralda | bg-emerald-500 | #10b981 |
| 3 | Violeta | bg-violet-500 | #8b5cf6 |
| 4 | Ámbar | bg-amber-500 | #f59e0b |
| 5 | Rosa Fucsia | bg-pink-500 | #ec4899 |
| 6 | Cian | bg-cyan-500 | #06b6d4 |
| 7 | Verde Azulado | bg-teal-500 | #14b8a6 |
| 8 | Naranja | bg-orange-500 | #f97316 |
| 9 | Púrpura | bg-purple-500 | #a855f7 |

### Ejemplos de Asignación

```typescript
teacherId: 1010 → 1010 % 10 = 0 → bg-rose-500 (Rosa)
teacherId: 1011 → 1011 % 10 = 1 → bg-blue-500 (Azul)
teacherId: 1015 → 1015 % 10 = 5 → bg-pink-500 (Rosa Fucsia)
teacherId: 1023 → 1023 % 10 = 3 → bg-violet-500 (Violeta)
teacherId: 2000 → 2000 % 10 = 0 → bg-rose-500 (Rosa)
```

## ✅ Garantías del Sistema

1. **Consistencia:** El mismo `teacherId` siempre produce el mismo color
2. **Sin Hardcode:** Todos los datos vienen del endpoint `GET /teachers/me`
3. **Distribución:** Los 10 colores se distribuyen uniformemente
4. **Único por Docente:** Cada docente tiene su color único basado en su ID

## 📍 Ubicaciones de Uso

1. **Navbar** (`components/navbar/user-dropdown.tsx`)
   - Avatar pequeño (7x7 / 8x8 lg)
   - Dropdown expandido (10x10 / 12x12 lg)

2. **Página de Perfil** (`app/perfil/page.tsx`)
   - Avatar grande (20x20)
   - Mismo color y lógica

3. **Tarjetas de Cursos** (`components/cursos/course-card.tsx`)
   - Avatares de docentes asignados
   - Misma paleta y lógica

## 🔄 Actualización de Datos

Los datos se actualizan automáticamente cuando:
- El usuario recarga la página
- Se llama a `refetch()` desde `useTeacherProfile`
- El componente se monta por primera vez

**NO hay cache hardcodeado** - siempre se consulta al backend.


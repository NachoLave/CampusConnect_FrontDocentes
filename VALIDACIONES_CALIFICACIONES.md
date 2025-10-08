# Validaciones Implementadas - Pestaña de Calificaciones

## 📋 Resumen de Validaciones Implementadas

### 1. **Configuración de Campos de Entrada**

#### Cambios en los inputs:
- **Incremento**: Cambiado de `0.1` a `0.5`
- **Valor mínimo**: Cambiado de `0` a `1`
- **Valor máximo**: `10` (sin cambios)
- **Prevención de valores negativos**: Se bloquea el ingreso de `-`, `e`, y `E` mediante `onKeyDown`

#### Código implementado:
```tsx
<input
  type="number"
  min="1"
  max="10"
  step="0.5"
  onKeyDown={(e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault()
    }
  }}
  ...
/>
```

---

### 2. **Validación y Redondeo Automático**

#### Función `validateAndRoundGrade(value: string)`
Esta función valida y normaliza cualquier valor ingresado:

- **Limpieza de caracteres**: Remueve todos los caracteres no numéricos excepto punto decimal
- **Validación de número válido**: Verifica que sea un número finito (no `NaN` ni `Infinity`)
- **Prevención de negativos**: Descarta valores menores a 0
- **Límites de rango**: 
  - Si el valor es menor a 1, lo establece en `1`
  - Si el valor es mayor a 10, lo establece en `10`
- **Redondeo a 0.5**: 
  - `4.4` → `4`
  - `4.5` → `4.5` (sin cambios)
  - `4.6` → `5`
  - Fórmula: `Math.round(num * 2) / 2`

#### Ejemplos de validación:
| Entrada | Salida | Motivo |
|---------|--------|--------|
| `4.02`  | `4`    | Redondea hacia abajo |
| `4.3`   | `4`    | Redondea hacia abajo |
| `4.5`   | `4.5`  | Ya es múltiplo de 0.5 |
| `4.7`   | `5`    | Redondea hacia arriba |
| `0.5`   | `1`    | Menor al mínimo |
| `11`    | `10`   | Mayor al máximo |
| `-3`    | `""`   | Valor negativo rechazado |
| `abc`   | `""`   | No es número |

---

### 3. **Gestión de Campo REC (Recuperatorio)**

#### Lógica de habilitación:
- **Habilitado solo si**: Exactamente uno de los dos parciales es menor a 4
- **Bloqueado si**:
  - Ambos parciales >= 8 (promoción directa)
  - Ambos parciales < 4 (recursa directa)
  - Ambos parciales >= 4 pero < 8

#### Auto-limpieza:
- Si el campo REC está bloqueado y contiene un valor, **se borra automáticamente**
- Esto ocurre en la función `updateGrade()` al detectar que `!permissions.recEnabled`

```tsx
// Si REC está bloqueado, limpiar su valor
if (!permissions.recEnabled && updated[studentId]["REC"]) {
  updated[studentId]["REC"] = ""
}
```

---

### 4. **Gestión de Campo FINAL**

#### Caso 1: Promoción (Auto-calculado)
Cuando ambos parciales >= 8:
- La nota FINAL se **calcula automáticamente** como el promedio de todas las evaluaciones
- El campo se muestra con un estilo especial (borde verde, fondo verde claro)
- **No es editable** por el docente
- Se actualiza automáticamente al cambiar las notas de evaluación

**Cálculo del promedio:**
```tsx
const grades = [p1, p2]
if (rec !== null && rec >= 8) grades.push(rec)
const average = grades.reduce((a, b) => a + b, 0) / grades.length
const rounded = Math.round(average * 2) / 2
```

Ejemplo:
- Eval 1: `8`, Eval 2: `9` → FINAL: `8.5` (auto-calculado)
- Eval 1: `8`, Eval 2: `8`, REC: `10` → FINAL: `8.5` (promedio de 8+8+10)

#### Caso 2: No Promoción (Editable)
En todos los demás casos, el docente **debe ingresar manualmente** la nota FINAL:
- Ambos parciales >= 4 pero < 8: requiere examen final
- Un parcial < 4 con REC >= 4: requiere examen final
- El campo es completamente editable

---

### 5. **Validaciones Pre-Guardado**

Antes de guardar, se ejecuta `validateGradesBeforeSave()` que verifica:

1. **Valores numéricos válidos**: Todas las notas deben ser números finitos
2. **Rango 1-10**: No se permiten valores fuera de este rango
3. **Múltiplos de 0.5**: Verifica que todas las notas sean múltiplos exactos de 0.5

Si alguna validación falla:
- Se muestra un **modal de alerta rojo** con el mensaje de error específico
- **No se guarda** hasta corregir los errores

---

### 6. **Modal de Confirmación**

Cuando todas las validaciones pasan:
- Se muestra un **modal de confirmación azul**
- El usuario debe confirmar explícitamente antes de guardar
- Mensaje: *"Estás a punto de guardar las calificaciones cargadas. Una vez guardadas, los datos serán permanentes."*

---

### 7. **Modales Implementados**

#### Modal de Confirmación (`showGradesSaveModal`)
- **Color**: Azul (bg-blue-100)
- **Icono**: CheckCircle
- **Botones**: 
  - "Cancelar" (gris) - Cierra el modal sin guardar
  - "Confirmar" (slate) - Ejecuta el guardado

#### Modal de Alerta (`showGradesAlertModal`)
- **Color**: Rojo (bg-red-100)
- **Icono**: X
- **Mensaje dinámico**: `gradesAlertMessage` con el error específico
- **Botón**: "Entendido" (rojo) - Cierra el modal

---

### 8. **Flujo de Guardado**

```
Usuario hace clic en "Guardar"
    ↓
handleSaveGradesClick()
    ↓
validateGradesBeforeSave()
    ↓
    ├─ ❌ Validación falla
    │   ↓
    │   Muestra Modal de Alerta
    │   (No se guarda)
    │
    └─ ✅ Validación exitosa
        ↓
        Muestra Modal de Confirmación
        ↓
        Usuario confirma
        ↓
        confirmSaveGrades()
        ↓
        Guardado exitoso
        (Sale del modo edición)
```

---

### 9. **Cálculo de Condición Final**

#### Estados posibles:
1. **PROMOCIONA**: Ambos parciales >= 8
2. **APROBADO**: Cumplió requisitos y FINAL >= 4
3. **FINAL PENDIENTE**: Habilitado para final pero no aprobado o sin nota
4. **RECURSA**: Ambos parciales < 4, o recuperatorio < 4
5. **"" (vacío)**: Sin datos suficientes para determinar condición

---

### 10. **Resumen de Validaciones por Tipo**

| Validación | Implementada | Ubicación |
|------------|--------------|-----------|
| Rango 1-10 | ✅ | `validateAndRoundGrade()` |
| Múltiplos de 0.5 | ✅ | `validateAndRoundGrade()` + `validateGradesBeforeSave()` |
| Números válidos | ✅ | `validateAndRoundGrade()` |
| Prevenir negativos | ✅ | Input `onKeyDown` + `validateAndRoundGrade()` |
| Auto-limpieza REC | ✅ | `updateGrade()` |
| Auto-cálculo FINAL (promoción) | ✅ | `calculateAutoFinalGrade()` + `updateGrade()` |
| Modal confirmación | ✅ | `showGradesSaveModal` |
| Modal alerta | ✅ | `showGradesAlertModal` |
| Validación pre-guardado | ✅ | `validateGradesBeforeSave()` |

---

## 🎯 Casos de Prueba Recomendados

### Caso 1: Promoción Directa
1. Ingresar Eval 1: `8`
2. Ingresar Eval 2: `9`
3. **Verificar**: Campo REC bloqueado y limpio
4. **Verificar**: Campo FINAL auto-calculado en `8.5` y no editable (verde)
5. **Verificar**: Condición = "PROMOCIONA"

### Caso 2: Recuperatorio
1. Ingresar Eval 1: `3`
2. Ingresar Eval 2: `7`
3. **Verificar**: Campo REC habilitado
4. Ingresar REC: `6`
5. **Verificar**: Campo FINAL habilitado
6. Ingresar FINAL: `5`
7. **Verificar**: Condición = "APROBADO"

### Caso 3: Validación de Redondeo
1. Ingresar Eval 1: `4.3`
2. **Verificar**: Se redondea a `4`
3. Ingresar Eval 2: `7.8`
4. **Verificar**: Se redondea a `8`

### Caso 4: Prevención de Errores
1. Intentar ingresar: `-5`
2. **Verificar**: Se rechaza y queda vacío
3. Intentar ingresar: `abc`
4. **Verificar**: Se rechaza y queda vacío
5. Intentar ingresar: `15`
6. **Verificar**: Se ajusta a `10`

### Caso 5: Modal de Alerta
1. Forzar ingreso de valor inválido en localStorage
2. Hacer clic en "Guardar"
3. **Verificar**: Muestra modal rojo con error específico
4. **Verificar**: No se guarda hasta corregir

---

## 📝 Notas Importantes

- Todas las validaciones se aplican **en tiempo real** al escribir
- El redondeo ocurre **automáticamente** al salir del campo (blur)
- Los valores se persisten en `localStorage` después de cada cambio
- Al cargar datos guardados, se re-normalizan las condiciones calculadas
- Los campos bloqueados tienen un estilo visual diferente (gris, cursor not-allowed)
- El campo FINAL auto-calculado tiene un estilo especial (verde) para distinguirlo

---

## 🔄 Flujo de Actualización de Notas

```
Usuario ingresa valor
    ↓
onChange del input
    ↓
updateGrade(studentId, field, value)
    ↓
validateAndRoundGrade(value)
    ↓
Actualiza gradesData
    ↓
getGradePermissions()
    ↓
    ├─ REC bloqueado? → Limpiar REC
    ├─ Promociona? → Calcular FINAL auto
    └─ Calcular condición final
        ↓
Actualiza UI automáticamente
```

---

## ✅ Checklist de Validaciones Completadas

- [x] Incremento de 0.5
- [x] Valor mínimo 1
- [x] Valor máximo 10
- [x] Validación de rango 1-10 en código
- [x] Validación de múltiplos de 0.5
- [x] Validación de números válidos (no texto)
- [x] Prevención de valores negativos
- [x] Auto-limpieza de REC cuando está bloqueado
- [x] Auto-cálculo de FINAL en promoción
- [x] FINAL editable cuando no promociona
- [x] Modal de confirmación antes de guardar
- [x] Modal de alerta para errores de validación
- [x] Redondeo automático (4.5→5, 4.4→4)

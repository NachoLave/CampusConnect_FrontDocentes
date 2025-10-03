# 🎓 CampusConnect - Portal del Docente

> Sistema de gestión educativa para docentes universitarios

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Desarrollo](#-desarrollo)
- [Changelog](#-changelog)
- [Tareas Pendientes](#-tareas-pendientes)

## ✨ Características

### Gestión de Cursos
- ✅ Vista de cursos actuales y anteriores
- ✅ Información detallada de cada curso
- ✅ Gestión de alumnos y docentes
- ✅ Sistema de filtros avanzado

### Control de Asistencia
- ✅ Registro de asistencia por fecha
- ✅ Estados: Presente, 1/2 Falta, Ausente
- ✅ Navegación día a día entre clases
- ✅ Guardado automático de cambios
- ✅ Filtros por estado de asistencia

### Sistema de Calificaciones
- ✅ Gestión de evaluaciones (Eval 1, Eval 2, Recuperatorio)
- ✅ Cálculo automático de condición final
- ✅ Estados: PROMOCIONA, APROBADO, FINAL PENDIENTE, RECURSA
- ✅ Filtros por condición del alumno

### Módulos Adicionales
- 📅 **Calendario**: Vista de eventos y clases
- 💰 **Billetera**: Gestión de saldo y transacciones
- 🍽️ **Comedor**: Historial de reservas
- 🛒 **Tienda**: Historial de compras

### Características Técnicas
- 📱 **100% Responsive**: Optimizado para mobile, tablet y desktop
- 🎨 **UI/UX Moderno**: Diseño limpio e intuitivo
- 🚀 **Performance**: Carga rápida y transiciones suaves
- 🔍 **Filtros Inteligentes**: Múltiples opciones de filtrado en tiempo real
- 📊 **Dashboard**: Vista general con información clave

## 🛠️ Tecnologías

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom components + [Radix UI](https://www.radix-ui.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Fuentes**: [Geist](https://vercel.com/font)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPO]

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🚀 Desarrollo

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar build de producción
npm start

# Linting
npm run lint
```

## 📝 Changelog

### Versión 1.0.0 - 03/10/2025

#### ✅ Completado

##### Layout y Navegación
- [x] Navbar y sidebar fijos (no se mueven al hacer scroll)
- [x] Eliminado mensaje de bienvenida del navbar
- [x] Modal de aviso para usuarios móviles
- [x] Sistema de navegación responsive completo

##### Mis Cursos
- [x] Filtros funcionales (Período, Sede, Días)
- [x] Contador de cursos dinámico ("Mostrando X de Y cursos")
- [x] Tags de filtros aplicados con opción de eliminar individualmente
- [x] Botón "Limpiar filtros" general
- [x] Dropdown de filtros mejorado (cierre al hacer click fuera)
- [x] Días en formato Title Case (Lunes, Martes, etc.)

##### Asistencia
- [x] Botón "Guardar" que aparece al modificar asistencia
- [x] Ancho fijo del selector de fecha
- [x] Navegación día a día entre clases (flechas)
- [x] Modal de confirmación al guardar
- [x] Filtros por estado de asistencia
- [x] Separador visual entre mes y fecha

##### Calificaciones
- [x] Filtros integrados en el panel
- [x] Eliminado botón "Restaurar" externo
- [x] Botón "Limpiar" dentro de los dropdowns
- [x] Tags de filtros con colores por condición

##### Comedor y Tienda
- [x] Filtros alineados y espaciados correctamente
- [x] Eliminados botones "Aplicar" y "Restaurar filtros"
- [x] Date picker personalizado (dos campos: Desde/Hasta)
- [x] Filtrado automático al seleccionar opciones
- [x] Tags de filtros con colores diferenciados
- [x] Títulos y subtítulos con formato consistente
- [x] Botones "Visitar" responsive

##### Diseño y UX
- [x] **Responsive completo**: Mobile, Tablet y Desktop
- [x] Favicon con logo de CampusConnect
- [x] Animación de "respiración" en imágenes del carousel
- [x] Scroll automático al inicio al cambiar de página
- [x] Sidebar con menú hamburguesa en móvil
- [x] Date picker custom con diseño coherente
- [x] Dropdowns que se cierran al hacer click fuera
- [x] Estados visuales claros en filtros

## 📋 Tareas Pendientes

### Alta Prioridad
- [ ] Sistema de generación de actas
  - [ ] Cambiar nombre "Preview" por otro más descriptivo
  - [ ] Eliminar botón "Cancelar"
  - [ ] Implementar funcionalidad de generar acta
  - [ ] Bloquear curso al generar acta
  - [ ] Habilitar botón solo cuando termina el curso
- [ ] Lógica de recuperatorio en calificaciones
  - [ ] Decidir comportamiento cuando se modifica nota con recuperatorio existente

### Mejoras Futuras
- [ ] Cambiar botón "Anteriores" por "Todas" en Mis Cursos
- [ ] Integración con backend (APIs)
- [ ] Sistema de autenticación real
- [ ] Notificaciones push
- [ ] Exportar datos (PDF, Excel)

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

## 👥 Equipo

Desarrollado por el equipo de CampusConnect

---

**Última actualización**: 03/10/2025

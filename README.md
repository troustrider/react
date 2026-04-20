# Laboratorio 3 — React con TypeScript

Laboratorio práctico del bootcamp de Corner Estudios S.L. (Fase 4, Módulo 3). El objetivo es aplicar TypeScript estricto en un entorno React: componentes genéricos, hooks tipados, utility types y uso de librerías externas con tipos.

## Stack

- React 19 + TypeScript (template `react-ts` de Vite)
- date-fns para cálculo de fechas con tipos estrictos
- Vite como bundler y servidor de desarrollo

## Estructura

```
src/
  App.tsx              → Componente raíz con datos de prueba
  DataTable.tsx        → Componente genérico: tabla con edición inline y ordenación
  models.ts            → Tipos del dominio (Estudiante, ColumnaTabla)
  utils/
    fecha-utils.ts     → Diferencia de días con date-fns
docs/
  arquitectura-final.md → Documentación de decisiones de diseño
```

## Cómo ejecutar

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173/`.

## Verificación de tipos

```bash
npx tsc -b --noEmit
```

Compila sin errores.

## Funcionalidades del DataTable

- **Genérico**: acepta cualquier tipo `T` con `id: string`. Las columnas usan `keyof T` para restringir las claves a propiedades reales de la entidad.
- **Edición inline**: las celdas se convierten en inputs al editar. Estado temporal con `Partial<T>`.
- **Ordenación por columnas**: clic en cabecera ordena, segundo clic invierte. Indicador visual ▲/▼.
- **date-fns**: integración con tipos estrictos para calcular días entre fechas.

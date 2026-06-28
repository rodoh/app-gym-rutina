# Rutina Fuerza

Aplicacion web responsive para consultar, editar y registrar la rutina de fuerza de 12 semanas de Rodri.

## Interpretacion de la rutina

No habia carpeta `/data` en el workspace inicial. La fuente estructurada disponible es `workout_data.json` en la raiz, y se uso como fuente de verdad porque contiene programa, reglas, calentamiento, cardio, progresion y la rutina semanal completa.

Rutina importada:

- Lunes: Tren Superior A - Fuerza, 7 ejercicios.
- Martes: Tren Inferior A - Fuerza, 7 ejercicios.
- Viernes: Tren Superior B - Hipertrofia, 8 ejercicios.
- Sabado: Tren Inferior B - Hipertrofia, 7 ejercicios.

El JSON no define rangos de carga por ejercicio, por eso la app no inventa cargas iniciales. A medida que se guardan sesiones, muestra ultimo peso, ultimas repeticiones, mejor carga y evolucion reciente.

## Funcionalidades

- Inicio con deteccion del dia actual y selector manual de rutina.
- Detalle de entrenamiento con calentamiento, series de aproximacion y tarjetas de ejercicios.
- Modo entrenamiento con registro por serie: kg, reps, RPE, RIR, completado y notas.
- Referencia automatica de la ultima carga usada antes de una nueva sesion.
- Registro de aerobicos/cardio post-entrenamiento asociado a la sesion: tiempo, velocidad, pulsaciones promedio, intensidad, distancia, calorias y notas.
- Resumen final con series, volumen, duracion, cardio, comparacion contra sesion anterior y sensacion general.
- Historial general con filtros por dia, ejercicio y fechas.
- Evolucion de cargas por ejercicio.
- Editor de rutina con crear, renombrar, duplicar, eliminar y reordenar ejercicios con drag and drop.
- Persistencia local con `localStorage`.
- Restauracion de la rutina inicial importada desde `workout_data.json`.

## Modelo de datos

Los tipos estan en `src/types/training.ts`.

- `Program`: datos generales del programa, reglas globales y lista de dias.
- `WorkoutDay`: dia de entrenamiento, foco, duracion estimada, cardio sugerido y ejercicios.
- `Exercise`: ejercicio planificado con series, repeticiones, descanso, notas y rango de carga opcional.
- `PlannedSet`: referencia de serie planificada.
- `SetLog`: serie realizada con peso, reps, RPE, RIR, completado y nota.
- `ExerciseLog`: registro de un ejercicio dentro de una sesion.
- `CardioLog`: cardio post-entrenamiento.
- `WorkoutSession`: sesion guardada con fecha, metricas subjetivas, cardio y ejercicios.
- `ExerciseHistory`: resumen calculado de historial por ejercicio.

La capa de datos queda concentrada en:

- `src/lib/importRoutine.ts`: transforma `workout_data.json` al modelo interno.
- `src/lib/storage.ts`: lectura/escritura local de respaldo.
- `src/lib/supabaseClient.ts`: cliente Supabase con variables de entorno publicas.
- `src/lib/trainingRepository.ts`: repositorio unico. Usa Supabase si esta configurado y cae a `localStorage` si no lo esta.
- `src/lib/metrics.ts`: volumen, historial, validaciones, comparaciones y sugerencias.

## Persistencia multidispositivo con Supabase

La app ya esta preparada para guardar la rutina y las sesiones en Supabase. Para activarlo:

1. Crear un proyecto en Supabase.
2. Abrir `SQL Editor`.
3. Ejecutar el contenido de `supabase/schema.sql`.
4. Copiar `.env.example` como `.env.local`.
5. Completar:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_TRAINING_OWNER_ID=rodri
```

6. Reconstruir y reiniciar:

```bash
pnpm build
pnpm start
```

La tabla usada es `public.training_state`. Guarda una fila por `owner_id`, con:

- `routine`: rutina completa como `jsonb`.
- `sessions`: sesiones e historial como `jsonb`.

Esta estrategia permite sincronizacion rapida entre dispositivos sin reescribir el modelo actual. Mas adelante se puede normalizar en tablas separadas para ejercicios, sesiones y series si se necesitan consultas SQL mas avanzadas.

Nota de seguridad: el SQL incluido habilita acceso anonimo solo para `owner_id = 'rodri'`, suficiente para una app personal de primera version. Para una version privada real con usuarios, conviene agregar Supabase Auth y politicas por `auth.uid()`.

## Requisitos

- Node.js 20 o superior.
- npm para deploy en Netlify.

## Correr el proyecto

Para usar la app normalmente, conviene correrla en modo produccion local:

```bash
npm run build
npm run start
```

Luego abrir `http://localhost:3000`.

El modo desarrollo queda disponible para editar codigo con hot reload:

```bash
npm install
npm run dev
```

En algunos navegadores embebidos el servidor de desarrollo puede dejar el indicador de carga activo por el cliente de hot reload. Para entrenar o probar la app como usuario, usar `npm run build` y `npm run start`.

## Build

```bash
npm run build
```

## Deploy en Netlify

La configuracion para Netlify esta en `netlify.toml`.

Variables requeridas en Netlify:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zfbhuxffmfiknslcncss.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_TRAINING_OWNER_ID=rodri
```

El build en Netlify usa npm para evitar el bloqueo de scripts de build de pnpm 11 en dependencias transitivas.

Guia completa: `DEPLOY_NETLIFY.md`.

## Notas tecnicas

- Stack: Next.js, React, TypeScript, Tailwind CSS y Recharts.
- La app es client-side para poder usar `localStorage`.
- Las validaciones bloquean sesiones vacias, pesos negativos y repeticiones invalidas.
- Las sugerencias de progresion siguen las reglas importadas: subir solo si se completan las series con buena tecnica y sin fatiga alta.

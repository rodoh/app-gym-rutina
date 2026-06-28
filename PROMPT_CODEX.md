# Prompt para Codex

Actua como un senior full-stack product engineer y UX-minded developer. Necesito desarrollar una app mobile-first para registrar una rutina de entrenamiento de 12 semanas.

## Objetivo
Crear una app simple y usable desde el celular en el gimnasio. La app debe permitirme consultar la rutina del dia, iniciar una sesion, registrar pesos/repeticiones/RPE/RIR por serie, ver el historial de cada ejercicio y recibir sugerencias simples de progresion.

## Stack requerido
- Next.js
- React
- TypeScript
- Tailwind CSS
- Persistencia inicial en LocalStorage
- Estructura preparada para migrar luego a Supabase
- Graficos simples con Recharts si hace falta

## Fuente de datos
Usar el archivo `workout_data.json` como fuente de verdad inicial. Ese JSON contiene:
- datos del programa
- contexto
- reglas globales
- calentamiento
- progresion
- cardio
- rutina semanal
- ejercicios por dia
- campos de tracking

## Funcionalidades MVP
1. Home con entrenamiento de hoy.
2. Rutina semanal con lunes, martes, viernes y sabado.
3. Detalle de cada entrenamiento.
4. Modo entrenamiento con registro serie por serie.
5. Inputs por serie:
   - peso en kg
   - reps realizadas
   - RPE
   - RIR
   - notas opcionales
6. Historial por ejercicio.
7. Mostrar ultimo peso usado por ejercicio.
8. Sugerir proximo peso segun reglas:
   - tren superior: +2 a 2.5 kg si completo todo bien
   - tren inferior: +5 kg si completo todo bien
   - si no completo o RPE muy alto, mantener
   - si energia baja o nauseas altas, no subir
9. Registrar datos de sesion:
   - peso corporal
   - energia 1-5
   - apetito 1-5
   - nauseas 0-3
   - horas de sueno
   - cardio minutos
   - notas
10. Pantalla de progreso con:
   - sesiones completadas
   - volumen semanal
   - evolucion de cargas en ejercicios principales
   - peso corporal
   - energia/apetito/nauseas

## UX requerida
- Mobile-first.
- Inputs grandes, rapidos y claros.
- Boton principal fijo abajo en modo entrenamiento.
- Mostrar descanso recomendado por ejercicio.
- Mostrar notas tecnicas de cada ejercicio.
- Mostrar calentamiento antes de empezar la primera serie.
- No sobrecargar con dashboards complejos.

## Rutina
La rutina debe cargarse desde `workout_data.json`.

## Reglas de seguridad
- Nunca sugerir entrenar al fallo.
- Si nausea >= 2, energia <= 2 o mal descanso, sugerir mantener o bajar carga.
- Si aparece dolor, sugerir detener el ejercicio y registrar nota.
- Cuidar especialmente ejercicios de biceps por historial de tendinopatia distal.

## Entregables esperados
- Crear estructura completa del proyecto.
- Componentes reutilizables.
- Tipos TypeScript para Program, WorkoutDay, Exercise, WorkoutSession, SetLog.
- Estado persistido en LocalStorage.
- Datos mock iniciales desde workout_data.json.
- UI responsive mobile-first.
- Codigo limpio y facil de extender.

## Pantallas
1. `/` Home
2. `/routine` Rutina semanal
3. `/workout/[day]` Detalle de entrenamiento
4. `/session/[day]` Modo entrenamiento
5. `/exercise/[id]` Historial de ejercicio
6. `/progress` Progreso

Empeza implementando el MVP completo y funcional. Priorizá usabilidad real en gimnasio antes que complejidad visual.

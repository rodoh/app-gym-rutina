# App de entrenamiento - Rutina 12 semanas Rodri

## Objetivo de la app
Crear una app mobile-first para consultar la rutina mientras entreno, registrar pesos, repeticiones, RPE/RIR y visualizar progreso durante 12 semanas.

## Contexto del programa
- Duracion: 12 semanas.
- Frecuencia: 4 dias por semana.
- Distribucion:
  - Lunes: Tren Superior A - Fuerza.
  - Martes: Tren Inferior A - Fuerza.
  - Viernes: Tren Superior B - Hipertrofia.
  - Sabado: Tren Inferior B - Hipertrofia.
- Objetivo: ganar fuerza, mantener masa muscular y perder grasa gradual.
- Contexto de salud/nutricion: usuario usando Mounjaro, con ingesta reducida posible. Evitar entrenar al fallo y cuidar recuperacion.

## Funcionalidades MVP
1. Ver rutina por dia.
2. Iniciar entrenamiento del dia.
3. Ver calentamiento y series de aproximacion.
4. Registrar por cada serie:
   - peso usado en kg
   - repeticiones realizadas
   - RPE
   - RIR
   - notas
5. Guardar historial por ejercicio.
6. Mostrar ultimo peso usado por ejercicio.
7. Sugerir proxima carga si completo todas las series.
8. Registrar datos de sesion:
   - peso corporal
   - energia 1-5
   - apetito 1-5
   - nauseas 0-3
   - horas de sueno
   - cardio realizado
9. Mostrar progreso semanal.
10. Permitir editar registros.

## Pantallas sugeridas

### 1. Home
- Card con el entrenamiento de hoy.
- Estado del bloque actual: semanas 1-4, 5-8 o 9-12.
- Ultimos registros destacados.
- CTA: "Empezar entrenamiento".

### 2. Rutina semanal
- Tabs o cards por dia.
- Cada card muestra grupo muscular, tipo de entrenamiento y cantidad de ejercicios.

### 3. Detalle de entrenamiento
- Lista ordenada de ejercicios.
- Para cada ejercicio: series, reps objetivo, descanso, notas tecnicas.
- Bloque de calentamiento al inicio.

### 4. Modo entrenamiento
- Ejercicio actual.
- Series objetivo.
- Inputs por serie: kg, reps, RPE, RIR.
- Timer de descanso.
- Boton "siguiente ejercicio".
- Boton "terminar entrenamiento".

### 5. Historial de ejercicio
- Grafico simple de peso usado por fecha.
- Mejor serie.
- Volumen total.
- Ultima carga usada.

### 6. Progreso
- Peso corporal.
- Cargas por ejercicio principal.
- Volumen semanal.
- Adherencia semanal.
- Energia/apetito/nauseas.

## Modelo de datos sugerido

### Program
- id
- name
- durationWeeks
- goal
- startDate
- createdAt

### WorkoutDay
- id
- programId
- dayOfWeek
- timeLabel
- sessionName
- type
- sortOrder

### Exercise
- id
- name
- category
- defaultSets
- defaultReps
- rest
- notes
- alternatives

### WorkoutExercise
- id
- workoutDayId
- exerciseId
- sortOrder
- sets
- reps
- rest
- notes

### WorkoutSession
- id
- workoutDayId
- date
- weekNumber
- bodyWeightKg
- energyLevel
- appetiteLevel
- nauseaLevel
- sleepHours
- cardioMinutes
- notes
- completedAt

### SetLog
- id
- workoutSessionId
- exerciseId
- setNumber
- targetReps
- weightKg
- repsCompleted
- rpe
- rir
- notes

## Logica de progresion

### Regla base
- Si el usuario completa todas las series y repeticiones objetivo con tecnica solida y RIR dentro del objetivo, sugerir subir carga.
- Tren superior: +2 a 2.5 kg.
- Tren inferior: +5 kg.
- Si no completa, repetir la carga la proxima semana.
- Si el RPE fue muy alto o hubo dolor/fatiga, mantener o bajar carga.

### Bloques de intensidad
- Semanas 1-4: RPE 6-7 / RIR 3-4.
- Semanas 5-8: RPE 7-8 / RIR 2-3.
- Semanas 9-12: RPE 8 / RIR 1-2.

## Reglas de seguridad
- No sugerir entrenar al fallo.
- Si el usuario reporta nauseas altas, energia baja o mal descanso, sugerir mantener carga o reducir volumen.
- Si aparece dolor articular o dolor en biceps distal, sugerir detener el ejercicio y reemplazar por una variante mas segura.

## Archivos incluidos
- `workout_data.json`: dataset completo de la rutina.
- `PROMPT_CODEX.md`: prompt listo para pegar en Codex.
- `app_spec.md`: especificacion funcional mas detallada.
- `rutina_12_semanas_app.pdf`: version PDF profesional para consulta.

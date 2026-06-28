# Especificacion funcional - App Rutina 12 semanas

## Vision
Una app simple, mobile-first, para que Rodri pueda entrenar sin improvisar: consultar el entrenamiento del dia, registrar pesos/reps/RPE/RIR y ver progresion.

## Principios UX
- Rapida de usar en gimnasio.
- Inputs grandes y faciles de tocar.
- Minimo texto durante el entrenamiento.
- Historial visible justo donde se necesita decidir el peso.
- Enfoque en consistencia, no en sobreoptimizar.

## Informacion central para cada ejercicio
- Nombre.
- Series objetivo.
- Repeticiones objetivo.
- Descanso.
- Notas tecnicas.
- Ultimo peso usado.
- Mejor registro.
- Boton para registrar serie.

## Datos a registrar por serie
- Peso usado en kg.
- Repeticiones realizadas.
- RPE.
- RIR.
- Notas opcionales.

## Datos a registrar por sesion
- Fecha.
- Semana del programa.
- Peso corporal.
- Energia 1-5.
- Apetito 1-5.
- Nauseas 0-3.
- Horas de sueno.
- Cardio realizado.
- Notas.

## Calentamiento y aproximacion
Al abrir un entrenamiento, mostrar:
1. Entrada en calor general: 5-7 min de bici/cinta/caminata.
2. Movilidad especifica.
3. Series de aproximacion para el primer ejercicio pesado:
   - barra sola x15
   - 50% x8
   - 75% x5
   - 90% x2
   - series efectivas

## Rutina semanal
Ver `workout_data.json` como fuente de verdad.

## Sugerencias automaticas
La app deberia calcular:
- volumen por ejercicio: kg x reps x series.
- adherencia: ejercicios completados / ejercicios planificados.
- mejor carga usada.
- sugerencia de siguiente peso.
- alerta si la fatiga es alta.

## Reglas de sugerencia de peso
- Si completo todas las series y reps, RPE <= objetivo y sin dolor: subir.
- Si completo pero RPE muy alto: mantener.
- Si no completo: mantener o bajar.
- Si nausea >= 2 o energia <= 2: no subir peso.

## Estilo visual sugerido
- Mobile-first.
- Fondo claro o dark mode.
- Cards grandes.
- Tipografia clara.
- Acciones principales fijas abajo.
- Color principal: rojo/bordo intenso o azul oscuro sobrio.

## Stack sugerido
- Next.js + React + TypeScript.
- Tailwind CSS.
- LocalStorage para MVP.
- Luego Supabase si se quiere persistencia real multi-dispositivo.
- Charts simples con Recharts.

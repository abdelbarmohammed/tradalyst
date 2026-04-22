---
title: "Las métricas de trading que importan (y las que solo distraen)"
slug: "metricas-trading"
excerpt: "El P&L total no te dice si eres buen trader. Estas son las métricas que sí lo hacen: win rate, ratio R:R, factor de beneficio y drawdown máximo. Cómo interpretarlas y qué umbrales buscar."
category: "Analítica"
date: "2026-04-10"
readTime: "7 min"
author: "Equipo Tradalyst"
---

Muchos traders miran una sola métrica para evaluar su rendimiento: el P&L total. El problema es que el P&L total no te dice si eres buen trader. Solo te dice si ganaste o perdiste dinero en un período concreto.

Un trader puede ganar dinero en un mes con una estrategia que tiene un ratio riesgo/recompensa negativo, simplemente porque tuvo suerte en unas pocas operaciones grandes. Esa estrategia lo arruinará en seis meses.

Otro trader puede perder dinero en un mes con una estrategia estadísticamente sólida, simplemente porque el mercado estuvo en un régimen desfavorable para su setup. Esa estrategia lo hará rentable a largo plazo si la ejecuta con consistencia.

Para distinguir entre los dos necesitas métricas.

## Win Rate — lo que todo el mundo mira mal

El win rate es el porcentaje de operaciones que cierras en positivo. Es la métrica más conocida y también la más malinterpretada.

**Un win rate alto no significa que seas rentable.**

Si ganas €50 en cada trade ganador y pierdes €200 en cada trade perdedor, un win rate del 75% te lleva a la quiebra:

- 75 trades ganadores × €50 = +€3.750
- 25 trades perdedores × €200 = -€5.000
- Resultado: -€1.250

El win rate solo tiene sentido en combinación con el ratio riesgo/recompensa.

**Umbrales orientativos:**
- Win rate < 40% con R:R > 2:1 puede ser rentable
- Win rate > 60% con R:R < 1:1 suele no serlo
- El punto de equilibrio matemático: win rate × ganancia media = (1 - win rate) × pérdida media

## Ratio Riesgo/Recompensa (R:R)

El ratio R:R mide cuánto ganas de media por cada euro que arriesgas. Un R:R de 2:1 significa que por cada euro que arriesgas, ganas dos cuando tienes razón.

Este ratio debe calcularse **antes** de entrar en la operación, no después. Es la diferencia entre la entrada y el stop-loss versus la diferencia entre la entrada y el objetivo.

Si pones el stop a 50 puntos y el objetivo a 100 puntos, tu R:R es 1:2 (arriesgas 1 para ganar 2).

**El impacto del R:R en el punto de equilibrio:**

| R:R | Win rate mínimo para no perder |
|-----|-------------------------------|
| 1:1 | 50% |
| 1:2 | 33% |
| 1:3 | 25% |
| 2:1 | 67% |

La mayoría de los traders trabajan con R:R entre 1:1 y 1:2, lo que requiere un win rate de 33-50% solo para cubrir gastos. Con comisiones, necesitas más.

## Factor de Beneficio (Profit Factor)

El profit factor es el cociente entre las ganancias brutas totales y las pérdidas brutas totales:

**Profit Factor = Suma de todas las ganancias / Suma de todas las pérdidas**

Un profit factor de 1.0 significa que estás en equilibrio. Por encima de 1.5 ya indica una estrategia con ventaja estadística real. Por encima de 2.0 es excelente para trading discrecional.

Esta métrica es más fiable que el win rate porque incorpora tanto la frecuencia como la magnitud de las operaciones.

## Drawdown máximo

El drawdown máximo mide el peor descenso desde un máximo histórico de la curva de capital hasta el mínimo siguiente, antes de recuperarse.

Si tu cuenta llegó a €12.000, luego bajó a €9.000 y después se recuperó, tu drawdown máximo en ese período fue del 25%.

**Por qué importa:**

1. **Psicología.** Un drawdown del 30% destruye la disciplina de la mayoría de los traders, aunque la estrategia sea matemáticamente sólida. Si no puedes aguantar psicológicamente el drawdown de tu estrategia, la abandonarás justo antes de que se recupere.

2. **Gestión del riesgo.** Si tu drawdown histórico es del 20%, debes tener capital suficiente para soportar un drawdown del doble sin comprometer tu capacidad de operar.

**Umbrales orientativos para trading discrecional:**
- < 10%: excelente gestión del riesgo
- 10-20%: aceptable
- 20-30%: arriesgado, revisa el tamaño de posiciones
- > 30%: señal de alarma — la estrategia o la gestión del riesgo tiene un problema grave

## Métricas por segmento: dónde está la ventaja real

El P&L global oculta información. Las métricas por segmento la revelan.

Las preguntas que deberías poder responder sobre tu trading:

- **Por activo:** ¿Cuál es mi win rate en BTC/USD vs ETH/USD? ¿Hay activos donde no debería operar?
- **Por horario:** ¿Rindo mejor en la sesión europea o en la americana? ¿El aftermarket me destruye el rendimiento?
- **Por estado emocional:** ¿Cuál es mi R:R cuando estoy tranquilo vs cuando estoy nervioso?
- **Por día de la semana:** ¿Los lunes después de un fin de semana malo tienen peor rendimiento?
- **Por tamaño de posición:** ¿Las operaciones con mayor tamaño tienen menor win rate? (Si es así, estás aumentando el tamaño cuando estás menos disciplinado.)

Ninguna de estas preguntas se puede responder mirando el P&L total. Requieren datos granulares por operación.

## La métrica que más se ignora: la consistencia de ejecución

¿Con qué frecuencia sigues tu propio plan? ¿Cuántas veces mueves el stop-loss? ¿Cuántas veces cierras antes del objetivo por miedo?

Esta métrica no tiene un nombre estándar, pero es posiblemente la más importante. Un trader con una estrategia mediocre que la ejecuta consistentemente supera a un trader con una estrategia excelente que la ejecuta de forma errática.

Si tienes un diario, puedes medir esto. Si no lo tienes, operas a ciegas.

---

*Tradalyst calcula automáticamente todas estas métricas a partir de tus operaciones registradas. Win rate por emoción, drawdown máximo, profit factor — todo en un dashboard sin configuración manual.*

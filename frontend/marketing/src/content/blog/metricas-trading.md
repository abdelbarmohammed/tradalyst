---
title: "Las métricas de trading que importan (y las que solo distraen)"
seoTitle: "Métricas de Trading: Win Rate, R:R y Más | Tradalyst"
description: "El P&L total no te dice si eres buen trader. Estas son las métricas de trading que sí lo hacen: win rate, ratio R:R, profit factor y drawdown máximo explicados."
date: "2026-04-10"
lastModified: "2026-04-25"
author: "Tradalyst"
category: "performance"
keywords:
  - "métricas de trading"
  - "win rate trading"
  - "ratio riesgo beneficio"
  - "profit factor trading"
  - "drawdown máximo"
  - "análisis de operaciones"
readTime: 8
lang: "es"
hreflang:
  es: "/blog/metricas-trading"
  en: "/en/blog/metricas-trading"
featuredImage: "/images/blog/metricas-trading.webp"
featuredImageAlt: "Dashboard con métricas de trading — win rate, drawdown y profit factor — Tradalyst"
---

Muchos traders miran una sola métrica para evaluar su rendimiento: el P&L total. El problema es que el P&L total no te dice si eres buen trader. Solo te dice si ganaste o perdiste dinero en un período concreto.

Un trader puede ganar dinero en un mes con una estrategia que tiene un ratio riesgo/recompensa negativo, simplemente porque tuvo suerte en unas pocas operaciones grandes. Esa estrategia lo arruinará en seis meses. Otro trader puede perder dinero en un mes con una estrategia estadísticamente sólida, simplemente porque el mercado estuvo en un régimen desfavorable para su setup. Esa estrategia lo hará rentable a largo plazo si la ejecuta con consistencia.

Para distinguir entre los dos necesitas **métricas de trading** que vayan más allá del P&L.

---

## Win Rate — lo que todo el mundo mira mal

El win rate es el porcentaje de operaciones que cierras en positivo. Es la **métrica de trading** más conocida y también la más malinterpretada.

Un win rate alto no significa que seas rentable.

Si ganas €50 en cada trade ganador y pierdes €200 en cada trade perdedor, un win rate del 75% te lleva a la quiebra:

- 75 trades ganadores × €50 = +€3.750
- 25 trades perdedores × €200 = −€5.000
- **Resultado: −€1.250**

El win rate solo tiene sentido en combinación con el ratio riesgo/recompensa. Por eso es la primera métrica que debes calcular — no la única.

**Umbrales orientativos:**
- Win rate < 40% con R:R > 2:1 puede ser rentable
- Win rate > 60% con R:R < 1:1 suele no serlo
- El punto de equilibrio: win rate × ganancia media = (1 − win rate) × pérdida media

La forma más útil de analizar el win rate no es como un número global sino segmentado: win rate por activo, por franja horaria, por estado emocional. Esos segmentos revelan dónde está tu ventaja real y dónde estás regalando dinero.

---

## Ratio Riesgo/Recompensa (R:R)

El ratio R:R mide cuánto ganas de media por cada euro que arriesgas. Un R:R de 1:2 significa que por cada euro que arriesgas, ganas dos cuando tienes razón.

Este ratio debe calcularse **antes** de entrar en la operación, no después. Es la diferencia entre la entrada y el stop-loss versus la diferencia entre la entrada y el objetivo.

Si pones el stop a 50 puntos y el objetivo a 100 puntos, tu R:R es 1:2.

**El impacto del R:R en el punto de equilibrio:**

| R:R | Win rate mínimo para no perder |
|-----|-------------------------------|
| 1:1 | 50% |
| 1:2 | 33% |
| 1:3 | 25% |
| 2:1 | 67% |

La mayoría de los traders trabajan con R:R entre 1:1 y 1:2, lo que requiere un win rate de 33-50% solo para cubrir gastos. Con comisiones y spreads, necesitas más.

El error más común con el R:R no es calcularlo mal — es no calcularlo antes de entrar. Si defines el R:R después de ver cómo se comporta el precio, estás racionalizando una decisión que ya tomaste, no evaluando un setup.

---

## Profit Factor (Factor de Beneficio)

El profit factor es el cociente entre las ganancias brutas totales y las pérdidas brutas totales:

**Profit Factor = Suma de todas las ganancias / Suma de todas las pérdidas**

Un profit factor de 1.0 significa equilibrio exacto. Por encima de 1.5 ya indica una estrategia con ventaja estadística real. Por encima de 2.0 es excelente para trading discrecional.

Esta **métrica de trading** es más robusta que el win rate porque incorpora tanto la frecuencia como la magnitud de las operaciones. Puedes tener un win rate del 35% con un profit factor de 2.2 — y eso es una estrategia sólida.

El profit factor también es más resistente al cherry-picking que el P&L. Si alguien te dice "mi estrategia gana dinero", pídele el profit factor calculado sobre las últimas 100 operaciones. Un número honesto.

<BlogCta
  heading="¿Quieres ver tus métricas calculadas automáticamente?"
  buttonText="Empieza gratis"
  href="/registro"
/>

---

## Drawdown Máximo

El drawdown máximo mide el peor descenso desde un máximo histórico de la curva de capital hasta el mínimo siguiente, antes de recuperarse.

Si tu cuenta llegó a €12.000, luego bajó a €9.000 y después se recuperó, tu drawdown máximo en ese período fue del 25%.

**Por qué importa más de lo que parece:**

Primero, por psicología. Un drawdown del 30% destruye la disciplina de la mayoría de los traders, aunque la estrategia sea matemáticamente sólida. Cuando estás en el fondo del drawdown es cuando más dudas de tu sistema y cuando más probable es que lo abandones — justo antes de que se recupere.

Segundo, por capital. Si tu drawdown histórico es del 20%, debes tener capital suficiente para soportar un drawdown del doble sin comprometer tu capacidad de operar. Si operas con todo tu capital disponible, un drawdown del 40% te deja sin margen.

**Umbrales orientativos para trading discrecional:**
- < 10%: excelente gestión del riesgo
- 10-20%: aceptable
- 20-30%: arriesgado — revisa el tamaño de posiciones
- > 30%: señal de alarma seria

El drawdown no es solo un número de rendimiento — es un parámetro de supervivencia. Los traders que no lo monitorizan activamente suelen no darse cuenta de que están en uno hasta que ya han perdido demasiado.

---

## Métricas por segmento: dónde está la ventaja real

El P&L global oculta información. Las métricas por segmento la revelan.

Las preguntas que deberías poder responder sobre tu trading:

**Por activo:** ¿Cuál es tu win rate en BTC/USD vs ETH/USD? ¿Hay activos donde tu estrategia no funciona pero sigues operando por hábito?

**Por horario:** ¿Rindes mejor en la apertura europea o en la americana? ¿Las operaciones en aftermarket tienen peor ratio?

**Por estado emocional:** ¿Tu win rate cuando estás nervioso o en FOMO es significativamente inferior? Si sí, tienes la solución al alcance de la mano: etiqueta esas operaciones y crea una regla.

**Por día de la semana:** ¿Los lunes después de un fin de semana con pérdidas tienen peor rendimiento? Los mercados tienen patrones estadísticos, pero también tu comportamiento los tiene.

**Por tamaño de posición:** Si las operaciones con mayor tamaño tienen menor win rate, estás aumentando el riesgo en los momentos en que estás menos disciplinado — justo el patrón contrario al que quieres.

Estas métricas segmentadas son las que explican [por qué la mayoría de los traders pierden dinero](/blog/por-que-pierden-dinero-los-traders): no es la estrategia global, es que la ejecutan bien en unas condiciones y mal en otras — y sin datos, no saben cuáles.

---

## La métrica más ignorada: consistencia de ejecución

¿Con qué frecuencia sigues tu propio plan? ¿Cuántas veces mueves el stop-loss? ¿Cuántas veces cierras antes del objetivo por miedo?

Esta métrica no tiene nombre estándar pero es posiblemente la más importante. Un trader con una estrategia mediocre que la ejecuta consistentemente supera a un trader con una estrategia excelente que la ejecuta de forma errática.

Para medirla necesitas registrar en cada operación si seguiste el plan al 100%, si lo modificaste ligeramente o si lo rompiste. Después de 30-40 operaciones, calcula el P&L de cada categoría por separado. En casi todos los casos, las operaciones donde seguiste el plan tienen mejor rendimiento que las que modificaste.

Ese gap entre ejecución disciplinada y ejecución impulsiva es el número más importante que vas a calcular. Y solo puedes calcularlo si llevas un [diario de trading](/blog/diario-de-trading) que recoja ese dato.

---

## Cómo interpretar las métricas en conjunto

Ninguna métrica funciona en aislamiento. El cuadro completo:

- **Win rate + R:R** → te dicen si la estrategia tiene ventaja matemática
- **Profit factor** → te confirma si esa ventaja se traduce en dinero real
- **Drawdown máximo** → te dice si el riesgo es sostenible psicológicamente
- **Métricas por segmento** → te dicen en qué condiciones específicas tienes ventaja
- **Consistencia de ejecución** → te dice si el problema es la estrategia o el comportamiento

Si el profit factor es bajo pero la consistencia de ejecución es alta, el problema es la estrategia. Si el profit factor es bajo y la consistencia también, el problema es el comportamiento. Son diagnósticos completamente diferentes con soluciones completamente diferentes.

---

## Preguntas frecuentes

### ¿Qué métricas de trading son las más importantes?

Las cinco métricas fundamentales son: win rate (segmentado, no global), ratio riesgo/recompensa (calculado antes de entrar), profit factor (para evaluar la ventaja estadística real), drawdown máximo (para gestionar el riesgo de ruina) y consistencia de ejecución (para distinguir si el problema es la estrategia o el comportamiento). El P&L total no está en esta lista.

### ¿Cuál es un buen win rate en trading?

No existe un win rate "bueno" en aislamiento. Un win rate del 40% puede ser excelente si el R:R medio es 1:3. Un win rate del 70% puede ser ruinoso si el R:R medio es 1:3 invertido. Lo que importa es la combinación de ambas métricas y si el resultado da un profit factor superior a 1.5.

### ¿Qué es el profit factor y cómo se calcula?

El profit factor es la suma de todas tus ganancias dividida entre la suma de todas tus pérdidas. Un valor de 1.0 significa equilibrio. Por encima de 1.5 indica ventaja estadística real. Por encima de 2.0 es excelente. Se calcula sobre el total histórico de operaciones — cuantas más operaciones, más fiable es el número.

### ¿Cuánto drawdown máximo es aceptable?

Para trading discrecional, un drawdown máximo inferior al 20% se considera aceptable. Por encima del 30% es una señal de alarma que normalmente indica problemas de gestión del tamaño de posición. El parámetro importante no es solo el porcentaje sino si puedes sostener psicológicamente ese drawdown sin abandonar la estrategia.

---

## Conclusión

Las **métricas de trading** no son un ejercicio académico. Son la diferencia entre operar con información y operar a ciegas.

El P&L del mes te dice si ganaste o perdiste. El win rate segmentado por emoción te dice dónde está tu ventaja. El profit factor te dice si esa ventaja es real o aleatoria. El drawdown te dice si el riesgo que estás tomando es sostenible.

Con estas métricas calculadas sobre tus propios datos, tienes el mapa completo de tu trading. Sin ellas, estás pilotando sin instrumentos.

<BlogCta
  heading="El diario que detecta lo que tú no ves."
  buttonText="Probar Tradalyst gratis"
  href="/registro"
/>

---

## Artículos relacionados

- [Cómo llevar un diario de trading efectivo](/blog/diario-de-trading)
- [Por qué el 80% de los traders pierden dinero](/blog/por-que-pierden-dinero-los-traders)
- [Qué es el FOMO trading y cómo evitarlo](/blog/fomo-trading)

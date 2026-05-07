---
title: "Las métricas de trading que importan (y las que solo distraen)"
seoTitle: "Métricas Trading: Win Rate, R:R y Profit Factor"
description: "El P&L total no te dice si eres buen trader. Las métricas trading que importan: win rate, ratio R:R, profit factor y drawdown con fórmulas y ejemplos reales."
date: "2026-04-10"
lastModified: "2026-05-07"
author: "Tradalyst"
category: "performance"
keywords:
  - "métricas de trading"
  - "métricas trading"
  - "win rate trading"
  - "ratio riesgo beneficio"
  - "profit factor trading"
  - "drawdown máximo"
  - "análisis de operaciones"
readTime: 12
lang: "es"
hreflang:
  es: "/blog/metricas-trading"
  en: "/en/blog/metricas-trading"
featuredImage: "/images/blog/metricas-trading.webp"
featuredImageAlt: "Dashboard con métricas de trading — win rate, drawdown y profit factor — Tradalyst"
---

El análisis de **métricas trading** empieza, para la mayoría de los traders, con la pregunta equivocada: ¿cuánto gané este mes? El P&L total no te dice si eres buen trader. Solo te dice si ganaste o perdiste dinero en un período concreto.

Un trader puede ganar dinero en un mes con una estrategia que tiene un ratio riesgo/recompensa negativo, simplemente porque tuvo suerte en unas pocas operaciones grandes. Esa estrategia lo arruinará en seis meses. Otro trader puede perder dinero en un mes con una estrategia estadísticamente sólida, simplemente porque el mercado estuvo en un régimen desfavorable para su setup. Esa estrategia lo hará rentable a largo plazo si la ejecuta con consistencia.

Para distinguir entre los dos necesitas **métricas de trading** que vayan más allá del P&L: win rate segmentado, ratio R:R, profit factor, drawdown máximo y consistencia de ejecución.

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

## Ratio Riesgo/Recompensa (R:R) en las métricas trading

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

<MetricsTable />

---

## Las 5 métricas trading que debes calcular cada semana

Calcular las métricas una vez al mes es insuficiente. El mercado cambia, tu ejecución cambia, y el análisis semanal es lo que te permite detectar deterioros antes de que se conviertan en pérdidas significativas.

Estas son las cinco **métricas trading** que debes calcular cada lunes con los datos de la semana anterior:

**1. Win Rate semanal**

Fórmula: (Operaciones ganadoras / Total operaciones) × 100

Ejemplo: 12 operaciones, 7 ganadoras → Win Rate = **58.3%**

Umbral de alerta: si el win rate semanal cae más de 15 puntos por debajo de tu media histórica durante dos semanas consecutivas, algo ha cambiado en el mercado o en tu ejecución. Actúa antes de que el daño sea mayor.

**2. Ratio R:R realizado**

Fórmula: Ganancia media / Pérdida media (calculado sobre las operaciones cerradas de la semana)

Ejemplo: 7 ganadoras suman €840 (€120 de media) y 5 perdedoras suman €400 (€80 de media) → R:R realizado = **1.5:1**

Si el R:R realizado es sistemáticamente inferior al planificado, estás cerrando ganadoras demasiado pronto o aguantando perdedoras demasiado tiempo. Ambos son errores de ejecución, no de estrategia.

**3. Profit Factor semanal**

Fórmula: Suma de todas las ganancias brutas / Suma de todas las pérdidas brutas

Ejemplo: €840 ganancias / €400 pérdidas = **Profit Factor 2.1**

Con menos de 20 operaciones en la semana, el profit factor es ruidoso estadísticamente. Úsalo para detectar tendencias a lo largo de varias semanas, no para sacar conclusiones de una semana aislada.

**4. Drawdown máximo intra-semana**

Fórmula: (Pico de capital más alto de la semana − Valle mínimo) / Pico × 100

Ejemplo: cuenta en €11.200 el martes, baja a €10.400 el jueves → Drawdown = **7.1%**

Si el drawdown intra-semana supera el 5% de forma consistente, estás tomando demasiado riesgo por operación o acumulando posiciones en días de concentración baja.

**5. Valor Esperado por operación**

Fórmula: (Win Rate × Ganancia media) − (Loss Rate × Pérdida media)

Ejemplo: (0.583 × €120) − (0.417 × €80) = €69.96 − €33.36 = **+€36.6 por operación**

Un valor esperado positivo confirma que tu ventaja estadística es real. Si el EV semanal es negativo de forma consistente, la estrategia no tiene ventaja — independientemente de si alguna semana fue rentable por azar.

<MdxImage src="/images/blog/metricas-trading-dashboard.webp" alt="Dashboard mostrando métricas clave de trading: win rate, ratio R:R y profit factor semana a semana" width="800" height="450" caption="Un dashboard de métricas trading eficaz muestra la tendencia de cada indicador a lo largo del tiempo, no solo el valor puntual de la última semana." />

---

## Profit Factor (Factor de Beneficio)

El profit factor es el cociente entre las ganancias brutas totales y las pérdidas brutas totales:

**Profit Factor = Suma de todas las ganancias / Suma de todas las pérdidas**

Un profit factor de 1.0 significa equilibrio exacto. Por encima de 1.5 ya indica una estrategia con ventaja estadística real. Por encima de 2.0 es excelente para trading discrecional.

Esta **métrica de trading** es más robusta que el win rate porque incorpora tanto la frecuencia como la magnitud de las operaciones. Puedes tener un win rate del 35% con un profit factor de 2.2 — y eso es una estrategia sólida.

El profit factor también es más resistente al cherry-picking que el P&L. Si alguien te dice "mi estrategia gana dinero", pídele el profit factor calculado sobre las últimas 100 operaciones. Un número honesto.

<BlogCta heading="¿Quieres ver tus métricas calculadas automáticamente?" buttonText="Empieza gratis" href="/registro" />

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

## Cómo interpretar tu ratio R:R cuando el mercado cambia

El ratio R:R no es un número fijo — debe ajustarse cuando cambia el régimen de mercado.

**En mercados en tendencia:** Los objetivos se pueden extender. Cuando el precio tiene momentum claro, un R:R de 1:3 o 1:4 es alcanzable porque el precio tiene inercia. En estos contextos, mover el stop a break-even demasiado pronto es el error más habitual — reduces el R:R realizado en exactamente las operaciones más favorables.

**En mercados laterales:** Los objetivos deben reducirse. Cuando el precio está en un rango, un R:R de 1:1.5 es más realista porque el precio tiene más probabilidades de girar antes de alcanzar un objetivo amplio. Forzar R:R de 1:3 en un mercado lateral resulta en operaciones que casi llegan al objetivo y luego invierten, convirtiendo ganadoras potenciales en perdedoras.

**El impacto de la volatilidad:** En períodos de alta volatilidad (eventos macro, noticias), el stop debe ampliarse para absorber el ruido. Si amplías el stop sin reducir el tamaño de posición para mantener el mismo riesgo monetario, el R:R matemático cae pero el riesgo real no cambia.

**La regla práctica:** Si el régimen de mercado de esta semana es diferente al de las últimas cuatro, revisa tus **métricas de trading** por régimen antes de asumir que cualquier deterioro es de ejecución. Puede ser simplemente que el mercado cambió y tu sistema está diseñado para otro entorno.

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

## Errores comunes al calcular métricas de trading

La mayoría de los traders que empiezan a medir sus **métricas trading** cometen los mismos errores sistemáticos. Conocerlos es la mitad del trabajo.

**1. Calcular el win rate global en lugar de por setup**

Un win rate del 52% calculado sobre todos tus trades mezcla estrategias, activos y condiciones de mercado completamente diferentes. Un win rate del 68% en tu setup de reversión y un 34% en tu setup de ruptura son dos diagnósticos completamente diferentes — pero el número global no te muestra ninguno de los dos.

**2. Calcular el R:R después de cerrar la operación**

El R:R debe definirse antes de entrar. Si lo calculas después, estás racionalizando una decisión ya tomada. El R:R realizado (post-trade) sí es útil para compararlo con el planificado — pero el que determina si entras o no siempre es el de antes de ejecutar.

**3. No incluir comisiones y spreads en el profit factor**

Si calculas el profit factor con los P&L brutos, el número es artificialmente alto. Con operaciones frecuentes en intraday, el coste de comisiones puede reducir el profit factor real en 0.1-0.3 puntos — suficiente para convertir una estrategia marginalmente positiva en una perdedora.

**4. Sacar conclusiones con menos de 30 operaciones**

Con 20 operaciones, cualquier métrica es ruido estadístico. Necesitas al menos 30-50 operaciones para que las métricas sean significativas. Un profit factor de 2.0 sobre 12 operaciones no significa nada concreto. El mismo número sobre 150 operaciones sí lo significa.

**5. Mezclar resultados en demo con resultados en real**

La psicología en demo es diferente. Los stops son más fáciles de respetar cuando el dinero no es real. Las métricas demo y real nunca deben mezclarse en el mismo dataset — los números resultantes no describen ninguno de los dos casos con fidelidad.

---

## Herramientas para calcular tus métricas automáticamente

Calcular las **métricas trading** a mano en una hoja de cálculo es posible, pero introduce fricción y errores que terminan por hacer que dejes de hacerlo.

**Hoja de cálculo manual (Excel / Google Sheets)**

El punto de partida para la mayoría. Funciona, pero requiere introducir los datos manualmente y construir las fórmulas. El riesgo real es que el proceso se vuelve tedioso y terminas no haciéndolo de forma consistente.

**Exportación del bróker + hoja de cálculo**

Más rápido. Muchos brókeres permiten exportar el historial de operaciones en CSV. Con ese CSV puedes calcular las métricas automáticamente — pero sigues necesitando construir y mantener las fórmulas, y la segmentación por estado emocional requiere trabajo manual adicional.

**Software especializado con métricas integradas**

Herramientas como [Tradalyst](/registro) calculan todas las métricas automáticamente a partir de tus operaciones registradas, sin fórmulas manuales. Además, segmentan por estado emocional, por activo y por franja horaria — que es donde está el análisis más valioso. El análisis con IA identifica los patrones que un spreadsheet no puede detectar: la correlación entre tu estado emocional y tu win rate, los horarios donde tu ejecución se deteriora, los setups que funcionan en tendencia pero fallan en rango.

La diferencia entre calcular métricas a mano y tenerlas calculadas automáticamente no es solo de comodidad — es de consistencia. Las métricas que calculas de forma sistemática son las que mejoran tu trading. Las que calculas solo cuando te acuerdas no cambian nada.

<MdxImage src="/images/blog/metricas-trading-analisis.webp" alt="Trader analizando sus estadísticas de trading en una hoja de cálculo con métricas de win rate y profit factor" width="800" height="450" caption="El análisis manual funciona, pero la fricción es la razón por la que la mayoría de los traders deja de hacerlo después de unas semanas. La automatización elimina esa barrera." />

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

## Preguntas frecuentes sobre métricas trading

### ¿Qué métricas son más importantes en trading?

Las cinco métricas fundamentales son: win rate segmentado (no global), ratio riesgo/recompensa calculado antes de entrar, profit factor para evaluar la ventaja estadística real, drawdown máximo para gestionar el riesgo de ruina, y consistencia de ejecución para distinguir si el problema es la estrategia o el comportamiento. El P&L total no está en esta lista porque no diagnostica nada por sí solo: solo describe el resultado, no las causas.

### ¿Cómo se calcula el ratio riesgo beneficio?

El ratio riesgo/beneficio se calcula dividiendo la ganancia potencial entre el riesgo asumido. Fórmula: R:R = (Precio objetivo − Precio entrada) / (Precio entrada − Stop loss). Si tu stop está a 40 puntos de la entrada y tu objetivo a 80 puntos, el R:R es 1:2. Este cálculo debe hacerse siempre antes de entrar — el R:R calculado después del resultado no sirve para tomar la decisión de entrada.

### ¿Qué es el profit factor en trading?

El profit factor es la suma de todas tus ganancias brutas dividida entre la suma de todas tus pérdidas brutas. Un valor de 1.0 significa equilibrio exacto. Por encima de 1.5 indica ventaja estadística real. Por encima de 2.0 es excelente para trading discrecional. Se calcula sobre el total histórico de operaciones — cuantas más operaciones incluyas, más fiable es el número resultante.

### ¿Cuántas operaciones necesito para tener estadísticas fiables?

Para que las métricas trading sean estadísticamente significativas necesitas un mínimo de 30 operaciones — aunque 50-100 es lo ideal. Con menos de 30, el win rate y el profit factor pueden fluctuar enormemente por puro azar. Un profit factor de 2.5 sobre 15 operaciones no significa nada concreto. El mismo número sobre 100 operaciones es una señal sólida. En la práctica, necesitas entre 1 y 3 meses de trading activo antes de poder hacer diagnósticos fiables sobre tu estrategia.

### ¿Qué win rate necesito para ser rentable?

Depende de tu ratio R:R. La fórmula del punto de equilibrio es: Win Rate mínimo = 1 / (1 + R:R). Con R:R 1:1, necesitas ganar el 50%. Con R:R 1:2, necesitas ganar el 33%. Con R:R 1:3, basta con ganar el 25%. Esto significa que puedes perder el 75% de tus operaciones y seguir siendo rentable si tu R:R medio es 1:3. El problema es que un R:R alto requiere más paciencia para mantener las posiciones abiertas — psicológicamente más difícil, pero matemáticamente más eficiente.

---

## Conclusión

Las **métricas trading** no son un ejercicio académico. Son la diferencia entre operar con información y operar a ciegas.

El P&L del mes te dice si ganaste o perdiste. El win rate segmentado por emoción te dice dónde está tu ventaja. El profit factor te dice si esa ventaja es real o aleatoria. El drawdown te dice si el riesgo que estás tomando es sostenible.

Con estas métricas calculadas sobre tus propios datos, tienes el mapa completo de tu trading. Sin ellas, estás pilotando sin instrumentos.

<BlogCta heading="El diario que detecta lo que tú no ves." buttonText="Probar Tradalyst gratis" href="/registro" />

---

## Artículos relacionados

- [Cómo llevar un diario de trading efectivo](/blog/diario-de-trading)
- [Por qué el 80% de los traders pierden dinero](/blog/por-que-pierden-dinero-los-traders)
- [Qué es el FOMO trading y cómo evitarlo](/blog/fomo-trading)

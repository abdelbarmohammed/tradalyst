---
title: "Gestión de capital en trading: cómo calcular el tamaño de cada operación"
seoTitle: "Gestión de Capital en Trading: Cómo Calcular el Tamaño | Tradalyst"
description: "La gestión de capital es la habilidad más ignorada y más importante del trading retail. Aquí está la mecánica exacta de cómo calcular el tamaño de posición para proteger tu cuenta."
date: "2026-04-15"
lastModified: "2026-04-29"
author: "Tradalyst"
category: "risk"
keywords:
  - "gestión de capital trading"
  - "tamaño de posición trading"
  - "position sizing"
  - "cuánto arriesgar en trading"
  - "gestión del riesgo trading"
readTime: 9
lang: "es"
hreflang:
  es: "/blog/gestion-de-capital"
  en: "/en/blog/position-sizing"
featuredImage: "/images/blog/gestion-de-capital.webp"
featuredImageAlt: "Diagrama mostrando el cálculo del tamaño de posición en una operación de trading — Tradalyst"
---

La **gestión de capital** es la habilidad más ignorada del trading retail y, a la vez, la más importante para la supervivencia a largo plazo de cualquier cuenta.

Traders que pasan semanas perfeccionando sus entradas y sus indicadores técnicos dedican un día — o ninguno — a pensar en cuánto arriesgar por operación. Ese desequilibrio es uno de los motivos principales por los que cuentas con buenos sistemas de entrada igualmente quiebran.

La paradoja del trading es que puedes tener razón en el análisis más del 60% de las veces y aun así perder dinero, si el tamaño de tus operaciones perdedoras es desproporcionadamente mayor que el de las ganadoras. Y puedes tener un sistema con un win rate del 40% que sea consistentemente rentable, si la relación entre ganancias y pérdidas está calibrada correctamente.

El tamaño de posición es la variable que controla esa relación.

---

## El principio del riesgo fijo por operación

El principio más robusto de gestión de capital se llama **riesgo porcentual fijo**: decides de antemano qué porcentaje máximo de tu cuenta estás dispuesto a perder en una sola operación, y calculas el tamaño de la posición a partir de ese porcentaje y de dónde está tu stop-loss.

La regla del 1% — no arriesgar más del 1% del capital en ninguna operación individual — es el estándar más común en trading profesional por una razón matemática simple: protege la cuenta de las rachas perdedoras inevitables sin importar su duración.

Con una regla del 1%, una racha de 10 pérdidas consecutivas te cuesta aproximadamente el 9.5% de la cuenta (efecto compuesto). Con una regla del 5%, la misma racha te cuesta el 40%. Con una regla del 10%, te cuesta el 65%.

Las rachas de 10 pérdidas consecutivas no son raras. En un sistema con win rate del 55%, una racha de 10 pérdidas seguidas ocurre estadísticamente cada 500 operaciones aproximadamente — varias veces al año para un trader activo. La pregunta no es si ocurrirá, sino si tu cuenta sobrevivirá cuando ocurra.

---

## La fórmula de cálculo del tamaño de posición

El cálculo tiene tres variables:

1. **Capital total de la cuenta** — el valor actual de tu cuenta de trading
2. **Riesgo por operación en €/\$** — el porcentaje de riesgo elegido aplicado al capital
3. **Riesgo por unidad** — la diferencia entre tu precio de entrada y tu stop-loss, expresada en euros/dólares por unidad del instrumento

La fórmula es:

```
Tamaño de posición = Riesgo por operación (€) ÷ Riesgo por unidad (€/unidad)
```

**Ejemplo práctico en acciones:**

- Capital de cuenta: 10.000€
- Riesgo por operación: 1% = 100€
- Entrada en XYZ: 50€ por acción
- Stop-loss: 47€ por acción
- Riesgo por acción: 50€ − 47€ = 3€/acción

Tamaño de posición = 100€ ÷ 3€/acción = **33 acciones**

El resultado: si el precio cae hasta tu stop a 47€, pierdes exactamente 33 × 3€ = 99€ — aproximadamente el 1% del capital. Si el precio sube a 56€ (objetivo 1:2), ganas 33 × 6€ = 198€.

<RiskRewardDiagram />

**Ejemplo en forex:**

- Capital de cuenta: 10.000€
- Riesgo por operación: 1% = 100€
- Par: EUR/USD, entrada a 1.0850
- Stop-loss: 1.0820 (30 pips)
- Valor del pip para 1 lote estándar (100.000 unidades): 10 USD ≈ 9.20€

Riesgo por lote = 30 pips × 9.20€ = 276€/lote

Tamaño de posición = 100€ ÷ 276€/lote = **0.36 lotes** (redondeado a 0.35 lotes)

El mismo proceso se aplica a cualquier instrumento — futuros, CFDs, criptomonedas. La variable clave siempre es el riesgo por unidad, que depende de dónde coloques el stop-loss.

---

## El error más común: tamaño fijo en lugar de riesgo fijo

El error de gestión de capital más frecuente en traders retail es usar tamaño de posición fijo — siempre 100 acciones, siempre 0.1 lotes — independientemente de dónde esté el stop-loss.

El problema es que el riesgo real varía enormemente según la distancia al stop. Una operación con un stop de 10 pips y otra con un stop de 50 pips con el mismo tamaño de 0.1 lotes implican riesgos completamente distintos: 10€ vs 50€ con los valores de pip estándar.

Con tamaño fijo, tus operaciones con stops más anchos arriesgan cinco veces más que las de stops estrechos — sin ninguna razón estratégica para esa asimetría. El resultado es que el rendimiento global de la cuenta depende desproporcionadamente de unas pocas operaciones con stops anchos, lo que introduce volatilidad arbitraria en la curva de capital.

Con riesgo fijo, cada operación arriesga el mismo porcentaje del capital, independientemente del instrumento o del timeframe. La curva de capital se vuelve más suave y más predecible, y el rendimiento refleja más fielmente la calidad del sistema de trading.

---

## Ajuste del riesgo según contexto

La regla del porcentaje fijo es el punto de partida, no el límite de lo que puedes hacer con la gestión de capital. Hay dos ajustes razonables que pueden mejorar los resultados:

**Reducir el riesgo en condiciones desfavorables.** En periodos de alta volatilidad de mercado, cuando tus últimas 10 operaciones han tenido win rate muy inferior al histórico, o en instrumentos o setups con los que tienes menos experiencia, reducir el riesgo al 0.5% por operación es una decisión razonable. No porque el sistema haya dejado de funcionar, sino porque la incertidumbre es mayor y la gestión del riesgo debe reflejarla.

**Aumentar el riesgo gradualmente en condiciones muy favorables.** Algunos sistemas permiten aumentar el riesgo por operación hasta el 1.5% o 2% cuando el rendimiento reciente es consistentemente superior a la media histórica. Este enfoque, llamado "Kelly fraccionado", intenta capturar más upside cuando la probabilidad parece más alta. Sin embargo, requiere mucha historia de datos para implementarse correctamente y es fácil de abusar — para la mayoría de los traders, mantenerse en 1% fijo es la decisión correcta.

---

## La relación entre tamaño de posición y ratio riesgo/recompensa

El tamaño de posición y el [ratio riesgo/recompensa](/blog/ratio-riesgo-beneficio) trabajan juntos para determinar la expectativa de un sistema de trading.

La expectativa por operación se calcula así:

```
Expectativa = (Win rate × Ganancia media) − (Loss rate × Pérdida media)
```

Si tu win rate es del 45% y tu ratio ganancia/pérdida media es 2:1:

```
Expectativa = (0.45 × 2R) − (0.55 × 1R) = 0.90R − 0.55R = +0.35R por operación
```

Donde R es el riesgo por operación en euros. Con un riesgo de 100€ por operación, tienes una expectativa de +35€ por operación.

Esto revela algo importante: incluso con un win rate del 45% — que suena como "perder más de la mitad de las veces" — el sistema es rentable mientras que el ratio ganancia/pérdida sea suficientemente favorable.

La gestión de capital no puede convertir un sistema con expectativa negativa en rentable. Pero puede multiplicar el rendimiento de un sistema con expectativa positiva y puede determinar si la cuenta sobrevive largo suficiente para que ese rendimiento se materialice.

<BlogCta
  heading="¿Estás calibrando correctamente el riesgo en cada operación?"
  buttonText="Analiza tus operaciones gratis"
  href="/registro"
/>

---

## Gestión de capital y psicología: el tamaño que puedes aguantar

Hay una dimensión psicológica en la gestión de capital que los libros de trading raramente abordan: el tamaño de posición correcto no es solo el que maximiza la expectativa matemática, sino el que puedes mantener sin que afecte a tu toma de decisiones.

Una operación que representa el 5% de tu capital es muy difícil de gestionar emocionalmente, aunque matemáticamente sea "aceptable" para algunos sistemas. Cuando el precio va en contra 20-30 pips, la presión psicológica de ver fluctuar una cantidad significativa afecta directamente a las decisiones de gestión: se mueve el stop, se cierra prematuramente, o se aguanta más de la cuenta esperando la recuperación.

El mejor tamaño de posición es el que te permite seguir el plan sin alteraciones emocionales significativas. Para muchos traders empezando, eso es el 0.5% o incluso menos — no porque sea matemáticamente óptimo, sino porque es el tamaño al que pueden aprender a operar correctamente antes de escalar.

La regla práctica: si una operación abierta en pérdida ocupa una parte significativa de tu atención mental durante el día, el tamaño es demasiado grande para tu estado actual de desarrollo.

---

## Preguntas frecuentes

### ¿Cuánto debo arriesgar por operación?

Para traders retail con cuentas de menos de 50.000€ y menos de dos años de experiencia consistente, 1% es el máximo razonable. Muchos traders con experiencia que han estudiado sus métricas históricas se mantienen en 0.5-0.75% incluso con cuentas establecidas. El porcentaje óptimo depende de la volatilidad de tu sistema, tu drawdown máximo histórico y tu tolerancia emocional al riesgo.

### ¿El stop-loss afecta al tamaño de posición?

Sí, directamente. Un stop-loss más ancho con el mismo riesgo en euros resulta en un tamaño de posición más pequeño. Un stop-loss más estrecho resulta en un tamaño mayor. Por eso la ubicación del stop-loss debe determinarse por el análisis técnico — dónde está el nivel que invalida el setup — y no por cuánto se quiere arriesgar. El tamaño de posición se ajusta al stop, no al revés.

### ¿Debo usar el mismo porcentaje de riesgo en todas las operaciones?

Un porcentaje fijo para todas las operaciones es la base. Desde ahí puedes ajustar según el nivel de convicción, la volatilidad del instrumento o el rendimiento reciente — pero esos ajustes deben estar definidos en reglas, no decididos en el momento. La improvisación en gestión de capital tiende a aumentar el riesgo precisamente cuando debería disminuir.

### ¿Qué pasa si mi cuenta es pequeña (menos de 1.000€)?

Con cuentas muy pequeñas, el 1% por operación es 10€ — lo que puede resultar en tamaños de posición mínimos o inferiores a los mínimos del broker. En ese caso, la solución no es aumentar el porcentaje de riesgo, sino aceptar que con una cuenta de 1.000€ el objetivo es aprender el sistema y escalar cuando se tenga experiencia consistente. Muchos traders con cuentas pequeñas cometen el error de arriesgar el 5-10% por operación para "que valga la pena" — y quiebran la cuenta antes de tener suficiente historia para saber si el sistema funciona.

---

## Conclusión

La **gestión de capital** no es la parte emocionante del trading. No genera alertas en Telegram, no tiene configuraciones complejas, y no hay un indicador que la optimice. Es simplemente una fórmula que se aplica antes de cada operación.

Pero es la diferencia entre un trader cuya cuenta sobrevive a las rachas inevitables y uno cuya cuenta quiebra en el momento estadísticamente más normal del proceso de aprendizaje.

Calcula tu riesgo por operación. Define tus stops por análisis técnico. Aplica la fórmula. Repite.

<BlogCta
  heading="El diario que detecta lo que tú no ves."
  buttonText="Probar Tradalyst gratis"
  href="/registro"
/>

---

## Artículos relacionados

- [Ratio riesgo/beneficio: la métrica que define si un sistema es rentable](/blog/ratio-riesgo-beneficio)
- [Las métricas de trading que todo trader debe conocer](/blog/metricas-trading)
- [Por qué el 80% de los traders pierden dinero](/blog/por-que-pierden-dinero-los-traders)

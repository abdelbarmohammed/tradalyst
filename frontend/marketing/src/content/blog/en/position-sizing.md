---
title: "Position Sizing in Trading: The Rule That Protects Your Account"
seoTitle: "Position Sizing in Trading: How to Calculate Your Trade Size | Tradalyst"
description: "Position sizing is the most ignored and most important skill in retail trading. Here is the exact mechanics of how to calculate trade size to protect your account long-term."
date: "2026-04-15"
lastModified: "2026-04-29"
author: "Tradalyst"
category: "risk"
keywords:
  - "position sizing"
  - "position sizing trading"
  - "how to calculate position size"
  - "risk management trading"
  - "1 percent rule trading"
readTime: 9
lang: "en"
hreflang:
  es: "/blog/gestion-de-capital"
  en: "/en/blog/position-sizing"
featuredImage: "/images/blog/gestion-de-capital.webp"
featuredImageAlt: "Diagram showing position size calculation for a trading entry — Tradalyst"
---

**Position sizing** is the most ignored skill in retail trading and, at the same time, the most important one for the long-term survival of any account.

Traders spend weeks perfecting their entries and technical indicators but spend a day — or none at all — thinking about how much to risk per trade. That imbalance is one of the main reasons accounts with good entry systems still blow up.

The trading paradox is this: you can be right on analysis more than 60% of the time and still lose money, if your losing trades are disproportionately larger than your winning ones. And you can run a system with a 40% win rate that is consistently profitable, if the relationship between wins and losses is correctly calibrated.

Position sizing is the variable that controls that relationship.

---

## The Fixed Risk Principle

The most robust position sizing principle is called **fixed percentage risk**: you decide in advance what maximum percentage of your account you're willing to lose on a single trade, and you calculate the position size from that percentage and where your stop-loss sits.

The 1% rule — never risk more than 1% of capital on any single trade — is the most common standard in professional trading for a simple mathematical reason: it protects the account from inevitable losing streaks regardless of their length.

With a 1% rule, a streak of 10 consecutive losses costs approximately 9.5% of the account (compound effect). With a 5% rule, the same streak costs 40%. With a 10% rule, it costs 65%.

Streaks of 10 consecutive losses aren't rare. In a system with a 55% win rate, a streak of 10 consecutive losses occurs statistically roughly once every 500 trades — several times a year for an active trader. The question is not whether it will happen, but whether your account will survive when it does.

---

## The Position Size Formula

The calculation has three variables:

1. **Total account capital** — the current value of your trading account
2. **Risk per trade in £/$** — your chosen risk percentage applied to capital
3. **Risk per unit** — the difference between your entry price and stop-loss, expressed in pounds/dollars per unit of the instrument

The formula is:

```
Position Size = Risk Per Trade (£) ÷ Risk Per Unit (£/unit)
```

**Practical example in stocks:**

- Account capital: £10,000
- Risk per trade: 1% = £100
- Entry on XYZ: £50 per share
- Stop-loss: £47 per share
- Risk per share: £50 − £47 = £3/share

Position size = £100 ÷ £3/share = **33 shares**

The result: if price falls to your stop at £47, you lose exactly 33 × £3 = £99 — approximately 1% of capital. If price rises to £56 (1:2 target), you make 33 × £6 = £198.

<RiskRewardDiagram />

**Forex example:**

- Account capital: £10,000
- Risk per trade: 1% = £100
- Pair: EUR/USD, entry at 1.0850
- Stop-loss: 1.0820 (30 pips)
- Pip value for 1 standard lot (100,000 units): $10 ≈ £7.90

Risk per lot = 30 pips × £7.90 = £237/lot

Position size = £100 ÷ £237/lot = **0.42 lots** (rounded to 0.40 lots)

The same process applies to any instrument — futures, CFDs, crypto. The key variable is always the risk per unit, which depends on where you place the stop-loss.

---

## The Most Common Error: Fixed Size Instead of Fixed Risk

The most frequent position sizing error in retail trading is using a fixed position size — always 100 shares, always 0.1 lots — regardless of where the stop-loss sits.

The problem is that actual risk varies enormously based on stop distance. A trade with a 10-pip stop and another with a 50-pip stop at the same 0.1-lot size imply completely different risks: £7.90 vs £39.50 at standard pip values.

With fixed size, your trades with wider stops risk five times more than those with tight stops — with no strategic reason for that asymmetry. The result is that overall account performance depends disproportionately on a few trades with wide stops, introducing arbitrary volatility into the equity curve.

With fixed risk, every trade risks the same percentage of capital regardless of instrument or timeframe. The equity curve becomes smoother and more predictable, and performance more faithfully reflects the quality of the trading system.

---

## Adjusting Risk Based on Context

The fixed percentage rule is the starting point, not the limit of what you can do with position sizing. There are two reasonable adjustments that can improve results:

**Reduce risk in unfavourable conditions.** During periods of high market volatility, when your last 10 trades have had a win rate significantly below historical, or with instruments or setups you have less experience with, reducing risk to 0.5% per trade is a reasonable decision. Not because the system has stopped working, but because uncertainty is higher and risk management should reflect that.

**Gradually increase risk in highly favourable conditions.** Some systems allow increasing risk per trade to 1.5% or 2% when recent performance is consistently above historical average. This approach, called "fractional Kelly," attempts to capture more upside when probability appears higher. However, it requires extensive data history to implement correctly and is easy to abuse — for most traders, staying at a fixed 1% is the right decision.

---

## The Link Between Position Sizing and Risk/Reward Ratio

Position sizing and the [risk/reward ratio](/en/blog/ratio-riesgo-beneficio) work together to determine the expectancy of a trading system.

Expectancy per trade is calculated as:

```
Expectancy = (Win Rate × Average Win) − (Loss Rate × Average Loss)
```

If your win rate is 45% and your average win/loss ratio is 2:1:

```
Expectancy = (0.45 × 2R) − (0.55 × 1R) = 0.90R − 0.55R = +0.35R per trade
```

Where R is the risk per trade in pounds. With a £100 risk per trade, you have an expectancy of +£35 per trade.

This reveals something important: even with a 45% win rate — which sounds like "losing more than half the time" — the system is profitable as long as the win/loss ratio is sufficiently favourable.

Position sizing can't turn a negative-expectancy system profitable. But it can multiply the returns of a positive-expectancy system and can determine whether the account survives long enough for those returns to materialise.

<BlogCta
  heading="Are you sizing your trades correctly on every entry?"
  buttonText="Analyse your trades free"
  href="/registro"
/>

---

## Position Sizing and Psychology: The Size You Can Hold

There's a psychological dimension to position sizing that trading books rarely address: the right position size isn't only the one that maximises mathematical expectancy — it's the one you can hold without it affecting your decision-making.

A trade representing 5% of your capital is very difficult to manage emotionally, even if it's mathematically "acceptable" for some systems. When price moves against you 20-30 pips, the psychological pressure of watching a meaningful amount fluctuate directly affects management decisions: the stop gets moved, the trade gets closed early, or it gets held beyond the plan waiting for recovery.

The best position size is the one that lets you follow the plan without significant emotional interference. For many new traders, that's 0.5% or even less — not because it's mathematically optimal, but because it's the size at which they can learn to trade correctly before scaling.

The practical rule: if an open trade in loss is occupying a significant portion of your mental attention during the day, the size is too large for your current stage of development.

---

## Frequently Asked Questions

### How much should I risk per trade?

For retail traders with accounts under £50,000 and less than two years of consistent experience, 1% is the reasonable maximum. Many experienced traders who have studied their historical metrics stay at 0.5-0.75% even with established accounts. The optimal percentage depends on your system's volatility, historical maximum drawdown, and emotional risk tolerance.

### Does stop placement affect position size?

Yes, directly. A wider stop-loss with the same risk in pounds results in a smaller position size. A tighter stop-loss results in a larger size. That's why stop-loss placement must be determined by technical analysis — where is the level that invalidates the setup — not by how much you want to risk. Position size adjusts to the stop, not the other way around.

### Should I use the same risk percentage on all trades?

A fixed percentage for all trades is the baseline. From there you can adjust based on conviction level, instrument volatility, or recent performance — but those adjustments must be defined in rules, not decided in the moment. Improvising on position sizing tends to increase risk precisely when it should decrease.

### What if my account is small (under £1,000)?

With very small accounts, 1% per trade is £10 — which can result in position sizes at or below broker minimums. In that case, the solution isn't to increase the risk percentage, but to accept that with a £1,000 account the goal is learning the system and scaling once consistent experience is established. Many traders with small accounts make the mistake of risking 5-10% per trade to "make it worth it" — and blow the account before having enough history to know whether the system works.

---

## Conclusion

**Position sizing** isn't the exciting part of trading. It doesn't generate Telegram alerts, it doesn't have complex configurations, and there's no indicator that optimises it. It's simply a formula applied before each trade.

But it's the difference between a trader whose account survives the inevitable losing streaks and one whose account blows up at the statistically most normal moment in the learning process.

Calculate your risk per trade. Set your stops by technical analysis. Apply the formula. Repeat.

<BlogCta
  heading="The journal that detects what you can't see."
  buttonText="Try Tradalyst free"
  href="/registro"
/>

---

## Related Articles

- [Risk/Reward Ratio: The Metric That Defines Whether a System Is Profitable](/en/blog/ratio-riesgo-beneficio)
- [Trading Metrics Every Trader Should Know](/en/blog/metricas-trading)
- [Why 80% of Traders Lose Money](/en/blog/why-do-traders-lose-money)

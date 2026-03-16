-- ============================================
-- Tradalyst — Seed Reference Data
-- For documentation/reference only.
-- Do NOT run this file against production.
-- Date: 2026-05-08
-- ============================================
-- Passwords below are hashed with Django's
-- PBKDF2-SHA256 (not plain-text).
-- ============================================

-- ── users_customuser ─────────────────────────────────────────────────────────

INSERT INTO public.users_customuser
    (email, password, display_name, bio, role, is_active, is_staff, is_superuser,
     date_joined, onboarding_completed, plan, theme_preference, language_preference,
     pinned_assets, stripe_customer_id, trial_ends_at)
VALUES
    ('alex@tradalyst.com',
     'pbkdf2_sha256$600000$salt1$hashedpassword1==',
     'Alex Trader', 'Crypto & forex trader based in Madrid.', 'trader',
     TRUE, FALSE, FALSE,
     '2026-01-15 10:00:00+00', TRUE, 'pro', 'dark', 'es',
     '["BTC/USDT","ETH/USDT","EUR/USD"]', '', NULL),

    ('sara@tradalyst.com',
     'pbkdf2_sha256$600000$salt2$hashedpassword2==',
     'Sara López', 'Forex day trader. 3 years of experience.', 'trader',
     TRUE, FALSE, FALSE,
     '2026-02-01 09:30:00+00', TRUE, 'free', 'light', 'es',
     '["EUR/USD","GBP/USD"]', '', NULL),

    ('mentor@tradalyst.com',
     'pbkdf2_sha256$600000$salt3$hashedpassword3==',
     'Carlos Mentor', 'Professional trader and coach.', 'mentor',
     TRUE, FALSE, FALSE,
     '2026-01-20 08:00:00+00', TRUE, 'pro', 'light', 'es',
     '[]', '', NULL);


-- ── trades_trade ─────────────────────────────────────────────────────────────

INSERT INTO public.trades_trade
    (user_id, pair, direction, entry_price, exit_price, quantity,
     entry_time, exit_time, pnl, risk_reward_ratio,
     result, emotion, notes, created_at, updated_at)
VALUES
    (1, 'BTC/USDT', 'long', 42500.00000000, 44200.00000000, 0.10000000,
     '2026-01-20 09:15:00+00', '2026-01-20 14:30:00+00', 170.00000000, 2.5000,
     'win', 'confident',
     'Breakout above resistance at 42k. Strong volume confirmation. Held through minor dip at noon.',
     '2026-01-20 09:15:00+00', '2026-01-20 14:30:00+00'),

    (1, 'EUR/USD', 'short', 1.08540000, 1.09100000, 10000.00000000,
     '2026-02-03 11:00:00+00', '2026-02-03 16:45:00+00', -56.00000000, 0.8000,
     'loss', 'fomo',
     'Entered too late after the move already happened. Should have waited for a pullback.',
     '2026-02-03 11:00:00+00', '2026-02-03 16:45:00+00'),

    (2, 'GBP/USD', 'long', 1.26300000, 1.26850000, 5000.00000000,
     '2026-02-10 08:30:00+00', '2026-02-10 13:00:00+00', 27.50000000, 2.2000,
     'win', 'calm',
     'Clean setup on 4H chart. Entered at the 50 EMA bounce. Target hit without stress.',
     '2026-02-10 08:30:00+00', '2026-02-10 13:00:00+00');


-- ── analysis_aiinsight ────────────────────────────────────────────────────────

INSERT INTO public.analysis_aiinsight
    (user_id, content, period_start, period_end, trade_count, created_at)
VALUES
    (1,
     'Durante la semana del 20 al 26 de enero registraste 8 operaciones con un win rate del 62.5%. Tu mejor rendimiento ocurrió los martes entre las 9h y las 13h. Las 3 operaciones marcadas como FOMO tuvieron un win rate del 0% y generaron el 80% de tus pérdidas. Considera esperar confirmación adicional antes de entrar en operaciones donde el precio ya se ha movido significativamente.',
     '2026-01-20', '2026-01-26', 8,
     '2026-01-27 08:00:00+00'),

    (1,
     'Semana del 3 al 9 de febrero: 11 operaciones, win rate 54.5%. Patrón detectado: sobreoperas los lunes (5 operaciones, win rate 20%). Tu P&L neto en lunes es -€124. Los miércoles y jueves muestran tu mejor rendimiento (win rate 80%, P&L +€310). Recomendación: limita las operaciones los lunes a un máximo de 2 y aumenta el tamaño de posición en tu ventana óptima del miércoles.',
     '2026-02-03', '2026-02-09', 11,
     '2026-02-10 08:00:00+00'),

    (2,
     'Primera semana de actividad: 4 operaciones registradas. Demasiado pronto para detectar patrones estadísticamente significativos. Necesitas al menos 20 operaciones para un análisis fiable. Sigue registrando tu razonamiento en cada operación — es el dato más valioso para el análisis conductual.',
     '2026-02-10', '2026-02-16', 4,
     '2026-02-17 08:00:00+00');


-- ── analysis_chatmessage ──────────────────────────────────────────────────────

INSERT INTO public.analysis_chatmessage
    (user_id, role, content, created_at)
VALUES
    (1, 'user',
     '¿Cuál es mi tasa de aciertos cuando opero EUR/USD en long?',
     '2026-02-15 10:30:00+00'),

    (1, 'assistant',
     'En las últimas 8 semanas has abierto 12 operaciones long en EUR/USD. De ellas, 7 fueron wins y 5 losses — un win rate del 58.3%. Tu P&L acumulado en este par en long es +€143. Las operaciones más rentables ocurrieron cuando anotaste "confiado" o "tranquilo" como estado emocional (win rate 75%). Las 4 operaciones marcadas como FOMO en este par tuvieron win rate 0%.',
     '2026-02-15 10:30:05+00'),

    (2, 'user',
     '¿Cuándo rindo mejor?',
     '2026-02-20 09:00:00+00');


-- ── mentors_mentorrequest ─────────────────────────────────────────────────────

INSERT INTO public.mentors_mentorrequest
    (mentor_id, trader_id, status, created_at, updated_at)
VALUES
    (3, 1, 'accepted', '2026-02-01 10:00:00+00', '2026-02-01 11:30:00+00'),
    (3, 2, 'pending',  '2026-03-05 14:00:00+00', '2026-03-05 14:00:00+00');


-- ── mentors_mentorassignment ──────────────────────────────────────────────────

INSERT INTO public.mentors_mentorassignment
    (trader_id, mentor_id, is_active, created_at)
VALUES
    (1, 3, TRUE, '2026-02-01 11:30:00+00');


-- ── mentors_mentorannotation ──────────────────────────────────────────────────

INSERT INTO public.mentors_mentorannotation
    (trade_id, mentor_id, body, created_at, updated_at)
VALUES
    (2, 3,
     'Entrada tardía típica de FOMO. El setup ya no era válido cuando entraste — el precio había superado el nivel de resistencia sin una pausa. En el futuro espera siempre un retest antes de entrar en breakouts.',
     '2026-02-04 09:00:00+00', '2026-02-04 09:00:00+00'),

    (1, 3,
     'Buena gestión del trade. Respetaste el stop y no saliste antes de tiempo a pesar de la volatilidad del mediodía. El tamaño de posición es adecuado para tu cuenta.',
     '2026-02-04 09:15:00+00', '2026-02-04 09:15:00+00');


-- ── token_blacklist_outstandingtoken (example — auto-managed by simplejwt) ────

INSERT INTO public.token_blacklist_outstandingtoken
    (token, created_at, expires_at, user_id, jti)
VALUES
    ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example_refresh_token_1',
     '2026-02-15 10:00:00+00', '2026-02-22 10:00:00+00', 1,
     'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'),

    ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example_refresh_token_2',
     '2026-02-20 09:00:00+00', '2026-02-27 09:00:00+00', 2,
     'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5');


-- ── token_blacklist_blacklistedtoken (example — set on logout) ────────────────

INSERT INTO public.token_blacklist_blacklistedtoken
    (token_id, blacklisted_at)
VALUES
    (1, '2026-02-15 18:30:00+00');

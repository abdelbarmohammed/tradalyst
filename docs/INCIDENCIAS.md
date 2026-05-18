# Tradalyst — Incidencias de Desarrollo

> Registro de problemas reales encontrados durante el desarrollo del proyecto
> y cómo se resolvieron. Documento para la Fase 3: Ejecución del Proyecto (DAW).
> Redactado: 2026-05-18

---

## INC-001 — PostgreSQL: `pg_config` not found al instalar `psycopg2`

**Cuándo:** Milestone 1, primera semana del proyecto
**Gravedad:** Bloqueante — el backend no podía arrancar

### Descripción

Al ejecutar `pip install -r requirements.txt` en el entorno local (macOS), la instalación de `psycopg2` falló con:

```
Error: pg_config executable not found.
pg_config is required to build psycopg2 from source.
```

### Causa raíz

`psycopg2` compila código C contra las cabeceras de PostgreSQL durante la instalación. Para ello necesita el ejecutable `pg_config` que viene con la instalación de PostgreSQL. En macOS con Homebrew, `pg_config` está en `/opt/homebrew/opt/postgresql@15/bin/` pero ese directorio no estaba en el `PATH`.

### Solución

Dos opciones evaluadas:

**Opción A (elegida):** Usar `psycopg2-binary` en lugar de `psycopg2` en `requirements.txt`. La versión `binary` incluye las bibliotecas compiladas para las plataformas más comunes (macOS x86, macOS ARM, Linux x86_64) y no requiere compilación local.

```txt
# requirements.txt — cambio
psycopg2-binary==2.9.9   # en lugar de psycopg2==2.9.9
```

**Opción B (descartada):** Añadir el path de Homebrew al shell profile:
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```
Esta opción se descartó porque cualquier colaborador que clonara el repo tendría que repetir el paso manualmente.

### Lección aprendida

`psycopg2-binary` es adecuado para desarrollo local y proyectos pequeños. Para producción en entornos controlados (VPS propio), también se usa `psycopg2-binary` por simplicidad. La documentación oficial de psycopg2 recomienda `psycopg2` (no binary) para producción de alta escala, pero para este proyecto el binary es suficiente.

---

## INC-002 — Docker: incompatibilidad con Mac antiguo (Intel, macOS 12)

**Cuándo:** Fase de planificación, antes de empezar el desarrollo
**Gravedad:** Bloqueante para el flujo de trabajo con Docker

### Descripción

Se consideró usar Docker para containerizar los servicios y simplificar el setup local. Al intentar instalar Docker Desktop en el Mac de desarrollo (Intel, macOS 12 Monterey), la versión más reciente de Docker Desktop requería macOS 13+.

### Causa raíz

Docker Desktop 4.x abandonó el soporte para macOS 12. El equipo sólo tenía acceso a un Mac con macOS 12.

### Solución evaluada: Colima

Se evaluó **Colima** como alternativa open-source a Docker Desktop. Colima crea una máquina virtual Linux usando Lima y expone el socket de Docker. Es compatible con macOS 12 y funciona bien para desarrollo.

```bash
brew install colima docker
colima start
docker ps  # funciona
```

### Solución final adoptada

Se decidió **no usar Docker en absoluto** para este proyecto. La razón principal: el proyecto usa exactamente tres servicios (Django, Next.js ×2, PostgreSQL), todos con instalación trivial vía Homebrew. Docker añadiría complejidad de configuración (Dockerfiles, docker-compose, networking) sin beneficio real dado que:

1. El VPS de producción (Hetzner) es un servidor Linux limpio donde los servicios se instalan directamente.
2. No hay equipo de múltiples personas con entornos distintos.
3. PostgreSQL como servicio de Homebrew (`brew services start postgresql@15`) es más simple que un contenedor en este contexto.

Esta decisión está documentada en `CLAUDE.md`: "No Docker. Local development runs services directly."

---

## INC-003 — JWT: El rol del usuario no estaba en el payload del token

**Cuándo:** Milestone 9 (construcción del frontend de la app)
**Gravedad:** Bloqueante — el middleware de Next.js no podía aplicar control de acceso por rol

### Descripción

El middleware de Next.js (`src/middleware.ts`) lee el JWT del cookie `access_token`, lo decodifica, y usa el campo `role` para decidir a qué rutas tiene acceso el usuario. Al implementar esto, el campo `role` no existía en el payload del JWT:

```javascript
// payload decodificado — sin role
{ user_id: 42, exp: 1713800000, iat: 1713700000, token_type: "access" }
```

Como resultado, todos los usuarios autenticados eran redirigidos al dashboard del trader independientemente de si eran mentores o admins.

### Causa raíz

`djangorestframework-simplejwt` genera JWTs con los campos mínimos estándar (`user_id`, `exp`, `iat`, `token_type`, `jti`). No añade campos personalizados del modelo de usuario por defecto. La documentación de simplejwt explica que hay que subclasificar `RefreshToken` para añadir claims adicionales.

### Solución

Crear `TradalystRefreshToken` en `apps/users/authentication.py` que sobreescribe `for_user()` para inyectar el rol:

```python
from rest_framework_simplejwt.tokens import RefreshToken

class TradalystRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token["role"] = user.role  # ← inyección del rol
        return token
```

Luego, todas las vistas de auth (`RegisterView`, `LoginView`, `CookieTokenRefreshView`) usan `TradalystRefreshToken.for_user(user)` en lugar de `RefreshToken.for_user(user)`.

Payload resultante:

```javascript
{ user_id: 42, role: "trader", exp: 1713800000, ... }
```

### Impacto

Sin este fix, el control de acceso por rol en el edge middleware era imposible. Este bug habría permitido que cualquier usuario autenticado accediera a rutas de cualquier rol.

---

## INC-004 — next-intl: Crash al arrancar la app por fichero de configuración

**Cuándo:** Milestone 12 (implementación de i18n)
**Gravedad:** Crítica — la app completa dejaba de responder

### Descripción

Al añadir `next-intl` al frontend de la app (`frontend/app`), la aplicación empezó a crashear con:

```
Error: Could not find next-intl config. Did you forget to set up the plugin?
```

Este error aparecía en el servidor (SSR) y hacía que todas las páginas devolvieran un error 500. La app era completamente inaccesible.

### Causa raíz

`next-intl` busca el fichero `i18n.ts` (o similar) a través del módulo `next-intl/server`. En el build de Next.js, este módulo se incluía en el bundle del servidor aunque ningún Server Component lo importara explícitamente. La versión de `next-intl` utilizada tenía un bug donde el fichero de config se intentaba resolver en tiempo de módulo, no en tiempo de render, haciendo que el crash fuera inmediato al arrancar.

### Solución

Aislar `next-intl` del bundle del servidor usando un alias de Next.js en `next.config.js`:

```javascript
// frontend/app/next.config.js
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["next-intl"],
  },
  // ...
};
```

Esto fuerza a Next.js a tratar `next-intl` como una dependencia externa (no bundleada), lo que evita que el fichero de config se evalúe durante la fase de módulo del servidor.

Adicionalmente, se creó el fichero de configuración correcto (`i18n.ts`) y se verificó que `IntlProvider` sólo se montara en componentes cliente (`"use client"`).

### Impacto

Este bug bloqueó el desarrollo de i18n durante ~2 horas. El fix fue un commit de una línea en `next.config.js` pero requirió investigación en los issues de GitHub de `next-intl` para identificar la causa.

---

## INC-005 — Label bug: El toggle de idioma mostraba "IS|IN" en vez de "ES|EN"

**Cuándo:** Milestone 12 (i18n, tras el fix del INC-004)
**Gravedad:** Visual — la funcionalidad correcta, la UI incorrecta

### Descripción

Al implementar el toggle de idioma en las páginas de autenticación (`/login`, `/registro`), los botones mostraban el texto "IS" y "IN" en lugar de "ES" y "EN":

```
[ IS ] [ IN ]   ← incorrecto
[ ES ] [ EN ]   ← esperado
```

### Causa raíz

El array de locales se definía con tipos literales en TypeScript:

```typescript
(["es", "en"] as const).map((loc) => (
  <button key={loc} onClick={() => switchLocale(loc)}>
    {loc.toUpperCase()}
  </button>
))
```

`"es".toUpperCase()` devuelve `"ES"` correctamente en la mayoría de entornos, pero en ciertos contextos de renderizado con Next.js (sobre todo en SSR con configuración de locale activa), la llamada a `.toUpperCase()` usaba la locale del sistema como contexto. En locales turcas, `"i".toUpperCase()` devuelve `"İ"` (con punto), y algunas versiones de Node.js tenían comportamientos similares con ciertas configuraciones.

El resultado observado (`"IS"` / `"IN"`) sugería que las cadenas se estaban transformando por algún mecanismo intermedio antes del render, probablemente relacionado con el procesamiento de traducciones de `next-intl`.

### Solución

En lugar de usar las claves de locale en minúsculas y aplicar `.toUpperCase()`, usar directamente strings en mayúsculas:

```typescript
(["ES", "EN"] as const).map((loc) => (
  <button key={loc} onClick={() => switchLocale(loc.toLowerCase())}>
    {loc}
  </button>
))
```

Los botones muestran `"ES"` / `"EN"` (hardcoded) y pasan `"es"` / `"en"` (en minúsculas) a `switchLocale()`.

### Lección aprendida

No asumir que `.toUpperCase()` es determinista cuando hay locales del sistema o del framework en juego. Hardcodear strings de UI que deben ser exactas es más seguro que transformarlas programáticamente.

---

## INC-006 — CoinGecko: Cache devolvía datos con formato incorrecto

**Cuándo:** Milestone 8 (fixes del backend)
**Gravedad:** Alta — precios mostraban `undefined` en el frontend

### Descripción

Los precios en el dashboard mostraban `undefined` para todos los assets de crypto. El error en el frontend era:

```
TypeError: Cannot read properties of undefined (reading 'toLocaleString')
```

### Causa raíz

El servicio `CoinGeckoService` tenía un bug en su lógica de caché. Guardaba la respuesta cruda de CoinGecko (formato: `{ "bitcoin": { "usd": 65000 } }`), pero cuando leía del caché devolvía `cached[coin_id]` — que era `{ "usd": 65000 }` — en lugar del formato transformado que el frontend esperaba: `{ "price": 65000, "change_24h": 2.3 }`.

El bug sólo se manifestaba en cache hits, no en el primer fetch. Esto lo hacía difícil de reproducir en desarrollo (donde la caché expiraba frecuentemente).

### Solución

Guardar el objeto ya transformado en la caché, no el objeto crudo:

```python
# Antes (incorrecto)
cache.set(cache_key, raw_response, PRICE_CACHE_TTL)
# ...
return cached[coin_id]  # { "usd": price } — formato incorrecto

# Después (correcto)
transformed = transform(raw_response)
cache.set(cache_key, transformed, PRICE_CACHE_TTL)
# ...
return cached[symbol]  # { "price": ..., "change_24h": ... } — formato correcto
```

### Lección aprendida

Siempre cachear el dato en el formato en que se va a consumir, no en el formato crudo. Testear siempre tanto el path de cache miss como el de cache hit.

---

## INC-007 — VPS: Investigación de downtime inesperado

**Cuándo:** Milestone 20 (producción)
**Gravedad:** Alta — la app dejó de responder a peticiones

### Descripción

El sitio `app.tradalyst.com` devolvía `502 Bad Gateway` durante ~20 minutos. El marketing site (`tradalyst.com`) seguía funcionando.

### Diagnóstico

1. **Verificar el servicio de Django:**
   ```bash
   sudo systemctl status tradalyst
   ```
   Estado: `active (running)` — Gunicorn estaba activo.

2. **Verificar Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```
   Nginx operativo. Sin errores de configuración.

3. **Revisar logs de Nginx:**
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   ```
   Error encontrado: `connect() failed (111: Connection refused) while connecting to upstream`

4. **Verificar que Gunicorn escuchaba en el puerto correcto:**
   ```bash
   ss -tlnp | grep 8000
   ```
   El proceso estaba escuchando en `127.0.0.1:8000` — correcto.

5. **Verificar PM2 (Next.js):**
   ```bash
   pm2 list
   pm2 logs tradalyst-app --lines 50
   ```
   El proceso `tradalyst-app` había caído con un error de `ENOMEM` (memoria insuficiente).

### Causa raíz

El proceso Next.js para el app (`tradalyst-app`) había sido consumido por un leak de memoria en el proceso de build anterior. PM2 estaba configurado para no reiniciar automáticamente si el proceso terminaba con código de error (configuración por defecto conservadora).

### Solución

1. Reiniciar el proceso: `pm2 restart tradalyst-app`
2. Configurar PM2 para reiniciar automáticamente:
   ```bash
   pm2 start ecosystem.config.js --watch
   pm2 save
   ```
3. Añadir `--max-memory-restart 500M` al proceso para forzar restart limpio si se supera el límite.

### Lección aprendida

En producción, PM2 debe configurarse con `--max-memory-restart` y `--restart-delay`. El marketing site no cayó porque corre en un proceso PM2 separado (`tradalyst-marketing`), lo cual validó la decisión de usar procesos PM2 independientes por subdomain.

---

## INC-008 — Seed Script: Distribución de trades front-loaded

**Cuándo:** Milestone 19 (seed de datos demo)
**Gravedad:** Media — los datos existían pero con distribución temporal incorrecta

### Descripción

Tras ejecutar `seed_demo.py`, todos los trades aparecían concentrados en los primeros 10-15 días de la ventana de 90 días. El heatmap del dashboard mostraba actividad densa al principio y 75 días vacíos. Esto hacía que la demo pareciera artificial y reducía el impacto visual del heatmap.

### Causa raíz

El script generaba todos los timestamps usando `random.sample(all_possible_timestamps, n_trades)` y luego los ordenaba con `sorted(timestamps[:n])`. El operador de slice `[:n]` cogía los primeros n elementos del array ordenado cronológicamente — que eran siempre los timestamps más tempranos.

```python
# Incorrecto
timestamps = sorted(random.sample(all_timestamps, 1000))
selected = timestamps[:135]  # Siempre los 135 más tempranos

# Correcto
timestamps = sorted(random.sample(all_timestamps, min(135, len(all_timestamps))))
```

### Solución

Cambiar `timestamps[:n]` por `random.sample(timestamps, min(n, len(timestamps)))` para seleccionar una muestra aleatoria distribuida por toda la ventana, y luego ordenar esa muestra.

```python
all_timestamps = [base_date + timedelta(days=d) for d in range(90)]
selected = sorted(random.sample(all_timestamps, min(n_trades, len(all_timestamps))))
```

### Resultado

Tras el fix, los 135 trades quedaron distribuidos uniformemente a lo largo de 90 días, con la variación natural de días con más y menos operaciones. El heatmap muestra un patrón realista.

---

## INC-009 — `MdxImage`: Regex fallaba con props que contenían slashes

**Cuándo:** Milestone 22 (blog, componentes de imagen)
**Gravedad:** Media — imágenes y componentes personalizados no se renderizaban en posts

### Descripción

El componente `MdxImage` del blog usa una expresión regular para extraer componentes personalizados del markdown renderizado como HTML. Los componentes como `<MdxImage src="/images/blog/foo.webp" />` no se renderizaban; quedaban como texto plano en el HTML final.

### Causa raíz

La regex usaba `[^/]*` para capturar los atributos:

```javascript
// Incorrecto
const COMPONENT_RE = /<([A-Z][A-Za-z]+)([^/]*?)\/>/g;
```

`[^/]*` significa "cualquier carácter excepto `/`". Los atributos como `src="/images/blog/foo.webp"` o `href="/registro"` contienen slashes, por lo que la regex no los capturaba y el componente no era reconocido.

### Solución

Cambiar `[^/]*` por `[\s\S]*?` (non-greedy, captura cualquier carácter incluyendo `/` y saltos de línea):

```javascript
// Correcto
const COMPONENT_RE = /<([A-Z][A-Za-z]+)([\s\S]*?)\/>/g;
```

También se añadió `MdxImage` al switch de `renderComponent()` y al tipo `ComponentName`.

### Lección aprendida

Al escribir regex para parsear HTML/JSX, usar `[\s\S]*?` en lugar de `[^/]*` para capturar atributos que puedan contener cualquier carácter. El caracter `/` es especialmente problemático porque también se usa en cierres de etiquetas auto-cerrantes (`/>`).

---

## INC-010 — Logout en móvil: El botón no existía en el layout móvil

**Cuándo:** Milestone 16 (móvil fixes)
**Gravedad:** Alta — los usuarios en móvil no podían cerrar sesión

### Descripción

En escritorio, el botón de logout está en la barra lateral (`Sidebar`). En móvil, la sidebar se oculta (`hidden lg:flex`) y se muestra el `BottomNav` (`lg:hidden`). El `BottomNav` original sólo tenía links de navegación, sin el botón de logout.

### Solución

Añadir el botón de logout al `BottomNav` con el mismo `logout()` del módulo `@/lib/auth`:

```tsx
// src/components/layout/BottomNav.tsx
import { logout } from "@/lib/auth";

// En el render
<button onClick={() => logout()} className="...">
  <LogOut size={18} />
</button>
```

Se aplicó la misma corrección a `MentorBottomNav` y `AdminBottomNav`.

### Lección aprendida

Cuando hay dos layouts paralelos (sidebar/bottom nav), cualquier funcionalidad crítica (logout, perfil) debe estar presente en **ambos**. El testing en móvil debe hacerse explícitamente — no sólo en escritorio.

---

## INC-011 — `browsersListForSwc`: Configuración no válida en Next.js 14

**Cuándo:** Milestone 20 (PageSpeed improvements)
**Gravedad:** Baja — warning en build, posible overhead en bundle

### Descripción

El build de Next.js del marketing site mostraba un warning:

```
warn  - Invalid next.config.js options detected:
  > Unrecognized key(s) in object: 'browsersListForSwc'
```

Adicionalmente, el PageSpeed score en móvil era 1/100 (muy bajo).

### Causa raíz

`browsersListForSwc` fue una opción experimental de Next.js que se eliminó en versiones posteriores. Seguía presente en el `next.config.js` del marketing site como reliquia de una configuración anterior.

El score de PageSpeed bajo tenía causas adicionales: imágenes sin optimizar (PNG en lugar de WebP) y elementos above-the-fold cargados de forma asíncrona.

### Solución

1. Eliminar `browsersListForSwc` del `next.config.js`
2. Convertir imágenes principales a WebP
3. Añadir `priority` prop a imágenes above-the-fold
4. Añadir `sizes` prop a imágenes `<Image>` para evitar que descarguen imágenes más grandes de las necesarias

### Resultado

PageSpeed móvil mejoró de 1 a >60 tras los cambios. La eliminación de `browsersListForSwc` eliminó el warning del build sin afectar la funcionalidad.

---

## INC-012 — i18n: App frontend crasheaba si `next-intl` no encontraba el config server-side

**Cuándo:** Milestone 12, tras la implementación inicial de i18n
**Gravedad:** Crítica — todas las páginas devolvían 500

*(Véase INC-004 para el detalle completo. Esta entrada registra la secuencia de diagnóstico.)*

### Secuencia de diagnóstico

1. **Síntoma:** Todas las páginas del app mostraban error 500 tras añadir `next-intl`
2. **Primer intento:** Verificar que `i18n.ts` existía en el root del proyecto → existía
3. **Segundo intento:** Verificar que `next.config.js` tenía el plugin de `next-intl` → faltaba
4. **Tercer intento:** Añadir el plugin → error diferente: `Cannot find module 'next-intl/server' in Edge runtime`
5. **Investigación:** Issues de GitHub de `next-intl` — se encontró que el módulo `/server` no debe importarse en Client Components
6. **Fix:** Crear `IntlProvider` como wrapper client-side que use `NextIntlClientProvider` en lugar de `getTranslations()` del server
7. **Fix adicional:** Añadir `serverComponentsExternalPackages: ["next-intl"]` al `next.config.js`

### Lección aprendida

La documentación de `next-intl` distingue entre uso en Server Components (usando `getTranslations()` del módulo `/server`) y Client Components (usando `useTranslations()` del módulo principal). Mezclarlos causa errores difíciles de diagnosticar. El app frontend de Tradalyst es principalmente client-side (`"use client"`), por lo que usa `NextIntlClientProvider` en el layout root.

---

## INC-013 — Cookies JWT: CORS y dominio incorrecto impedían el refresh

**Cuándo:** Milestone 20 (primer deploy a producción)
**Gravedad:** Crítica — usuarios eran deslogueados cada 15 minutos

### Descripción

En producción, los usuarios eran deslogueados automáticamente cada 15 minutos (que es el TTL del access token). El refresh token no estaba siendo enviado con las peticiones de refresh.

### Causa raíz

Los cookies JWT se establecían con `domain=None` en Django. Sin un dominio explícito, el navegador los asociaba sólo al dominio exacto `api.tradalyst.com`. Sin embargo, las peticiones de refresh se hacían desde `app.tradalyst.com` a `api.tradalyst.com` — un cross-subdomain request. Para que los cookies sean compartidos entre subdominios, el dominio del cookie debe ser `.tradalyst.com` (con punto delante).

### Solución

Añadir `COOKIE_DOMAIN=.tradalyst.com` al `.env` de producción y leer ese valor en la función `_set_auth_cookies()`:

```python
domain = getattr(settings, "COOKIE_DOMAIN", None)
response.set_cookie(
    "access_token",
    str(refresh.access_token),
    domain=domain,  # ".tradalyst.com" en producción
    ...
)
```

El mismo dominio se aplica al borrar cookies en `_clear_auth_cookies()` — si el dominio no coincide al borrar, el cookie no se elimina.

### Lección aprendida

Los cookies de autenticación compartidos entre subdominios requieren `domain=.example.com` (con punto). En desarrollo local, `domain=None` o `domain=localhost` funciona porque no hay subdominios. Este problema es específico del entorno de producción y no se manifiesta en desarrollo, lo que lo hace difícil de detectar antes del primer deploy.

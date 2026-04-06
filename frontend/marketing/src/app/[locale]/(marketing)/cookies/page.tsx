import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cookies" });
  return { title: t("title") };
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cookies" });
  const isEn = locale === "en";

  return (
    <div className="bg-light min-h-screen">
      <section className="py-20 lg:py-28 border-b border-black/[0.08]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <p className="eyebrow mb-4">{t("eyebrow")}</p>
          <h1 className="font-sans text-[40px] lg:text-[52px] font-bold text-text leading-[1.05] tracking-[-0.02em]">
            {t("heading")}
          </h1>
          <p className="font-mono text-[11px] text-text-muted mt-4">{t("updated")}</p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10 prose-tradalyst">
          {isEn ? (
            <>
              <h2>1. What Are Cookies</h2>
              <p>
                Cookies are small text files that websites store on your device when you visit them. They are
                used so that the site remembers your preferences, authenticates you securely, or collects
                anonymous statistical data.
              </p>

              <h2>2. Cookies We Use</h2>
              <table>
                <thead>
                  <tr>
                    <th>Cookie</th>
                    <th>Type</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>access_token</td>
                    <td>Strictly necessary</td>
                    <td>User JWT authentication</td>
                    <td>15 minutes</td>
                  </tr>
                  <tr>
                    <td>refresh_token</td>
                    <td>Strictly necessary</td>
                    <td>Session token renewal</td>
                    <td>7 days</td>
                  </tr>
                  <tr>
                    <td>NEXT_LOCALE</td>
                    <td>Strictly necessary</td>
                    <td>Language preference (ES/EN)</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td>NEXT_THEME</td>
                    <td>Strictly necessary</td>
                    <td>Theme preference (light/dark)</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td>_ga, _ga_*</td>
                    <td>Analytics (optional)</td>
                    <td>Google Analytics — anonymous usage statistics</td>
                    <td>2 years</td>
                  </tr>
                </tbody>
              </table>

              <h2>3. Strictly Necessary Cookies</h2>
              <p>
                Authentication cookies (access_token and refresh_token) and preference cookies (NEXT_LOCALE and
                NEXT_THEME) are necessary for the service to function correctly. Without them, you would not be
                able to log in or retain your preferences between sessions. These cookies do not require consent
                under Art. 5(3) of the ePrivacy Directive.
              </p>

              <h2>4. Analytics Cookies (Google Analytics)</h2>
              <p>
                Google Analytics helps us understand how the site is used: which pages are visited most, from
                which devices, or how long users spend on each section. This data is anonymous and cannot be
                used to identify you. These cookies are only activated if you explicitly accept through the
                consent banner that appears on your first visit.
              </p>

              <h2>5. How to Manage Cookies</h2>
              <ul>
                <li>Through the consent banner that appears on your first visit.</li>
                <li>
                  Via your browser settings (usually under Tools → Options → Privacy or Settings → Privacy and
                  Security).
                </li>
                <li>
                  By contacting us at <a href="mailto:hola@tradalyst.com">hola@tradalyst.com</a>.
                </li>
              </ul>

              <h2>6. Further Information</h2>
              <ul>
                <li>
                  Google Analytics Privacy Policy:{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                    policies.google.com/privacy
                  </a>
                </li>
                <li>
                  Spanish Data Protection Agency (AEPD):{" "}
                  <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
                    aepd.es
                  </a>
                </li>
              </ul>
            </>
          ) : (
            <>
              <h2>1. Qué son las cookies</h2>
              <p>
                Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo cuando
                los visitas. Se usan para que el sitio recuerde tus preferencias, para autenticarte de forma
                segura o para recoger datos estadísticos anónimos.
              </p>

              <h2>2. Cookies que usamos</h2>
              <table>
                <thead>
                  <tr>
                    <th>Cookie</th>
                    <th>Tipo</th>
                    <th>Finalidad</th>
                    <th>Duración</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>access_token</td>
                    <td>Estrictamente necesaria</td>
                    <td>Autenticación JWT del usuario</td>
                    <td>15 minutos</td>
                  </tr>
                  <tr>
                    <td>refresh_token</td>
                    <td>Estrictamente necesaria</td>
                    <td>Renovación del token de sesión</td>
                    <td>7 días</td>
                  </tr>
                  <tr>
                    <td>NEXT_LOCALE</td>
                    <td>Estrictamente necesaria</td>
                    <td>Preferencia de idioma (ES/EN)</td>
                    <td>1 año</td>
                  </tr>
                  <tr>
                    <td>NEXT_THEME</td>
                    <td>Estrictamente necesaria</td>
                    <td>Preferencia de tema (claro/oscuro)</td>
                    <td>1 año</td>
                  </tr>
                  <tr>
                    <td>_ga, _ga_*</td>
                    <td>Analítica (opcional)</td>
                    <td>Google Analytics — estadísticas de uso anónimas</td>
                    <td>2 años</td>
                  </tr>
                </tbody>
              </table>

              <h2>3. Cookies estrictamente necesarias</h2>
              <p>
                Las cookies de autenticación (access_token y refresh_token) y de preferencias (NEXT_LOCALE y
                NEXT_THEME) son necesarias para que el servicio funcione correctamente. Sin ellas, no podrías
                iniciar sesión ni mantener tus preferencias entre sesiones. Estas cookies no requieren
                consentimiento según el art. 22.2 de la LSSI.
              </p>

              <h2>4. Cookies analíticas (Google Analytics)</h2>
              <p>
                Google Analytics nos ayuda a entender cómo se usa el sitio: qué páginas se visitan más, desde
                qué dispositivos, o cuánto tiempo se pasa en cada sección. Estos datos son anónimos y no
                permiten identificarte. Estas cookies solo se activan si aceptas explícitamente a través del
                banner de consentimiento que aparece en tu primera visita.
              </p>

              <h2>5. Cómo gestionar las cookies</h2>
              <ul>
                <li>A través del banner de consentimiento que aparece en tu primera visita.</li>
                <li>
                  Desde la configuración de tu navegador (generalmente en Herramientas → Opciones → Privacidad o
                  Configuración → Privacidad y seguridad).
                </li>
                <li>
                  Contactando con nosotros en{" "}
                  <a href="mailto:hola@tradalyst.com">hola@tradalyst.com</a>.
                </li>
              </ul>

              <h2>6. Más información</h2>
              <ul>
                <li>
                  Política de privacidad de Google Analytics:{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                    policies.google.com/privacy
                  </a>
                </li>
                <li>
                  Agencia Española de Protección de Datos (AEPD):{" "}
                  <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
                    aepd.es
                  </a>
                </li>
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

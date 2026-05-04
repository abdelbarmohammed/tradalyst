import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title") };
}

export default async function PrivacidadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
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
              <h2>1. Data Controller</h2>
              <p>
                Tradalyst (&ldquo;Tradalyst&rdquo; or &ldquo;we&rdquo;) acts as the data controller for the personal data
                collected through this platform. Contact email:{" "}
                <a href="mailto:hola@tradalyst.com">hola@tradalyst.com</a>. Country: Spain.
              </p>

              <h2>2. What Data We Collect</h2>
              <ul>
                <li>
                  <strong>Account data:</strong> display name, email address and password (stored securely with
                  bcrypt — never in plain text).
                </li>
                <li>
                  <strong>Trade data:</strong> assets traded, entry and exit prices, trade reasoning and emotional
                  state recorded by the user.
                </li>
                <li>
                  <strong>Usage data:</strong> language preference, theme preference (light/dark) and watchlist
                  assets.
                </li>
                <li>
                  <strong>Technical data:</strong> IP address (recorded in server logs) and session cookies (JWT
                  token stored in an httpOnly cookie).
                </li>
                <li>
                  <strong>Analytics data:</strong> browsing data collected by Google Analytics only with the
                  user&apos;s prior consent.
                </li>
              </ul>

              <h2>3. How We Use Your Data</h2>
              <ul>
                <li>
                  <strong>Service delivery:</strong> to provide the trading journal, AI analysis, dashboard and all
                  platform features.
                </li>
                <li>
                  <strong>Authentication and security:</strong> to verify user identity and protect account access.
                </li>
                <li>
                  <strong>Product improvement:</strong> to analyse service usage and introduce improvements.
                </li>
                <li>
                  <strong>Web analytics:</strong> to obtain anonymous usage statistics, only when the user has
                  given explicit consent.
                </li>
              </ul>

              <h2>4. Legal Basis for Processing</h2>
              <ul>
                <li>
                  <strong>Contract performance (Art. 6(1)(b) GDPR):</strong> processing is necessary to deliver
                  the service requested by the user.
                </li>
                <li>
                  <strong>Consent (Art. 6(1)(a) GDPR):</strong> analytics cookies are only set with the user&apos;s
                  prior consent, which can be withdrawn at any time.
                </li>
                <li>
                  <strong>Legitimate interests (Art. 6(1)(f) GDPR):</strong> technical logs and security
                  information are processed under Tradalyst&apos;s legitimate interest in maintaining the security
                  and integrity of the service.
                </li>
              </ul>

              <h2>5. Data Retention</h2>
              <ul>
                <li>Account and trade data: retained while the account remains active.</li>
                <li>Technical logs: retained for a maximum of 30 days.</li>
                <li>
                  After account deletion: all personal data is permanently deleted within a maximum of 30 days.
                </li>
              </ul>

              <h2>6. Your Rights (GDPR Arts. 15–22)</h2>
              <p>Under the General Data Protection Regulation (GDPR) you have the right to:</p>
              <ul>
                <li>
                  <strong>Access:</strong> know what personal data we process about you.
                </li>
                <li>
                  <strong>Rectification:</strong> correct inaccurate or incomplete data.
                </li>
                <li>
                  <strong>Erasure (&ldquo;right to be forgotten&rdquo;):</strong> request deletion of your personal data.
                </li>
                <li>
                  <strong>Portability:</strong> receive your data in a structured, commonly used format.
                </li>
                <li>
                  <strong>Objection:</strong> object to the processing of your data.
                </li>
                <li>
                  <strong>Restriction:</strong> request that processing is restricted in certain circumstances.
                </li>
              </ul>
              <p>
                To exercise any of these rights, send an email to{" "}
                <a href="mailto:hola@tradalyst.com">hola@tradalyst.com</a> with the subject &ldquo;GDPR Rights
                Request&rdquo;. We will respond within 30 days. You also have the right to lodge a complaint with
                the Spanish Data Protection Agency (AEPD) at{" "}
                <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
                  aepd.es
                </a>
                .
              </p>

              <h2>7. International Transfers</h2>
              <ul>
                <li>
                  <strong>Claude API (Anthropic, Inc., USA):</strong> trade data and analysis context may be
                  transmitted to Anthropic to generate AI insights. This transfer is made under EU Standard
                  Contractual Clauses.
                </li>
                <li>
                  <strong>Google Analytics (Google LLC, USA):</strong> only when the user has given explicit
                  consent for analytics cookies.
                </li>
              </ul>

              <h2>8. Cookies</h2>
              <p>
                For detailed information about the cookies we use, see our{" "}
                <Link href="/cookies">Cookie Policy</Link>.
              </p>

              <h2>9. Changes to This Policy</h2>
              <p>
                If we make material changes to this policy, we will notify you by email with reasonable advance
                notice. The last updated date appears at the top of this document. The current version is always
                available at{" "}
                <a href="https://tradalyst.com/en/privacidad" target="_blank" rel="noopener noreferrer">
                  tradalyst.com/privacidad
                </a>
                .
              </p>
            </>
          ) : (
            <>
              <h2>1. Responsable del tratamiento</h2>
              <p>
                Tradalyst (&ldquo;Tradalyst&rdquo; o &ldquo;nosotros&rdquo;) actúa como responsable del tratamiento de los
                datos personales recogidos a través de esta plataforma. Email de contacto:{" "}
                <a href="mailto:hola@tradalyst.com">hola@tradalyst.com</a>. País: España.
              </p>

              <h2>2. Qué datos recogemos</h2>
              <ul>
                <li>
                  <strong>Datos de registro:</strong> nombre, dirección de correo electrónico y contraseña
                  (almacenada de forma segura con bcrypt — nunca en texto plano).
                </li>
                <li>
                  <strong>Datos de operaciones:</strong> activos negociados, precios de entrada y salida,
                  razonamiento de la operación y estado emocional registrado por el usuario.
                </li>
                <li>
                  <strong>Datos de uso:</strong> preferencias de idioma, preferencia de tema (claro/oscuro) y
                  activos fijados en la watchlist.
                </li>
                <li>
                  <strong>Datos técnicos:</strong> dirección IP (registrada en los logs del servidor) y cookies de
                  sesión (token JWT almacenado en cookie httpOnly).
                </li>
                <li>
                  <strong>Datos analíticos:</strong> datos de navegación recogidos por Google Analytics únicamente
                  con el consentimiento previo del usuario.
                </li>
              </ul>

              <h2>3. Para qué usamos los datos</h2>
              <ul>
                <li>
                  <strong>Prestación del servicio:</strong> proporcionar el diario de trading, el análisis de IA,
                  el dashboard y todas las funcionalidades de la plataforma.
                </li>
                <li>
                  <strong>Autenticación y seguridad:</strong> verificar la identidad del usuario y proteger el
                  acceso a la cuenta.
                </li>
                <li>
                  <strong>Mejora del producto:</strong> analizar el uso del servicio para introducir mejoras.
                </li>
                <li>
                  <strong>Analítica web:</strong> obtener estadísticas de uso de forma anónima, únicamente cuando
                  el usuario lo ha aceptado expresamente.
                </li>
              </ul>

              <h2>4. Base legal del tratamiento</h2>
              <ul>
                <li>
                  <strong>Ejecución de contrato (Art. 6.1.b RGPD):</strong> el tratamiento es necesario para la
                  prestación del servicio solicitado por el usuario.
                </li>
                <li>
                  <strong>Consentimiento (Art. 6.1.a RGPD):</strong> el tratamiento de cookies analíticas se
                  realiza con el consentimiento previo del usuario, que puede revocarse en cualquier momento.
                </li>
                <li>
                  <strong>Interés legítimo (Art. 6.1.f RGPD):</strong> el tratamiento de logs técnicos e
                  información de seguridad está amparado en el interés legítimo de Tradalyst en mantener la
                  seguridad e integridad del servicio.
                </li>
              </ul>

              <h2>5. Conservación de datos</h2>
              <ul>
                <li>Datos de cuenta y de operaciones: se conservan mientras la cuenta permanezca activa.</li>
                <li>Logs técnicos: se conservan un máximo de 30 días.</li>
                <li>
                  Tras la eliminación de cuenta: todos los datos personales se borran de forma permanente en un
                  plazo máximo de 30 días.
                </li>
              </ul>

              <h2>6. Derechos del usuario (RGPD Arts. 15-22)</h2>
              <p>En virtud del Reglamento General de Protección de Datos (RGPD), tienes derecho a:</p>
              <ul>
                <li>
                  <strong>Acceso:</strong> conocer qué datos personales tratamos sobre ti.
                </li>
                <li>
                  <strong>Rectificación:</strong> corregir datos inexactos o incompletos.
                </li>
                <li>
                  <strong>Supresión (&ldquo;derecho al olvido&rdquo;):</strong> solicitar el borrado de tus datos
                  personales.
                </li>
                <li>
                  <strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común.
                </li>
                <li>
                  <strong>Oposición:</strong> oponerte al tratamiento de tus datos.
                </li>
                <li>
                  <strong>Limitación del tratamiento:</strong> solicitar que se restrinja el tratamiento en
                  determinadas circunstancias.
                </li>
              </ul>
              <p>
                Para ejercer cualquiera de estos derechos, envía un email a{" "}
                <a href="mailto:hola@tradalyst.com">hola@tradalyst.com</a> con el asunto &ldquo;Ejercicio de derechos
                RGPD&rdquo;. Responderemos en el plazo máximo de 30 días. También tienes derecho a presentar una
                reclamación ante la Agencia Española de Protección de Datos (AEPD) en{" "}
                <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
                  aepd.es
                </a>
                .
              </p>

              <h2>7. Transferencias internacionales</h2>
              <ul>
                <li>
                  <strong>Claude API (Anthropic, Inc., EEUU):</strong> los datos de operaciones y el contexto de
                  análisis pueden ser transmitidos a Anthropic para la generación de insights de IA. Esta
                  transferencia se realiza al amparo de las Cláusulas Contractuales Tipo de la UE.
                </li>
                <li>
                  <strong>Google Analytics (Google LLC, EEUU):</strong> únicamente cuando el usuario ha otorgado
                  su consentimiento expreso para cookies analíticas.
                </li>
              </ul>

              <h2>8. Cookies</h2>
              <p>
                Para información detallada sobre las cookies que utilizamos, consulta nuestra{" "}
                <Link href="/cookies">Política de Cookies</Link>.
              </p>

              <h2>9. Cambios en esta política</h2>
              <p>
                Si realizamos cambios sustanciales en esta política, te lo notificaremos por email con antelación
                razonable. La fecha de la última actualización aparece al inicio de este documento. La versión
                vigente siempre estará disponible en{" "}
                <a href="https://tradalyst.com/privacidad" target="_blank" rel="noopener noreferrer">
                  tradalyst.com/privacidad
                </a>
                .
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — Tradalyst",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-black/[0.08] pt-8 pb-2">
      <h2 className="font-sans text-[18px] font-bold text-text tracking-[-0.01em] mb-4">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[14px] text-text-secondary leading-relaxed">{children}</p>
  );
}

export default function Privacidad() {
  return (
    <div className="bg-light min-h-screen">
      <section className="py-16 lg:py-24">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          {/* Header */}
          <div className="mb-12">
            <p className="eyebrow mb-3">Legal</p>
            <h1 className="font-sans text-[32px] lg:text-[40px] font-bold text-text leading-[1.1] tracking-[-0.02em] mb-3">
              Política de Privacidad
            </h1>
            <p className="font-mono text-[11px] text-text-muted">
              Última actualización: abril de 2026
            </p>
          </div>

          <div className="space-y-8">
            <Section title="1. Responsable del tratamiento">
              <P>
                El responsable del tratamiento de los datos personales recogidos a través de este sitio web y la aplicación Tradalyst es el titular del proyecto, con domicilio en Málaga, España, y contacto en{" "}
                <a href="mailto:hola@tradalyst.com" className="text-green hover:underline">
                  hola@tradalyst.com
                </a>
                .
              </P>
            </Section>

            <Section title="2. Datos que recogemos">
              <P>
                Recogemos únicamente los datos necesarios para prestar el servicio:
              </P>
              <ul className="space-y-2 pl-4">
                {[
                  "Nombre completo y dirección de email para crear tu cuenta.",
                  "Datos de operaciones de trading que introduces manualmente (activo, dirección, precio, resultado, razonamiento, estado emocional).",
                  "Historial de conversaciones con la IA (chat).",
                  "Preferencias de cuenta (tema visual, tipo de trader).",
                  "Datos técnicos de uso (logs de servidor, dirección IP) para seguridad y diagnóstico.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-[11px] text-green mt-[2px]">—</span>
                    <span className="font-sans text-[14px] text-text-secondary leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <P>No recogemos datos de pago directamente — los pagos son gestionados por el procesador de pagos externo.</P>
            </Section>

            <Section title="3. Base legal para el tratamiento">
              <P>
                El tratamiento se basa en la ejecución del contrato de servicio aceptado al crear tu cuenta (art. 6.1.b RGPD) y, donde aplica, en el consentimiento explícito que nos otorgas (art. 6.1.a RGPD).
              </P>
            </Section>

            <Section title="4. Cómo usamos tus datos">
              <P>
                Tus datos de trading se usan exclusivamente para:
              </P>
              <ul className="space-y-2 pl-4">
                {[
                  "Mostrar tu dashboard y historial de operaciones.",
                  "Generar análisis de comportamiento mediante IA (Claude, de Anthropic).",
                  "Permitir que tu mentor asignado revise tus operaciones si utilizas esa funcionalidad.",
                  "Calcular métricas de rendimiento.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-[11px] text-green mt-[2px]">—</span>
                    <span className="font-sans text-[14px] text-text-secondary leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <P>Tus datos no se venden ni se comparten con terceros para fines publicitarios o de marketing.</P>
            </Section>

            <Section title="5. Transferencia a terceros">
              <P>
                Para prestar el servicio, tus datos de texto (razonamiento de operaciones, chat) son procesados por <strong className="text-text font-semibold">Anthropic</strong> a través de la API de Claude, sujeto a su política de privacidad y a los acuerdos de procesamiento de datos vigentes. Anthropic no retiene datos de usuario más allá del procesamiento de cada solicitud.
              </P>
              <P>
                El servidor está alojado en <strong className="text-text font-semibold">Hetzner Online GmbH</strong>, con servidores en la Unión Europea.
              </P>
            </Section>

            <Section title="6. Retención de datos">
              <P>
                Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, todos tus datos personales y de trading se eliminan de nuestros servidores en un plazo máximo de 30 días, salvo obligación legal contraria.
              </P>
            </Section>

            <Section title="7. Tus derechos (RGPD)">
              <P>Como usuario con residencia en la UE, tienes derecho a:</P>
              <ul className="space-y-2 pl-4">
                {[
                  "Acceder a los datos que tenemos sobre ti.",
                  "Rectificar datos incorrectos.",
                  "Solicitar la eliminación de tus datos.",
                  "Oponerte al tratamiento o solicitar su limitación.",
                  "Portabilidad de datos (exportación en formato CSV disponible desde la app).",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-[11px] text-green mt-[2px]">—</span>
                    <span className="font-sans text-[14px] text-text-secondary leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <P>
                Para ejercer cualquiera de estos derechos, escríbenos a{" "}
                <a href="mailto:hola@tradalyst.com" className="text-green hover:underline">
                  hola@tradalyst.com
                </a>
                .
              </P>
            </Section>

            <Section title="8. Cookies">
              <P>
                Tradalyst usa una única cookie httpOnly para la autenticación (token JWT de sesión). Esta cookie es estrictamente necesaria para el funcionamiento del servicio y no requiere consentimiento bajo la directiva ePrivacy.
              </P>
              <P>No usamos cookies de seguimiento ni de publicidad de terceros.</P>
            </Section>

            <Section title="9. Contacto y reclamaciones">
              <P>
                Para cualquier consulta sobre privacidad:{" "}
                <a href="mailto:hola@tradalyst.com" className="text-green hover:underline">
                  hola@tradalyst.com
                </a>
              </P>
              <P>
                Si consideras que el tratamiento de tus datos no es correcto, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) en{" "}
                <span className="font-mono text-[13px] text-text-secondary">aepd.es</span>.
              </P>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}

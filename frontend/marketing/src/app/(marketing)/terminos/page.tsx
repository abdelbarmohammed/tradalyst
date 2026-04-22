import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Uso — Tradalyst",
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

export default function Terminos() {
  return (
    <div className="bg-light min-h-screen">
      <section className="py-16 lg:py-24">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          {/* Header */}
          <div className="mb-12">
            <p className="eyebrow mb-3">Legal</p>
            <h1 className="font-sans text-[32px] lg:text-[40px] font-bold text-text leading-[1.1] tracking-[-0.02em] mb-3">
              Términos de Uso
            </h1>
            <p className="font-mono text-[11px] text-text-muted">
              Última actualización: abril de 2026
            </p>
          </div>

          <div className="space-y-8">
            <Section title="1. Aceptación de los términos">
              <P>
                Al crear una cuenta o usar Tradalyst, aceptas estos Términos de Uso. Si no los aceptas, no debes usar el servicio. El uso continuado de Tradalyst tras la publicación de cambios en estos términos implica la aceptación de los mismos.
              </P>
            </Section>

            <Section title="2. Descripción del servicio">
              <P>
                Tradalyst es una aplicación web de diario de trading que permite a los usuarios registrar operaciones financieras, recibir análisis de comportamiento generados por inteligencia artificial y consultar métricas de rendimiento.
              </P>
              <P>
                El servicio se ofrece en dos modalidades: plan Free (gratuito, con limitaciones) y plan Pro (de pago, con acceso completo). Las características de cada plan están descritas en la página de precios.
              </P>
            </Section>

            <Section title="3. Registro y cuenta">
              <P>
                Para usar Tradalyst necesitas crear una cuenta con un email válido y una contraseña. Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas desde tu cuenta.
              </P>
              <P>
                Solo se permite una cuenta por persona. El uso de cuentas compartidas o automatizadas está prohibido salvo autorización expresa.
              </P>
            </Section>

            <Section title="4. Uso permitido">
              <P>Puedes usar Tradalyst para:</P>
              <ul className="space-y-2 pl-4">
                {[
                  "Registrar y analizar tus propias operaciones de trading.",
                  "Obtener análisis de comportamiento basados en tu historial.",
                  "Compartir acceso de revisión con un mentor de tu elección.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-[11px] text-green mt-[2px]">✓</span>
                    <span className="font-sans text-[14px] text-text-secondary leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="5. Uso prohibido">
              <P>No está permitido:</P>
              <ul className="space-y-2 pl-4">
                {[
                  "Usar el servicio para actividades ilegales o fraudulentas.",
                  "Intentar acceder a datos de otros usuarios.",
                  "Realizar ingeniería inversa, copiar o redistribuir el software.",
                  "Usar el servicio para entrenar modelos de IA o scraping masivo.",
                  "Compartir tu cuenta con terceros.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-[11px] text-loss mt-[2px]">✗</span>
                    <span className="font-sans text-[14px] text-text-secondary leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="6. Contenido del usuario">
              <P>
                Los datos que introduces en Tradalyst (operaciones, razonamientos, conversaciones) son de tu propiedad. Al usar el servicio, nos otorgas una licencia limitada y no exclusiva para procesar esos datos con el único fin de prestarte el servicio.
              </P>
              <P>
                No usamos tus datos para fines distintos a los descritos en la Política de Privacidad.
              </P>
            </Section>

            <Section title="7. Pagos y cancelación">
              <P>
                El plan Pro se factura mensualmente. Puedes cancelar en cualquier momento desde tu cuenta. La cancelación es efectiva al final del período facturado — no se realizan reembolsos proporcionales por días no usados.
              </P>
              <P>
                El período de prueba de 7 días es gratuito. Si no cancelas antes de que termine, se activa automáticamente la suscripción mensual.
              </P>
            </Section>

            <Section title="8. Descargo de responsabilidad financiera">
              <P>
                <strong className="text-text font-semibold">Tradalyst no es un servicio de asesoramiento financiero.</strong> Los análisis generados por la IA son estadísticos y de comportamiento — no constituyen recomendaciones de inversión ni predicciones de mercado.
              </P>
              <P>
                El trading conlleva riesgo de pérdida de capital. Las decisiones de inversión son responsabilidad exclusiva del usuario. Tradalyst no se hace responsable de pérdidas derivadas del uso del servicio.
              </P>
            </Section>

            <Section title="9. Disponibilidad del servicio">
              <P>
                Nos esforzamos por mantener Tradalyst disponible, pero no garantizamos disponibilidad ininterrumpida. Podemos realizar mantenimiento o actualizaciones que requieran interrupciones temporales del servicio.
              </P>
            </Section>

            <Section title="10. Modificaciones y cancelación de cuenta">
              <P>
                Nos reservamos el derecho de modificar o interrumpir el servicio con un aviso razonable. Podemos suspender o cancelar cuentas que violen estos términos.
              </P>
              <P>
                Puedes eliminar tu cuenta en cualquier momento desde los ajustes. Todos tus datos se eliminarán en un plazo máximo de 30 días.
              </P>
            </Section>

            <Section title="11. Ley aplicable">
              <P>
                Estos términos se rigen por la legislación española. Cualquier disputa se someterá a los tribunales competentes de Málaga, España.
              </P>
            </Section>

            <Section title="12. Contacto">
              <P>
                Para cualquier consulta sobre estos términos:{" "}
                <a href="mailto:hola@tradalyst.com" className="text-green hover:underline">
                  hola@tradalyst.com
                </a>
              </P>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}

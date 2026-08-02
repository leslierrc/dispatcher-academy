import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Conoce a Carla y el programa de 7 Digital LLC: formación real para entrar a la industria del transporte.",
};

export default function AboutPage() {
  return (
    <main className="pt-40 pb-24 px-6 lg:px-14">
      <div className="max-w-[900px] mx-auto">
        <h1 className="font-heading text-[clamp(38px,5vw,64px)] leading-none">Sobre 7 Digital LLC</h1>
        <p className="mt-6 text-lg text-neutral-300 leading-relaxed">
          7 Digital LLC nació para romper el mito de que necesitas experiencia para entrar a la
          industria del transporte. Con el método correcto y mentoría real, cualquier persona puede
          aprender a despachar camiones desde casa y generar ingresos en dólares.
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            { title: "Método práctico", body: "Nada de teoría vacía. Aprendes con casos reales, plantillas y talleres que te dejan listo para trabajar." },
            { title: "Mentoría real", body: "Carla trabaja como dispatcher activa y te acompaña paso a paso hasta tu primer cliente." },
            { title: "Soporte de por vida", body: "La industria cambia y nosotros también. Acceso a actualizaciones y a tu comunidad de alumnos." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-divider bg-surface/40 p-7">
              <h2 className="font-heading text-xl text-accent-300">{f.title}</h2>
              <p className="mt-3 text-sm text-neutral-300 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

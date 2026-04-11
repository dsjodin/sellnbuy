import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold text-slate-900">
          Rakna pa ditt bostadsaffar
        </h1>
        <p className="mt-2 text-slate-600">
          Tva kalkylatorer: en for dig som ska salja din bostad och en for
          dig som ska kopa. Allt rakras direkt i webblasaren, inget sparas.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/salja"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow"
        >
          <h2 className="text-xl font-semibold text-slate-900">Salja</h2>
          <p className="mt-2 text-sm text-slate-600">
            Vinstskatt, avdragsgilla forbattringar, uppskov och
            ranteskillnadsersattning for lan som loses i forskott.
          </p>
        </Link>
        <Link
          href="/kopa"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow"
        >
          <h2 className="text-xl font-semibold text-slate-900">Kopa</h2>
          <p className="mt-2 text-sm text-slate-600">
            Kontantinsats, bolanetak, amorteringskrav och KALP med bankens
            stresstest baserat pa Konsumentverkets schablonbelopp.
          </p>
        </Link>
      </section>
    </div>
  );
}

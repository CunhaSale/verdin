"use client";

import { useState, type FormEvent } from "react";
import { brl, simulateActivation, useActivations, type Activation } from "@/lib/store";

type Tab = "home" | "ativar" | "locais";

const NAV = [
  { key: "home", label: "Início", icon: "🏠" },
  { key: "ativar", label: "Ativar código", icon: "🔑" },
  { key: "locais", label: "Estabelecimentos", icon: "📍" },
] as const;

export default function Home() {
  const { list, add } = useActivations();
  const [tab, setTab] = useState<Tab>("home");
  const [result, setResult] = useState<Activation | null>(null);
  const saldo = list.reduce((s, a) => s + a.cashback, 0);
  const pontos = list.reduce((s, a) => s + a.points, 0);
  const gasto = list.reduce((s, a) => s + a.total, 0);

  return (
    <div className="min-h-screen bg-background lg:pl-72">
      <Sidebar tab={tab} setTab={setTab} saldo={saldo} pontos={pontos} />

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col md:max-w-5xl md:px-8">
        <div className="flex flex-1 flex-col">
          <Header saldo={saldo} pontos={pontos} gasto={gasto} visits={list.length} />

          <main className="flex-1 px-5 pb-28 pt-6 md:px-0 md:pb-14 md:pt-8">
            {tab === "home" && (
              <HomeContent list={list} onOpen={setResult} onActivate={() => setTab("ativar")} />
            )}
            {tab === "ativar" && (
              <ActivateForm
                onDone={(a) => {
                  add(a);
                  setResult(a);
                }}
              />
            )}
            {tab === "locais" && <Places list={list} onOpen={setResult} />}
          </main>
        </div>
      </div>

      {result && (
        <ResultSheet
          a={result}
          onClose={() => {
            setResult(null);
            setTab("home");
          }}
        />
      )}

      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md justify-around border-t border-border bg-card py-3 lg:hidden">
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            className={`flex flex-col items-center text-xs ${tab === n.key ? "font-bold text-primary" : "text-muted-foreground"}`}
          >
            <span className="text-xl">{n.icon}</span>
            {n.label.split(" ")[0]}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Sidebar({ tab, setTab, saldo, pontos }: { tab: Tab; setTab: (t: Tab) => void; saldo: number; pontos: number }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-border bg-card p-6 lg:flex">
      <div className="flex items-center gap-3">
        <div className="bg-hero flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-glow">🍀</div>
        <div>
          <p className="font-display text-lg font-bold leading-none">Verdin</p>
          <p className="mt-1 text-xs text-muted-foreground">Cashback & fidelidade</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${
              tab === n.key ? "bg-secondary font-bold text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="text-lg">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="bg-hero rounded-2xl p-5 text-primary-foreground shadow-glow">
          <p className="text-xs opacity-80">Saldo cashback</p>
          <p className="font-display text-2xl font-bold">{brl(saldo)}</p>
          <p className="mt-3 text-xs opacity-80">Pontos fidelidade</p>
          <p className="font-display text-xl font-bold">{pontos}</p>
        </div>
        <p className="rounded-xl bg-muted p-3 text-[11px] text-muted-foreground">
          Modo MVP: qualquer código é aceito e vinculado ao Coronel Bar.
        </p>
      </div>
    </aside>
  );
}

function Header({ saldo, pontos, gasto, visits }: { saldo: number; pontos: number; gasto: number; visits: number }) {
  return (
    <header className="bg-hero rounded-b-[2rem] px-6 pb-8 pt-10 text-primary-foreground shadow-glow md:mt-8 md:rounded-[2rem] md:px-9 md:pt-9">
      <p className="font-display text-sm opacity-80">Olá, Gabriel 👋</p>
      <h1 className="font-display text-2xl font-bold md:text-3xl">Verdin</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard l="Saldo cashback" v={brl(saldo)} />
        <StatCard l="Pontos fidelidade" v={String(pontos)} />
        <StatCard l="Total consumido" v={brl(gasto)} className="hidden lg:block" />
        <StatCard l="Ativações" v={String(visits)} className="hidden lg:block" />
      </div>
    </header>
  );
}

function StatCard({ l, v, className = "" }: { l: string; v: string; className?: string }) {
  return (
    <div className={`rounded-2xl bg-primary-foreground/15 p-4 backdrop-blur ${className}`}>
      <p className="text-xs opacity-80">{l}</p>
      <p className="font-display text-2xl font-bold">{v}</p>
    </div>
  );
}

function HomeContent({
  list,
  onOpen,
  onActivate,
}: {
  list: Activation[];
  onOpen: (a: Activation) => void;
  onActivate: () => void;
}) {
  return (
    <section className="space-y-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-start md:gap-8 md:space-y-0">
      <div className="space-y-4">
        <button
          onClick={onActivate}
          className="bg-accent w-full rounded-2xl p-5 text-left text-accent-foreground shadow-soft md:p-7"
        >
          <p className="font-display text-lg font-bold md:text-2xl">Ativar código</p>
          <p className="text-sm opacity-80">Recebeu um código no estabelecimento? Ative aqui.</p>
        </button>

        <div className="hidden rounded-2xl bg-card p-6 shadow-soft md:block">
          <p className="font-display font-bold">Como funciona</p>
          <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="bg-secondary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-secondary-foreground">1</span>
              Você consome no estabelecimento e recebe um código.
            </li>
            <li className="flex gap-3">
              <span className="bg-secondary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-secondary-foreground">2</span>
              Ativa o código no app e confere o consumo.
            </li>
            <li className="flex gap-3">
              <span className="bg-secondary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-secondary-foreground">3</span>
              O cashback e os pontos caem na sua conta na hora.
            </li>
          </ol>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display pt-2 font-semibold md:text-lg">Últimas recompensas</h2>
        {list.length === 0 && (
          <p className="rounded-2xl bg-card p-5 text-sm text-muted-foreground shadow-soft">
            Nenhuma recompensa ainda. Ative um código para começar.
          </p>
        )}
        {list.slice(0, 5).map((a) => (
          <ActivationRow key={a.id} a={a} onClick={() => onOpen(a)} />
        ))}
      </div>
    </section>
  );
}

function ActivationRow({ a, onClick }: { a: Activation; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-xl">🍺</div>
      <div className="flex-1">
        <p className="font-semibold">{a.establishment}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(a.date).toLocaleDateString("pt-BR")} · {brl(a.total)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary">+{brl(a.cashback)}</p>
        <p className="text-xs text-muted-foreground">+{a.points} pts</p>
      </div>
    </button>
  );
}

function ActivateForm({ onDone }: { onDone: (a: Activation) => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setTimeout(() => {
      onDone(simulateActivation(code.trim()));
      setCode("");
      setLoading(false);
    }, 900);
  };

  return (
    <section className="space-y-4 md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start md:gap-8 md:space-y-0">
      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-card p-5 shadow-soft md:p-7">
        <div>
          <h2 className="font-display text-xl font-bold md:text-2xl">Ativar código</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Digite o código impresso na sua comanda ou recebido no estabelecimento.
          </p>
        </div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: CRNL-7781"
          className="w-full rounded-2xl border-2 border-input bg-background px-5 py-4 text-center font-display text-xl uppercase tracking-widest outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={!code.trim() || loading}
          className="bg-hero w-full rounded-2xl py-4 font-display font-bold text-primary-foreground shadow-glow disabled:opacity-50"
        >
          {loading ? "Validando..." : "Ativar"}
        </button>
        <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground md:hidden">
          Modo MVP: qualquer código é aceito e vinculado ao Coronel Bar.
        </p>
      </form>

      <div className="hidden rounded-2xl bg-secondary p-6 md:block">
        <p className="font-display font-bold text-secondary-foreground">O que você recebe</p>
        <ul className="mt-4 space-y-3 text-sm text-secondary-foreground">
          <li className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
            <span>Cashback por consumo</span>
            <span className="font-display font-bold">5%</span>
          </li>
          <li className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
            <span>Pontos por real gasto</span>
            <span className="font-display font-bold">1 pt</span>
          </li>
          <li className="flex items-baseline justify-between gap-3">
            <span>Exemplo de casa</span>
            <span className="font-display font-bold">Coronel Bar</span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-secondary-foreground/80">
          A recompensa aparece assim que o código é validado.
        </p>
      </div>
    </section>
  );
}

function Places({ list, onOpen }: { list: Activation[]; onOpen: (a: Activation) => void }) {
  const groups = Object.values(
    list.reduce<Record<string, { name: string; cat: string; visits: number; total: number; cb: number; pts: number }>>((acc, a) => {
      const g = (acc[a.establishment] ??= { name: a.establishment, cat: a.category, visits: 0, total: 0, cb: 0, pts: 0 });
      g.visits++; g.total += a.total; g.cb += a.cashback; g.pts += a.points;
      return acc;
    }, {}),
  );
  const wide = groups.length === 1;

  return (
    <section className="space-y-4 md:space-y-6">
      <h2 className="font-display text-xl font-bold md:text-2xl">Meus estabelecimentos</h2>
      {groups.length === 0 && (
        <p className="rounded-2xl bg-card p-5 text-sm text-muted-foreground shadow-soft">
          Você ainda não tem estabelecimentos. Ative um código para aparecer aqui.
        </p>
      )}
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5">
        {groups.map((g) => (
          <div
            key={g.name}
            className={`rounded-2xl bg-card p-5 shadow-soft md:p-6 ${wide ? "md:col-span-2" : ""}`}
          >
            <div className={wide ? "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8" : ""}>
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl">🍺</div>
                  <div>
                    <p className="font-display font-bold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{g.cat} · {g.visits} visita(s)</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center md:gap-3">
                  <Stat l="Consumido" v={brl(g.total)} />
                  <Stat l="Cashback" v={brl(g.cb)} />
                  <Stat l="Pontos" v={String(g.pts)} />
                </div>
              </div>
              <div
                className={`mt-4 space-y-2 border-t border-border pt-4 ${
                  wide ? "md:mt-0 md:border-l md:border-t-0 md:pl-8" : ""
                }`}
              >
                {list
                  .filter((a) => a.establishment === g.name)
                  .slice(0, 3)
                  .map((a) => (
                    <button
                      key={a.id}
                      onClick={() => onOpen(a)}
                      className="flex w-full items-center justify-between rounded-xl bg-muted px-4 py-3 text-left text-xs"
                    >
                      <span className="text-muted-foreground">
                        {new Date(a.date).toLocaleDateString("pt-BR")} · {a.code}
                      </span>
                      <span className="font-bold text-primary">+{brl(a.cashback)}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl bg-muted p-2 md:p-3">
      <p className="text-[10px] text-muted-foreground">{l}</p>
      <p className="text-sm font-bold text-primary md:text-base">{v}</p>
    </div>
  );
}

function ResultSheet({ a, onClose }: { a: Activation; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 md:items-center md:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-in slide-in-from-bottom-8 w-full max-w-md rounded-t-[2rem] bg-card p-6 duration-300 md:max-w-lg md:rounded-[2rem] md:p-8"
      >
        <div className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-3xl mx-auto">🎉</div>
          <p className="mt-3 text-sm text-muted-foreground">Código {a.code} · {a.establishment}</p>
          <p className="font-display text-3xl font-bold text-primary">+{brl(a.cashback)}</p>
          <p className="font-semibold text-accent-foreground">+{a.points} pontos fidelidade</p>
        </div>
        <div className="mt-5 space-y-2 rounded-2xl bg-muted p-4 text-sm">
          <p className="font-semibold">Seu consumo</p>
          {a.items.map((i) => (
            <div key={i.name} className="flex justify-between">
              <span>{i.qty}x {i.name}</span>
              <span>{brl(i.qty * i.price)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-2 font-bold">
            <span>Total</span><span>{brl(a.total)}</span>
          </div>
        </div>
        <button onClick={onClose} className="bg-hero mt-5 w-full rounded-2xl py-4 font-display font-bold text-primary-foreground">
          Fechar
        </button>
      </div>
    </div>
  );
}

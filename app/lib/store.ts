import { useEffect, useState } from "react";

export type Activation = {
  id: string;
  code: string;
  establishment: string;
  category: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  cashback: number;
  points: number;
  date: string;
};

const KEY = "cashback-activations";

const seed: Activation[] = [
  {
    id: "seed1",
    code: "CRNL-2048",
    establishment: "Coronel Bar",
    category: "Casa boêmia",
    items: [
      { name: "Chopp Pilsen 500ml", qty: 3, price: 14.9 },
      { name: "Porção de bolinho de bacalhau", qty: 1, price: 42 },
    ],
    total: 86.7,
    cashback: 4.34,
    points: 87,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

// MVP: bypass de validação — qualquer código é aceito.
export function simulateActivation(code: string): Activation {
  const menu = [
    { name: "Chopp Pilsen 500ml", price: 14.9 },
    { name: "Caipirinha de cachaça", price: 22 },
    { name: "Porção de mandioca frita", price: 34 },
    { name: "Bolinho de bacalhau", price: 42 },
    { name: "Gin tônica", price: 32 },
    { name: "Couvert artístico", price: 15 },
  ];
  const n = 2 + Math.floor(Math.random() * 3);
  const items = [...menu]
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
    .map((m) => ({ ...m, qty: 1 + Math.floor(Math.random() * 3) }));
  const total = +items.reduce((s, i) => s + i.qty * i.price, 0).toFixed(2);
  return {
    id: crypto.randomUUID(),
    code: code.toUpperCase(),
    establishment: "Coronel Bar",
    category: "Casa boêmia",
    items,
    total,
    cashback: +(total * 0.05).toFixed(2),
    points: Math.round(total),
    date: new Date().toISOString(),
  };
}

export function useActivations() {
  const [list, setList] = useState<Activation[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    setList(raw ? JSON.parse(raw) : seed);
  }, []);
  const add = (a: Activation) => {
    setList((prev) => {
      const next = [a, ...prev];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };
  return { list, add };
}

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

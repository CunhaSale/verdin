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
    date: "2024-01-01T12:00:00.000Z",
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
  const base = Array.from(code.toUpperCase()).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const n = 2 + (base % 3);
  const items = [...menu]
    .map((m, index) => ({ ...m, order: (base + index * 17) % 997 }))
    .sort((a, b) => a.order - b.order)
    .slice(0, n)
    .map((m, index) => ({ ...m, qty: 1 + ((base + index * 13) % 3) }));
  const total = +items.reduce((s, i) => s + i.qty * i.price, 0).toFixed(2);
  const normalizedCode = code.toUpperCase();
  const generatedId = `act-${Array.from(normalizedCode)
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
    .toString(16)
    .padStart(8, "0")}`;

  return {
    id: generatedId,
    code: normalizedCode,
    establishment: "Coronel Bar",
    category: "Casa boêmia",
    items: items.map(({ order, ...item }) => item),
    total,
    cashback: +(total * 0.05).toFixed(2),
    points: Math.round(total),
    date: new Date(Date.UTC(2024, 0, 1 + (base % 28), 12, 0, 0)).toISOString(),
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

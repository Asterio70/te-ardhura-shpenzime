// src/App.jsx (Brenda return(...))

<div className="filter-section">
    {/* Inputi 'Nga Data' */}
    <label>Nga Data</label>
    <input 
        type="date"
        name="nga"
        value={filterParams.nga}
        onChange={handleFilterChange}
    />
    
    {/* Inputi 'Deri më' */}
    <label>Deri më</label>
    <input 
        type="date"
        name="deri"
        value={filterParams.deri}
        onChange={handleFilterChange}
    />
    
    {/* Dropdown 'Lloji' */}
    <select name="lloji" value={filterParams.lloji} onChange={handleFilterChange}>
        <option value="Të gjithë">Të gjithë</option>
        <option value="Te ardhurat">Të Ardhurat</option>
        <option value="Shpenzim">Shpenzim</option>
    </select>
    
    {/* ... (Kategoritë dhe Nënkategoritë vendosen në mënyrë të ngjashme) */}
</div>

{/* ... (Më poshtë shfaqni listën e transaksioneve (transaksionet)) */}// src/App.jsx (Brenda funksionit App())

useEffect(() => {
    if (!user) return; // Mos vepro nëse përdoruesi nuk është i kyçur

    const transaksionetRef = collection(db, 'transaksionet');
    
    // 1. Defino bazën e query-së (kërkesës)
    let qBase = transaksionetRef;
    
    // 2. Krijoni listën e kushteve (where clauses)
    let whereClauses = [];

    // KRITIKJA E SIGURISË: Filtri i ID-së së Përdoruesit
    whereClauses.push(where("userId", "==", user.uid)); 
    
    // FILTRI I DATËS: Nga Data (Data në Firestore duhet të jetë në format Date ose Timestamp)
    // Supozojmë se në Firestore e ruani fushën e datës si 'data' në formatin string YYYY-MM-DD
    if (filterParams.nga) {
        whereClauses.push(where("data", ">=", filterParams.nga)); 
    }
    // FILTRI I DATËS: Deri në Datë
    if (filterParams.deri) {
        whereClauses.push(where("data", "<=", filterParams.deri));
    }

    // FILTRA TË TJERË (LLOJI/KATEGORIA)
    if (filterParams.lloji !== 'Të gjithë') {
        whereClauses.push(where("lloji", "==", filterParams.lloji));
    }
    if (filterParams.kategoria !== 'Të gjithë') {
        whereClauses.push(where("kategoria", "==", filterParams.kategoria));
    }
    // (Përsëriteni këtë për nenkategoria)

    // 3. Kombinoni Query-në me të gjitha kushtet
    const q = query(
        qBase, 
        ...whereClauses, // Shpërndajini të gjitha kushtet 'where'
        orderBy("data", "desc") // Për transaksione me rang datash, renditja duhet të jetë në fushën e datës
    );

    // 4. Vendosni dëgjuesin (onSnapshot)
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const lista = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));
        setTransaksionet(lista);
    });

    return () => unsubscribe(); 

// Dëgjuesi ri-ekzekutohet sa herë që ndryshon një nga varësitë
}, [filterParams, user]);// src/App.jsx (Brenda funksionit App())

// ... (user, transaksionet, etj. state)

// Gjendja për ruajtjen e vlerave të filtrit
const [filterParams, setFilterParams] = useState({
    nga: '2025-09-30', // Shembull date siç shihet në pamjen e ekranit
    deri: '2025-10-30', // Shembull date
    lloji: 'Të gjithë', // Siç shihni në pamjen e ekranit
    kategoria: 'Të gjithë',
    nenkategoria: 'Të gjithë',
});

// Funksion i përgjithshëm për përditësimin e state-s së filtrit
const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams(prev => ({
        ...prev,
        [name]: value,
    }));
};

// ...// src/App.jsx (Brenda return(...))

{/* ... Forma e Shtimit të Transaksionit ... */}

<div className="balance-container">
    <div className="balance-item te-ardhura">
        <label>Të ardhurat</label>
        <span>€{totaliTeArdhurave.toFixed(2)}</span> {/* €1,650.00 */}
    </div>
    
    <div className="balance-item shpenzime">
        <label>Shpenzimet</label>
        <span>€{totaliShpenzimeve.toFixed(2)}</span> {/* €1,292.20 */}
    </div>

    <div className="balance-item teprica">
        <label>Tepricë</label>
        <span>€{teprica.toFixed(2)}</span> {/* €357.80 */}
    </div>
</div>

{/* ... Lista e Transaksioneve ... */}// src/App.jsx (Sigurohuni që të keni importuar useMemo)

import React, { useState, useEffect, useMemo } from 'react'; // <--- Shtoni useMemo këtu

import { db, auth } from './firebase'; 
// ... (Importet e tjera)

function App() {
    // 1. Gjendja e përdoruesit (Nga hapat e mëparshëm)
    const [user, setUser] = useState(null); 
    // ...
    
    // 2. Gjendja e Transaksioneve (Nga onSnapshot)
    const [transaksionet, setTransaksionet] = useState([]);
    
    // ... (Logjika useEffect për onAuthStateChanged dhe onSnapshot shkon këtu)
    
    // 3. Llogaritja e Balancës me useMemo
    const { 
        totaliTeArdhurave, 
        totaliShpenzimeve, 
        teprica 
    } = useMemo(() => {
        let teArdhurat = 0;
        let shpenzimet = 0;

        transaksionet.forEach(t => {
            const shuma = Number(t.shuma);
            // Përdorni 'lloji' siç e keni ruajtur në Firestore (p.sh., "Te ardhurat" ose "Shpenzim")
            if (t.lloji === 'Te ardhurat') {
                teArdhurat += shuma;
            } else if (t.lloji === 'Shpenzim') {
                shpenzimet += shuma;
            }
        });

        return {
            totaliTeArdhurave: teArdhurat,
            totaliShpenzimeve: shpenzimet,
            teprica: teArdhurat - shpenzimet
        };
    }, [transaksionet]); // Varësia e vetme është lista e transaksioneve
    
    // ... (Pjesa Render - return (...))// Vendosni këtë funksion në src/App.jsx

const perditesoTransaksionin = async (transaksionId, fushaTeReja) => {
    
    // Për shembull: fushaTeReja mund të jetë { shuma: 75.00, shenime: "Fatura e re" }

    try {
        // 1. Krijoni referencën tek dokumenti specifik
        const dokumentiRef = doc(db, "transaksionet", transaksionId);

        // 2. Përditësoni dokumentin. 
        // updateDoc ndryshon vetëm fushat që i jepni (nuk i fshin të tjerat)
        await updateDoc(dokumentiRef, fushaTeReja);

        console.log("Transaksioni me ID", transaksionId, "u përditësua me sukses!");
        // UI do të përditësohet automatikisht falë onSnapshot

    } catch (error) {
        console.error("Gabim gjatë përditësimit të transaksionit:", error);
        alert("Gabim gjatë përditësimit.");
    }
};// src/App.jsx

// Kjo linjë do të ketë nevojë për 'updateDoc'
import { 
    collection, 
    addDoc, 
    doc, 
    deleteDoc, 
    updateDoc, // <--- SHTONI KËTË
    onSnapshot, 
    query, 
    orderBy 
} from 'firebase/firestore';// src/App.jsx (ose ku shfaqet lista)

import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 

// Importoni funksionet e nevojshme të leximit nga Firestore
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore'; 

// ... pjesa tjetër e koditimport { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Shembull: ruajtje shpenzimi
async function ruajShpenzim(shpenzim) {
  try {
    await addDoc(collection(db, "shpenzime"), shpenzim);
    console.log("Shpenzimi u ruajt me sukses!");
  } catch (e) {
    console.error("Gabim gjatë ruajtjes së shpenzimit:", e);
  }
}

// Shembull: lexim i të gjitha shpenzimeve
async function lexoShpenzime() {
  const querySnapshot = await getDocs(collection(db, "shpenzime"));
  const lista = [];
  querySnapshot.forEach((doc) => {
    lista.push({ id: doc.id, ...doc.data() });
  });
  return lista;
}
import { app } from "./firebase";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";

const LS_KEY = "ies-trx-v5"; // v5: Export PDF + Backup JSON

const CATS_DEFAULT = [
  {
    id: "te-ardhura",
    label: "Të ardhura",
    type: "income",
    subs: [
      { id: "page", label: "Pagë" },
      { id: "shitje", label: "Shitje" },
      { id: "bonus", label: "Bonus" },
      { id: "te-tjera", label: "Të tjera" },
    ],
  },
  {
    id: "shpenzime",
    label: "Shpenzime",
    type: "expense",
    subs: [
      { id: "ushqim", label: "Ushqim" },
      { id: "qira", label: "Qira" },
      { id: "transport", label: "Transport" },
      { id: "fatura", label: "Fatura" },
      { id: "argetim", label: "Argëtim" },
      { id: "shendet", label: "Shëndet" },
      { id: "te-tjera", label: "Të tjera" },
    ],
  },
];

function formatMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString("sq-AL", { style: "currency", currency: "EUR" });
}

const toISODate = (d) => new Date(d).toISOString().slice(0, 10);
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
function monthKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

export default function IncomeExpenseApp() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [online, setOnline] = useState(true);

  // Register Service Worker + online status
  useEffect(() => {
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost";
    if ("serviceWorker" in navigator && isSecure) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
    const syncOnline = () => setOnline(navigator.onLine);
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    syncOnline();
    return () => {
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Filters
  const today = new Date();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [cat, setCat] = useState("all");
  const [subcat, setSubcat] = useState("all");
  const [from, setFrom] = useState(toISODate(startOfMonth(today)));
  const [to, setTo] = useState(toISODate(endOfMonth(today)));

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        const inType = type === "all" || t.type === type;
        const inCat = cat === "all" || t.category === cat;
        const inSub = subcat === "all" || t.subcategory === subcat;
        const inText =
          !q ||
          t.notes?.toLowerCase().includes(q.toLowerCase()) ||
          t.category?.toLowerCase().includes(q.toLowerCase()) ||
          t.subcategory?.toLowerCase().includes(q.toLowerCase());
        const inDate = (!from || t.date >= from) && (!to || t.date <= to);
        return inType && inCat && inSub && inText && inDate;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, type, cat, subcat, q, from, to]);

  const summary = useMemo(() => {
    const inc = filtered
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const exp = filtered
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    return { inc, exp, net: inc - exp };
  }, [filtered]);

  const monthly = useMemo(() => {
    const map = new Map();
    transactions.forEach((t) => {
      const k = monthKey(t.date);
      if (!map.has(k)) map.set(k, { month: k, income: 0, expense: 0, surplus: 0 });
      const row = map.get(k);
      if (t.type === "income") row.income += Number(t.amount || 0);
      else row.expense += Number(t.amount || 0);
      row.surplus = row.income - row.expense;
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  // Pie data for expenses by subcategory
  const pieData = useMemo(() => {
    const m = new Map();
    const expenses = filtered.filter((t) => t.type === "expense");
    expenses.forEach((t) => {
      const name = t.subcategory || "Tjetër";
      const val = Number(t.amount || 0);
      m.set(name, (m.get(name) || 0) + val);
    });
    return Array.from(m, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value - a.value
    );
  }, [filtered]);

  // Form defaults
  const expenseCat = CATS_DEFAULT.find((c) => c.type === "expense");
  const incomeCat = CATS_DEFAULT.find((c) => c.type === "income");
  const [form, setForm] = useState({
    date: toISODate(today),
    type: "expense",
    category: expenseCat?.id,
    subcategory: expenseCat?.subs[0]?.id,
    amount: "",
    notes: "",
  });
  const amountRef = useRef(null);

  function addTrx(e) {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!amt) return;
    const newT = { id: uuid(), ...form, amount: amt };
    setTransactions((prev) => [newT, ...prev]);
    setForm((f) => ({ ...f, amount: "", notes: "" }));
    amountRef.current?.focus();
  }

  function removeTrx(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function clearAll() {
    if (confirm("Je i sigurt që do t'i fshish të gjitha?")) setTransactions([]);
  }

  // Export PDF report (simple print to PDF)
  function exportMonthlyPDF() {
    const rows = monthly.map((m) => ({
      Muaji: m.month,
      "Të ardhura": m.income,
      Shpenzime: m.expense,
      Tepricë: m.surplus,
    }));
    const w = window.open("", "printwin");
    if (!w) return;
    const style = `
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial; padding:24px;}
        h1{font-size:20px;margin:0 0 8px}
        .muted{color:#475569;font-size:12px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border-bottom:1px solid #e2e8f0;padding:6px 8px;text-align:right}
        th:first-child,td:first-child{text-align:left}
      </style>`;
    const now = new Date();
    const head = `<h1>Raport Mujor — Të ardhura & Shpenzime</h1><div class="muted">Gjeneruar më ${now.toLocaleString(
      "sq-AL"
    )}</div>`;
    const tableHead =
      "<thead><tr><th>Muaji</th><th>Të ardhura</th><th>Shpenzime</th><th>Tepricë</th></tr></thead>";
    const fmt = (n) =>
      Number(n || 0).toLocaleString("sq-AL", { style: "currency", currency: "EUR" });
    const tableRows = rows
      .map(
        (r) =>
          `<tr><td>${r.Muaji}</td><td>${fmt(r["Të ardhura"])}</td><td>${fmt(
            r.Shpenzime
          )}</td><td>${fmt(r.Tepricë)}</td></tr>`
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8">${style}</head><body>${head}<table>${tableHead}<tbody>${tableRows}</tbody></table></body></html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  // Backup & restore JSON
  function exportBackupJSON() {
    const data = { version: "v5", exportedAt: new Date().toISOString(), transactions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-te-ardhura-shpenzime.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function importBackupJSON(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result || "{}"));
        if (!Array.isArray(obj.transactions)) throw new Error("formati");
        setTransactions(
          obj.transactions.map((t) => ({
            id: t.id || uuid(),
            date: t.date,
            type: t.type === "income" ? "income" : "expense",
            category: t.category,
            subcategory: t.subcategory,
            amount: Number(t.amount) || 0,
            notes: t.notes || "",
          }))
        );
        alert("Backup u rikthye me sukses!");
      } catch (err) {
        alert("Nuk u rikthye dot backup. Kontrollo skedarin.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const categoriesForType = form.type === "income" ? incomeCat : expenseCat;
  const currentSubs = categoriesForType?.subs || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Të ardhura & Shpenzime</h1>
          <div className="flex flex-wrap items-center gap-2">
            {!online && (
              <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                Offline
              </span>
            )}
            <button
              onClick={exportMonthlyPDF}
              className="px-3 py-1.5 rounded-xl shadow bg-slate-900 text-white"
            >
              Eksporto PDF (Raporti)
            </button>
            <button
              onClick={exportBackupJSON}
              className="px-3 py-1.5 rounded-xl shadow bg-slate-200"
            >
              Backup JSON
            </button>
            <label className="px-3 py-1.5 rounded-xl shadow bg-slate-200 cursor-pointer">
              Rikthe JSON
              <input
                type="file"
                accept="application/json,.json"
                onChange={importBackupJSON}
                className="hidden"
              />
            </label>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-xl shadow bg-rose-600 text-white"
            >
              Fshi të gjitha
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid gap-4 md:grid-cols-3">
        {/* Form */}
        <section className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="font-semibold text-lg">Shto transaksion</h2>
            <form onSubmit={addTrx} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm">Data</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full mt-1 rounded-xl border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm">Lloji</label>
                  <select
                    value={form.type}
                    onChange={(e) => {
                      const val = e.target.value;
                      const cat = val === "income" ? incomeCat : expenseCat;
                      setForm((f) => ({
                        ...f,
                        type: val,
                        category: cat?.id,
                        subcategory: cat?.subs[0]?.id,
                      }));
                    }}
                    className="w-full mt-1 rounded-xl border px-3 py-2"
                  >
                    <option value="income">Të ardhura</option>
                    <option value="expense">Shpenzim</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm">Kategoria</label>
                <select
                  value={form.category}
                  onChange={(e) => {
                    const catId = e.target.value;
                    const catObj = CATS_DEFAULT.find((c) => c.id === catId);
                    setForm((f) => ({
                      ...f,
                      category: catId,
                      subcategory: catObj?.subs[0]?.id,
                    }));
                  }}
                  className="w-full mt-1 rounded-xl border px-3 py-2"
                >
                  {CATS_DEFAULT.filter((c) => c.type === form.type).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm">Nënkategoria</label>
                <select
                  value={form.subcategory}
                  onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}
                  className="w-full mt-1 rounded-xl border px-3 py-2"
                >
                  {currentSubs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm">Shuma</label>
                <input
                  ref={amountRef}
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full mt-1 rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm">Shënime</label>
                <input
                  type="text"
                  placeholder="opsionale"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full mt-1 rounded-xl border px-3 py-2"
                />
              </div>
              <button type="submit" className="w-full rounded-xl bg-emerald-600 text-white py-2 shadow">
                Shto
              </button>
            </form>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-50 rounded-xl p-3">
                <div className="text-xs text-emerald-700">Të ardhura</div>
                <div className="font-bold">{formatMoney(summary.inc)}</div>
              </div>
              <div className="bg-rose-50 rounded-xl p-3">
                <div className="text-xs text-rose-700">Shpenzime</div>
                <div className="font-bold">{formatMoney(summary.exp)}</div>
              </div>
              <div className="bg-slate-100 rounded-xl p-3">
                <div className="text-xs text-slate-600">Tepricë</div>
                <div className="font-bold">{formatMoney(summary.net)}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters + List + Charts */}
        <section className="md:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex flex-col md:flex-row gap-2 md:items-end">
              <div className="flex-1">
                <label className="text-sm">Kërko</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="shënime, kategori ose nënkategori"
                  className="w-full mt-1 rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm">Nga data</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full mt-1 rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm">Deri më</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full mt-1 rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm">Lloji</label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setCat("all");
                    setSubcat("all");
                  }}
                  className="w-full mt-1 rounded-xl border px-3 py-2"
                >
                  <option value="all">Të gjitha</option>
                  <option value="income">Të ardhura</option>
                  <option value="expense">Shpenzime</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Kategoria</label>
                <select
                  value={cat}
                  onChange={(e) => {
                    setCat(e.target.value);
                    setSubcat("all");
                  }}
                  className="w-full mt-1 rounded-xl border px-3 py-2"
                >
                  <option value="all">Të gjitha</option>
                  {CATS_DEFAULT.filter((c) => type === "all" || c.type === type).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm">Nënkategoria</label>
                <select
                  value={subcat}
                  onChange={(e) => setSubcat(e.target.value)}
                  className="w-full mt-1 rounded-xl border px-3 py-2"
                >
                  <option value="all">Të gjitha</option>
                  {(cat === "all" ? [] : CATS_DEFAULT.find((c) => c.id === cat)?.subs || []).map(
                    (s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-3">Transaksionet</h3>
            {filtered.length === 0 ? (
              <div className="text-slate-500 text-sm">S'ka të dhëna për këtë filtër.</div>
            ) : (
              <ul className="divide-y">
                {filtered.map((t) => (
                  <li key={t.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                          t.type === "income"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                      </span>
                      <div>
                        <div className="font-medium">
                          {formatMoney(t.amount)} •{" "}
                          <span className="text-slate-500 text-sm">
                            {t.category} → {t.subcategory}
                          </span>
                        </div>
                        <div className="text-slate-500 text-xs">
                          {new Date(t.date).toLocaleDateString("sq-AL")} {t.notes && "•"}{" "}
                          {t.notes}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeTrx(t.id)} className="text-rose-600 text-sm">
                      Fshi
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Monthly Table */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-3">Raport Mujor</h3>
            {monthly.length === 0 ? (
              <div className="text-slate-500 text-sm">S'ka të dhëna ende.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Muaji</th>
                    <th className="text-right py-1">Të ardhura</th>
                    <th className="text-right py-1">Shpenzime</th>
                    <th className="text-right py-1">Tepricë</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m) => (
                    <tr key={m.month} className="border-b last:border-0">
                      <td className="py-1">{m.month}</td>
                      <td className="text-right">{formatMoney(m.income)}</td>
                      <td className="text-right">{formatMoney(m.expense)}</td>
                      <td className="text-right">{formatMoney(m.surplus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 6-month Chart */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-3">6 muajt e fundit</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthly.slice(-6)} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="expense" name="Shpenzime" />
                  <Bar dataKey="surplus" name="Tepricë" />
                  <Line type="monotone" dataKey="income" name="Të ardhura" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-3">Shpërndarja e shpenzimeve (nënkategori)</h3>
            {pieData.length === 0 ? (
              <div className="text-slate-500 text-sm">Nuk ka shpenzime në këtë filtër.</div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" label outerRadius={110} />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-10 text-center text-xs text-slate-500">
        Funksionon offline me Service Worker. Në çdo muaj: Të ardhura = Shpenzime + Tepricë.
      </footer>
    </div>
  );
}

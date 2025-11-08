"use client";

import { useEffect, useState } from "react";
import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion"; // سنضيفها لاحقاً
import {
  Globe,
  Layers,
  Book,
  DollarSign,
  Target,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ArrowRight
} from "lucide-react";

/* =========================
   Config (shared with backend)
   ========================= */
const INDUSTRY_CONFIG = {
  jewelry: {
    label: "Jewelry & Precious Metals",
    costFields: [
      { name: "material_type", label: "Primary Material (e.g., Gold 21K)", type: "text" },
      { name: "material_weight_g", label: "Weight (grams)", type: "number" },
      { name: "manufacturing_cost", label: "Manufacturing Cost (local)", type: "number" },
    ],
  },
  fashion: {
    label: "Fashion & Apparel",
    costFields: [
      { name: "fabric_cost", label: "Fabric Cost", type: "number" },
      { name: "labor_cost", label: "Cut & Sew Labor", type: "number" },
      { name: "accessories_cost", label: "Accessories", type: "number" },
    ],
  },
  retail: {
    label: "General Retail / Resale",
    costFields: [{ name: "wholesale_unit_cost", label: "Wholesale Unit Cost", type: "number" }],
  },
};

const COUNTRY_CONFIG = {
  EG: { name: "Egypt", currency: "EGP", locale: "ar-EG" },
  SA: { name: "Saudi Arabia", currency: "SAR", locale: "ar-SA" },
  AE: { name: "UAE", currency: "AED", locale: "ar-AE" },
  US: { name: "USA", currency: "USD", locale: "en-US" },
};

/* =========================
   Small UI primitives
   ========================= */
const InputField = ({ label, name, type = "text", currency, placeholder, value, onChange, icon: Icon }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-300">{label}</label>
    <div className="relative mt-1 rounded-md shadow-sm">
      {Icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>}
      <input
        type={type}
        name={name}
        id={name}
        value={value ?? ""}
        onChange={e => onChange(name, e.target.value)}
        className={`block w-full rounded-md border-gray-600 bg-gray-700 text-white ${Icon ? 'pl-10' : 'pl-4'} ${currency ? 'pr-12' : 'pr-4'} py-2.5`}
        placeholder={placeholder}
      />
      {currency && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <span className="text-gray-400 sm:text-sm">{currency}</span>
      </div>}
    </div>
  </div>
);

const SelectField = ({ label, name, options, value, onChange, icon: Icon }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-300">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <select
        id={name}
        name={name}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        className="block w-full appearance-none rounded-md border border-gray-600 bg-gray-700 py-2.5 pl-10 pr-10 text-white shadow-sm"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  </div>
);

const ResultCard = ({ title, value, unit, icon: Icon }) => (
  <div className="rounded-lg bg-gray-800 p-5 shadow-lg">
    <div className="flex items-center">
      <div className="rounded-full p-2 bg-gray-600 bg-opacity-20">
        <Icon className="h-6 w-6 text-gray-300" />
      </div>
      <dt className="ml-3 text-sm font-medium text-gray-400">{title}</dt>
    </div>
    <dd className="mt-2 flex items-baseline justify-between">
      <span className="text-3xl font-semibold tracking-tight text-white">{value}</span>
      <span className="text-lg font-medium text-gray-400">{unit}</span>
    </dd>
  </div>
);

const AdvisorCard = ({ action, recommendation, difference, currency }) => {
  const isRaise = action === 'RAISE';
  const isLower = action === 'LOWER';
  const isMaintain = action === 'MAINTAIN';
  const icon = isRaise ? <ArrowUpRight /> : isLower ? <ArrowDownRight /> : <ArrowRight />;
  const color = isRaise ? 'text-red-400' : isLower ? 'text-green-400' : 'text-blue-400';
  const title = isRaise ? "Recommendation: Raise Price" : isLower ? "Opportunity: Lower Price" : "Action: Maintain Price";
  return (
    <div className={`rounded-lg bg-gray-800 p-6 shadow-lg border-l-4 ${isRaise ? 'border-red-500' : isLower ? 'border-green-500' : 'border-blue-500'}`}>
      <div className="flex items-center">
        <div className={`rounded-full p-2 ${color} bg-opacity-20`}>{icon}</div>
        <h3 className="ml-3 text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-4 text-gray-300">
        To reach target margin <span className="font-bold">{recommendation.targetMargin}%</span>, recommended price is <span className={`font-bold text-xl ${color}`}>{recommendation.price} {currency}</span>.
      </p>
      <p className="mt-2 text-sm text-gray-400">(Price Difference: <span className={`font-medium ${color}`}>{difference} {currency}</span>)</p>
    </div>
  );
};

export default function PricingDashboard() {
  const [industry, setIndustry] = useState('jewelry');
  const [country, setCountry] = useState('SA');
  const [projectName, setProjectName] = useState('Artisan Silver Ring');
  const [formValues, setFormValues] = useState({});
  const [targetMargin, setTargetMargin] = useState(60);
  const [currentPrice, setCurrentPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // initialize form fields for current industry
    const cfg = INDUSTRY_CONFIG[industry];
    const init = {};
    cfg.costFields.forEach(f => init[f.name] = '');
    setFormValues(init);
  }, [industry]);

  const onFieldChange = (name, value) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleRunAnalysis = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setResult(null);
    setLogs([]);
    try {
      const payload = {
        project_name: projectName,
        industry_type: industry,
        target_country: country,
        target_margin: Number(targetMargin),
        current_price: Number(currentPrice || 0),
        cost_breakdown: formValues
      };
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const res = await axios.post(`${apiBase}/analyze`, payload, { timeout: 20000 });
      setResult(res.data);
      setLogs(res.data.logs || []);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Network error';
      setLogs([{ t: new Date().toISOString(), lvl: 'ERROR', msg }]);
    } finally {
      setLoading(false);
    }
  };

  const currentIndustry = INDUSTRY_CONFIG[industry];
  const currency = (COUNTRY_CONFIG[country] || { currency: 'USD' }).currency;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">Smart Pricing Dashboard</h1>
            <p className="text-lg text-gray-400">AI-Powered Financial Analysis (v2.4.0)</p>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <select className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm text-white" onChange={e=>{}}>
              <option value="en">English (US)</option>
              <option value="ar">العربية (EG)</option>
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <form onSubmit={handleRunAnalysis} className="space-y-6 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">1. Project Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Target Market (Country)"
                name="target_country"
                icon={Globe}
                options={Object.entries(COUNTRY_CONFIG).map(([val,data])=>({ value: val, label: data.name }))}
                value={country}
                onChange={(n,v)=>setCountry(v)}
              />
              <SelectField
                label="Industry Type"
                name="industry_type"
                icon={Layers}
                options={Object.entries(INDUSTRY_CONFIG).map(([val,data])=>({ value: val, label: data.label }))}
                value={industry}
                onChange={(n,v)=>setIndustry(v)}
              />
            </div>
            <InputField label="Project Name" name="project_name" icon={Book} placeholder="e.g., Artisan Silver Ring" value={projectName} onChange={(n,v)=>setProjectName(v)} />

            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pt-4 pb-3">2. Dynamic Cost Model</h2>
            <div className="space-y-4">
              {currentIndustry.costFields.map(field => (
                <InputField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  placeholder={field.type === 'number' ? '0.00' : '...'}
                  currency={field.unit === 'currency' ? currency : null}
                  icon={DollarSign}
                  value={formValues[field.name]}
                  onChange={onFieldChange}
                />
              ))}
            </div>

            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pt-4 pb-3">3. Pricing Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <InputField
                label="Target Margin (%)"
                name="target_margin"
                type="number"
                icon={Target}
                placeholder="60"
                value={targetMargin}
                onChange={(n,v)=>setTargetMargin(v)}
                currency="%"
              />
              <InputField
                label="Current Unit Price"
                name="current_price"
                type="number"
                icon={DollarSign}
                placeholder="0.00"
                value={currentPrice}
                onChange={(n,v)=>setCurrentPrice(v)}
                currency={currency}
              />
            </div>

            <div className="flex space-x-3">
              <button type="submit" disabled={loading} className="flex-1 rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white hover:bg-indigo-500">
                {loading ? "Running..." : <><Zap className="w-5 h-5 mr-2 inline-block" /> Run Financial Analysis</>}
              </button>
              <button type="button" onClick={()=>{ setFormValues({}); setResult(null); setLogs([]); }} className="rounded-md bg-gray-700 px-4 py-3 text-white">Reset</button>
            </div>
          </form>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ResultCard title="Computed Unit Cost" value={result ? result.computed_cost : "-"} unit={result ? result.currency : currency} icon={DollarSign} />
              <ResultCard title="Recommended Price" value={result ? result.advisor.recommendedPrice : "-"} unit={result ? result.currency : currency} icon={CheckCircle2} />
            </div>

            <AdvisorCard
              action={result ? result.advisor.action : "HOLD"}
              recommendation={{ targetMargin: result ? result.advisor.targetMargin : targetMargin, price: result ? result.advisor.recommendedPrice : "-" }}
              difference={result ? result.advisor.priceDifference : "-"}
              currency={result ? result.currency : currency}
            />

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-white mb-3">Execution Logs</h2>
              <div className="h-64 overflow-y-auto rounded-lg bg-gray-800 p-4 border border-gray-700 shadow-inner">
                <ul className="space-y-2">
                  {logs.length ? logs.map((log,i)=>(
                    <li key={i} className="flex items-center text-sm font-mono">
                      <span className={`mr-2 ${log.lvl === 'ERROR' ? 'text-red-400' : log.lvl === 'WARN' ? 'text-yellow-400' : 'text-indigo-300'}`}>[{log.lvl}]</span>
                      <span className="text-gray-400">{log.msg}</span>
                    </li>
                  )) : <li className="text-gray-500">No logs yet — run an analysis.</li>}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

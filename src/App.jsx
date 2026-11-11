import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ShieldCheck, Send, Zap, Lock, Activity, Home, Database, Settings, TerminalSquare, Mic, TrendingUp, CheckCircle, BrainCircuit, Download } from 'lucide-react';

export default function App() {
  const [chatInput, setChatInput] = useState('');
  const [contractReady, setContractReady] = useState(false);
  const [escrowAmount, setEscrowAmount] = useState("150.00");
  const [activeTab, setActiveTab] = useState('home');
  const [isListening, setIsListening] = useState(false);
  const [escrowLocked, setEscrowLocked] = useState(false); // NEW: To show download button
  
  const [chatHistory, setChatHistory] = useState([
    { role: 'agent', text: '⚡ PayGuard AI Active. I am your autonomous escrow agent. Tell me what you are hiring for and the budget.' }
  ]);
  
  const [systemLogs, setSystemLogs] = useState([
    "> [System] PayGuard Autonomous Agent Initialized...",
    "> [Network] Listening for Smart Contract triggers..."
  ]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [systemLogs]);

  const initialOptions = {
    clientId: "BAAwgD0T8eHIWVxGLUl1ihXLQ6H81ru9oMGkYy6plBaRpZui5YppiJwcbNo1Hm4UU1S5yORkLEXFX-NGcs",
    currency: "USD",
  };

  const [rowData, setRowData] = useState([
    { id: "TXN-9942", task: "React UI Fixes", freelancer: "Alex D.", amount: "$50.00", status: "Funds Released", aiScore: "98% Match" },
  ]);

  const columnDefs = [
    { field: "id", headerName: "Contract ID", flex: 1, minWidth: 100 },
    { field: "freelancer", headerName: "Developer", flex: 1, minWidth: 110 },
    { field: "amount", headerName: "Amount", width: 95 },
    { 
      field: "aiScore", 
      headerName: "AI Validation", 
      width: 125,
      cellRenderer: (params) => (
        <span className={`font-bold ${params.value && params.value.includes('9') ? 'text-emerald-400' : 'text-amber-400'}`}>
          {params.value}
        </span>
      )
    },
    { 
      field: "status", 
      headerName: "Escrow Status", 
      width: 150,
      cellRenderer: (params) => {
        let color = "bg-slate-700 text-slate-300";
        if (params.value === "Secured in Escrow") color = "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
        if (params.value === "Funds Released") color = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        if (params.value === "In Dispute") color = "bg-rose-500/20 text-rose-400 border-rose-500/30";
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>{params.value}</span>;
      }
    }
  ];

  const defaultColDef = useMemo(() => ({ sortable: true, filter: true, resizable: true }), []);
// Calculate dynamic stats from table data
  // Calculate dynamic stats from table data
  const totalVolume = useMemo(() => {
    const sum = rowData.reduce((acc, row) => {
      const val = parseFloat(row.amount.replace(/[^0-9.-]+/g, "")) || 0;
      return acc + val;
    }, 0); // 0 se start hoga, sirf table ki real value lega
    return sum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [rowData]);

  const activeContractsCount = useMemo(() => {
    return rowData.filter(row => row.status === "Secured in Escrow" || row.status === "In Dispute").length;
  }, [rowData]);

  const resolutionAccuracy = useMemo(() => {
    const scoredRows = rowData.filter(row => row.aiScore && row.aiScore.includes('%'));
    if (scoredRows.length === 0) return "100%";
    const totalScore = scoredRows.reduce((acc, row) => {
      const match = row.aiScore.match(/(\d+)%/);
      return acc + (match ? parseInt(match[1]) : 95);
    }, 0);
    return (totalScore / scoredRows.length).toFixed(1) + "%";
  }, [rowData]);
  
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice input. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setChatInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const simulateLogs = (logs, onComplete) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setSystemLogs(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 600);
  };

 const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userText = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');

    const lowerText = userText.toLowerCase();

    // Check if user is denying or reporting an issue
    const isNegative = lowerText.includes('not') || 
                       lowerText.includes('incomplete') || 
                       lowerText.includes('bad') || 
                       lowerText.includes('bug') || 
                       lowerText.includes('fail') || 
                       lowerText.includes('issue');

    if (lowerText.includes('hire') || lowerText.includes('build') || lowerText.includes('$') || lowerText.includes('dollar')) {
      const match = userText.match(/\$?(\d+)\s*(dollars?)?/i);
      const amt = match ? match[1] : "150";
      setEscrowAmount(`${amt}.00`);
      setEscrowLocked(false);
      
      simulateLogs([
        "> [NLP Engine] Intent extracted: CREATE_CONTRACT",
        `> [Parser] Budget identified: $${amt}.00`,
        "> [Smart Contract] Drafting escrow terms...",
        "> [PayPal API] Generating secure payment checkout..."
      ], () => {
        setContractReady(true);
        setChatHistory(prev => [...prev, { role: 'agent', text: `I have drafted an Autonomous Smart Contract. Escrow value: $${amt}.00. Funds will remain locked with PayPal until verified by my AI engine. Authorize payment below.` }]);
      });
    } 
    else if (isNegative) {
      // Runs whenever "not", "incomplete", or issue words are present
      simulateLogs([
        "> [GitHub Auditor] Fetching latest commit...",
        "> [AST Scanner] Analyzing code structure...",
        "> [Security] WARNING: Milestone rejected or code incomplete.",
        "> [AI Verdict] Score: 45%. Requirements NOT met.",
        "> [Escrow Engine] Halting payout. Locking funds."
      ], () => {
        setRowData(prev => prev.map(row => row.status === "Secured in Escrow" ? { ...row, status: "In Dispute", aiScore: "45% Match" } : row));
        setChatHistory(prev => [...prev, { role: 'agent', text: "❌ Code Analysis Failed: 45% Match. Requirements not met or reported incomplete. Funds held securely in Dispute. Developer notified." }]);
      });
    } 
    else if (lowerText.includes('deliver') || lowerText.includes('upload') || lowerText.includes('code') || lowerText.includes('finish') || lowerText.includes('completed') || lowerText.includes('done') || lowerText.includes('task')) {
      // Runs only when completed without any negative words
      simulateLogs([
        "> [GitHub Auditor] Fetching repository branch 'main'...",
        "> [Requirements Check] React UI: PASS | Auth: PASS",
        "> [Security] Vulnerability scan: CLEAN",
        "> [AI Verdict] Score: 98% Match. Approving milestone.",
        "> [PayPal API] Executing payout to Developer Wallet..."
      ], () => {
        setRowData(prev => prev.map(row => row.status === "Secured in Escrow" ? { ...row, status: "Funds Released", aiScore: "98% Match" } : row));
        setChatHistory(prev => [...prev, { role: 'agent', text: "✅ Code analysis complete: 98% requirement verification passed. Security checks clear. Automated payout triggered to developer's PayPal wallet!" }]);
      });
    } 
    else {
      setChatHistory(prev => [...prev, { role: 'agent', text: "State your project scope and budget (e.g., 'Hire dev for $150') or submit code for review." }]);
    }
  };

  const createOrder = (data, actions) => {
    return actions.order.create({ purchase_units: [{ description: "PayGuard AI Escrow Lock", amount: { currency_code: "USD", value: escrowAmount } }] });
  };

  const completeEscrowSuccess = (txnId) => {
    setContractReady(false);
    setEscrowLocked(true);
    setSystemLogs(prev => [...prev, `> [PayPal Webhook] Escrow Locked. TXN_ID: ${txnId}`]);
    setChatHistory(prev => [...prev, { role: 'agent', text: `✅ Escrow locked successfully! $${escrowAmount} secured in PayPal Escrow (ID: ${txnId}). Developer notified to begin.` }]);
    setRowData(prev => [{ id: txnId, task: "Full Stack Milestone", freelancer: "Golu Sah", amount: `$${escrowAmount}`, status: "Secured in Escrow", aiScore: "Pending" }, ...prev]);
  };

  const onApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      completeEscrowSuccess(details?.id ? `TXN-${details.id.slice(-4)}` : "TXN-8821");
    } catch (err) { completeEscrowSuccess("TXN-8821"); }
  };

  // NEW: Simple Native Browser File Download
  const downloadReceipt = () => {
    const receiptContent = `
=========================================
      PAYGUARD AI - ESCROW RECEIPT
=========================================

TRANSACTION ID : TXN-SIM99
AMOUNT SECURED : $${escrowAmount}
STATUS         : SECURED IN ESCROW

PARTIES INVOLVED:
- Client (Automated System)
- Developer (Golu Sah)

AI VERIFICATION TERMS:
1. GitHub Repository AST Syntax Check
2. Live Security Vulnerability Scan
3. Minimum 90% AI Match Score for Payout

-----------------------------------------
Generated by PayGuard Autonomous Agent
Date: ${new Date().toLocaleString()}
    `;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PayGuard_Escrow_TXN-SIM99.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-20 border-r border-slate-800 flex flex-col items-center py-6 gap-8 bg-[#111] flex-shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <ShieldCheck size={24} />
          </div>
          <nav className="flex flex-col gap-8 text-slate-500">
            <Home size={22} onClick={() => setActiveTab('home')} className={`cursor-pointer transition-colors ${activeTab === 'home' ? 'text-indigo-400' : 'hover:text-indigo-400'}`} />
            <Activity size={22} onClick={() => setActiveTab('activity')} className={`cursor-pointer transition-colors ${activeTab === 'activity' ? 'text-indigo-400' : 'hover:text-indigo-400'}`} />
            <Database size={22} onClick={() => setActiveTab('database')} className={`cursor-pointer transition-colors ${activeTab === 'database' ? 'text-indigo-400' : 'hover:text-indigo-400'}`} />
            <Settings size={22} onClick={() => setActiveTab('settings')} className={`cursor-pointer transition-colors mt-auto ${activeTab === 'settings' ? 'text-indigo-400' : 'hover:text-indigo-400'}`} />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden p-6 space-y-6">
          <header className="flex justify-between items-center bg-[#111] border border-slate-800 p-5 rounded-2xl flex-shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">PayGuard <span className="text-indigo-400 font-light">AI</span></h1>
              <p className="text-xs text-slate-500 mt-1">Autonomous Escrow & Milestone Agent powered by PayPal</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Agentic Mode Active
              </span>
            </div>
          </header>

          {activeTab === 'home' ? (
            <div className="flex flex-col flex-1 overflow-hidden space-y-6">
              
              {/* NEW: Stats Cards Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
                <div className="bg-[#111] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-slate-500 text-xs font-semibold mb-1">Total Escrow Volume</p>
                    <h3 className="text-2xl font-bold text-white">${totalVolume}</h3>
                  </div>
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400"><TrendingUp size={22}/></div>
                </div>
                <div className="bg-[#111] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-slate-500 text-xs font-semibold mb-1">Active AI Contracts</p>
                    <h3 className="text-2xl font-bold text-white">{activeContractsCount} Active</h3>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400"><CheckCircle size={22}/></div>
                </div>
                <div className="bg-[#111] border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-slate-500 text-xs font-semibold mb-1">AI Resolution Accuracy</p>
                    <h3 className="text-2xl font-bold text-white">{resolutionAccuracy}</h3>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400"><BrainCircuit size={22}/></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-6 h-full overflow-hidden">
                  <div className="bg-[#111] border border-slate-800 rounded-2xl flex flex-col h-[60%] overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                      <h2 className="font-semibold text-white flex items-center gap-2 text-sm"><Database size={16} className="text-indigo-400"/> Command Center Ledger</h2>
                    </div>
                    <div className="flex-1 ag-theme-quartz-dark w-full h-full" style={{ '--ag-background-color': '#0f172a', '--ag-header-background-color': '#1e293b', '--ag-odd-row-background-color': '#0b1120', '--ag-border-color': '#334155' }}>
                      <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} rowSelection="single" animateRows={true} headerHeight={40} rowHeight={50} />
                    </div>
                  </div>

                  <div className="bg-[#050505] border border-slate-800 rounded-2xl flex flex-col h-[40%] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-full h-full bg-emerald-900/5 pointer-events-none"></div>
                    <div className="p-3 border-b border-slate-800 bg-[#111] flex items-center gap-2">
                      <TerminalSquare size={16} className="text-emerald-400" />
                      <h2 className="font-mono text-xs font-bold text-slate-400">Agent Reason Log // Chain of Thought</h2>
                    </div>
                    <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-500/90 leading-relaxed space-y-1.5 flex-1 custom-scrollbar">
                      {systemLogs.map((log, i) => (
                        <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">{log}</div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="bg-[#111] border border-slate-800 rounded-2xl flex flex-col relative overflow-hidden h-full">
                  <div className="p-5 border-b border-slate-800"><h2 className="font-semibold text-white flex items-center gap-2"><Zap size={18} className="text-amber-400"/> Smart Contract Copilot</h2></div>
                  
                  <div className="flex-1 p-5 overflow-y-auto space-y-4">
                    {chatHistory.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm font-medium leading-relaxed whitespace-pre-line ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-200 border border-slate-700'}`}>{m.text}</div>
                      </div>
                    ))}
                    
                    {contractReady && (
                      <div className="animate-in fade-in zoom-in-95 duration-500 mt-4 p-5 bg-gradient-to-r from-slate-900 to-[#111] border border-indigo-500/50 rounded-2xl shadow-xl shadow-indigo-900/20">
                        <div className="flex items-center justify-between mb-4">
                          <div><h4 className="text-white font-bold text-sm flex items-center gap-1.5"><Lock size={16} className="text-emerald-400"/> Secure Escrow</h4></div>
                          <div className="text-xl font-bold text-white">${escrowAmount}</div>
                        </div>
                        <div className="relative z-10 space-y-3">
                          <PayPalButtons createOrder={createOrder} onApprove={onApprove} style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 40 }} />
                          <button type="button" onClick={() => completeEscrowSuccess("TXN-SIM99")} className="w-full text-center text-xs text-slate-500 hover:text-indigo-400 transition-colors py-1 cursor-pointer">[Demo Mode] Instant Simulate</button>
                        </div>
                      </div>
                    )}

                    {/* NEW: Download Contract Button after Escrow Lock */}
                    {escrowLocked && (
                      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 mt-2">
                        <button 
                          onClick={downloadReceipt}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
                        >
                          <Download size={14} className="text-indigo-400" />
                          Download Escrow Contract
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-800 bg-[#111] relative z-20">
                    <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                      <button 
                        type="button" 
                        onClick={handleVoiceInput}
                        title="Click to speak"
                        className={`p-3 rounded-xl transition-all flex-shrink-0 cursor-pointer ${isListening ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
                      >
                        <Mic size={20} />
                      </button>
                      <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={isListening ? "Listening..." : "E.g., Hire Golu to build a React page for $150..."} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" disabled={contractReady} />
                      <button type="submit" disabled={contractReady} className="bg-indigo-600 disabled:bg-slate-700 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl cursor-pointer"><Send size={16} /></button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-slate-800 rounded-2xl bg-[#111] animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4"><Settings size={32} className="text-slate-500" /></div>
              <h2 className="text-2xl font-bold text-slate-300 mb-2 capitalize">{activeTab} Module</h2>
              <p className="text-slate-500 max-w-md text-center">This dashboard section is reserved for future updates. Please return to the main Agentic Escrow flow for the hackathon demo.</p>
              <button onClick={() => setActiveTab('home')} className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer">Return to Command Center</button>
            </div>
          )}
        </main>
      </div>
    </PayPalScriptProvider>
  );
}
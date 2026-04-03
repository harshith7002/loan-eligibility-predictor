import { useState, useEffect, useRef } from "react";

const API_URL = "http://localhost:8000";

const defaultForm = {
  Gender: "Male", Married: "Yes", Dependents: "0",
  Education: "Graduate", Self_Employed: "No",
  ApplicantIncome: "", CoapplicantIncome: "",
  LoanAmount: "", Loan_Amount_Term: "360",
  Credit_History: "1", Property_Area: "Urban",
};

function CountUp({ target, duration = 1400 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = duration / 16;
    const inc = target / steps;
    const timer = setInterval(() => {
      start += inc;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(parseFloat(start.toFixed(1)));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{val.toFixed(1)}</>;
}

const HERO_IMG = "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1400&q=80&auto=format&fit=crop";
const CITY_IMG = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&auto=format&fit=crop";

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0); // 0=hero, 1=personal, 2=financial, 3=result
  const [visible, setVisible] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.ApplicantIncome || !form.LoanAmount || !form.Loan_Amount_Term) {
      setError("Please fill in all financial fields."); return;
    }
    setLoading(true); setError("");
    try {
      const payload = {
        ...form,
        ApplicantIncome: parseFloat(form.ApplicantIncome),
        CoapplicantIncome: parseFloat(form.CoapplicantIncome) || 0,
        LoanAmount: parseFloat(form.LoanAmount),
        Loan_Amount_Term: parseFloat(form.Loan_Amount_Term),
        Credit_History: parseFloat(form.Credit_History),
      };
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setStep(3);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err.message.includes("fetch") ? "Cannot connect to backend. Make sure FastAPI is running on port 8000." : err.message);
    } finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setStep(1); setForm(defaultForm); setError(""); };

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: "#f8f6f1", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8f6f1; }

        .fade-up { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .fade-up.d1 { transition-delay: 0.1s; }
        .fade-up.d2 { transition-delay: 0.25s; }
        .fade-up.d3 { transition-delay: 0.4s; }
        .fade-up.d4 { transition-delay: 0.55s; }

        .glass-card {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 24px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset;
        }

        .field-wrap { position: relative; margin-bottom: 0; }
        .field-wrap label {
          display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: #8a7e6e; margin-bottom: 8px;
          font-family: 'Inter', sans-serif;
        }
        .field-wrap select, .field-wrap input {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.8);
          border: 1.5px solid rgba(200,185,165,0.5);
          border-radius: 12px; font-size: 15px;
          color: #2c2416; font-family: 'Inter', sans-serif;
          transition: all 0.25s; outline: none;
          -webkit-appearance: none; appearance: none;
        }
        .field-wrap select:focus, .field-wrap input:focus {
          border-color: #c9a96e;
          box-shadow: 0 0 0 4px rgba(201,169,110,0.15);
          background: #fff;
        }
        .field-wrap select:hover, .field-wrap input:hover { border-color: #c9a96e; }

        .select-arrow::after {
          content: ''; position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 5px solid transparent; border-right: 5px solid transparent;
          border-top: 6px solid #8a7e6e; pointer-events: none;
        }

        .cta-btn {
          background: linear-gradient(135deg, #c9a96e 0%, #a07840 50%, #c9a96e 100%);
          background-size: 200% auto;
          color: #fff; border: none; border-radius: 14px;
          padding: 18px 40px; font-size: 16px; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer; width: 100%;
          letter-spacing: 0.04em; position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 4px 24px rgba(160,120,64,0.35);
        }
        .cta-btn:hover {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(160,120,64,0.45);
        }
        .cta-btn:active { transform: scale(0.98); }
        .cta-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent 60%);
        }
        .cta-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .outline-btn {
          background: transparent; color: #8a7e6e;
          border: 1.5px solid rgba(200,185,165,0.6); border-radius: 12px;
          padding: 16px 28px; font-size: 14px; font-weight: 500;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: all 0.2s; letter-spacing: 0.02em;
        }
        .outline-btn:hover { background: rgba(201,169,110,0.08); border-color: #c9a96e; color: #a07840; }

        .step-dot { width: 8px; height: 8px; border-radius: 50%; transition: all 0.4s; cursor: pointer; }
        .step-dot.active { width: 28px; border-radius: 4px; background: #c9a96e; }
        .step-dot.done { background: #c9a96e; opacity: 0.5; }
        .step-dot.idle { background: #d6c9b5; }

        .result-slide { animation: slideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes slideUp { from { opacity:0; transform: translateY(60px) scale(0.96); } to { opacity:1; transform: none; } }

        .approved-ring { animation: ringPulse 2.5s ease-in-out infinite; }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.3);} 50%{box-shadow:0 0 0 16px rgba(34,197,94,0);} }

        .rejected-ring { animation: ringPulse2 2.5s ease-in-out infinite; }
        @keyframes ringPulse2 { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3);} 50%{box-shadow:0 0 0 16px rgba(239,68,68,0);} }

        .bar-grow { animation: barGrow 1.4s cubic-bezier(0.34,1.2,0.64,1) forwards; }
        @keyframes barGrow { from{width:0;} }

        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg);} }

        .hero-parallax { transition: transform 0.1s linear; }

        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }

        .trust-badge { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: rgba(255,255,255,0.8); border-radius: 50px; border: 1px solid rgba(200,185,165,0.4); font-size: 12px; color: #8a7e6e; font-weight: 500; font-family:'Inter',sans-serif; }

        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 16px 40px; display: flex; align-items: center; justify-content: space-between; backdrop-filter: blur(20px); background: rgba(248,246,241,0.85); border-bottom: 1px solid rgba(200,185,165,0.2); }

        .section-tag { display: inline-block; padding: 6px 16px; background: rgba(201,169,110,0.12); border: 1px solid rgba(201,169,110,0.3); border-radius: 50px; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #a07840; font-family:'Inter',sans-serif; margin-bottom: 16px; }

        .img-overlay { position: absolute; inset:0; background: linear-gradient(to right, rgba(248,246,241,1) 35%, rgba(248,246,241,0.6) 65%, rgba(248,246,241,0) 100%); }

        @media(max-width:768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-img-side { display: none !important; }
          .form-grid { grid-template-columns: 1fr !important; }
          .nav { padding: 14px 20px; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#c9a96e,#a07840)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏦</div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, color:'#2c2416', lineHeight:1 }}>LoanIQ</div>
            <div style={{ fontSize:10, color:'#a09080', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif" }}>AI Eligibility</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div className="trust-badge">🔒 Bank-grade Security</div>
          <div className="trust-badge">⚡ Instant Decision</div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ paddingTop:80, minHeight:'100vh', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', minHeight:'calc(100vh - 80px)' }} className="hero-grid">
          
          {/* LEFT: Content */}
          <div style={{ paddingTop:40, paddingBottom:40 }}>
            <div className={`fade-up ${visible ? 'visible' : ''}`}>
              <div className="section-tag">Powered by XGBoost AI</div>
            </div>
            <h1 className={`fade-up d1 ${visible?'visible':''}`} style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(42px,5vw,72px)', fontWeight:700, color:'#1a1408', lineHeight:1.05, letterSpacing:'-0.02em', marginBottom:24 }}>
              Know Your Loan<br />
              <span style={{ background:'linear-gradient(135deg,#c9a96e,#a07840)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Eligibility</span><br />
              Instantly
            </h1>
            <p className={`fade-up d2 ${visible?'visible':''}`} style={{ fontSize:17, color:'#6b5e4e', lineHeight:1.75, marginBottom:40, fontFamily:"'Inter',sans-serif", fontWeight:300, maxWidth:440 }}>
              Our AI model trained on thousands of real loan applications gives you a decision in seconds — with confidence scoring and key factor analysis.
            </p>

            {/* Stats */}
            <div className={`fade-up d3 ${visible?'visible':''}`} style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:40 }} >
              {[
                { v:'84%', l:'Test Accuracy', icon:'🎯' },
                { v:'79%', l:'CV Accuracy', icon:'📊' },
                { v:'<1s', l:'Decision Time', icon:'⚡' },
              ].map(s => (
                <div key={s.l} className="glass-card stat-card" style={{ padding:'20px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:700, color:'#2c2416', lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:11, color:'#a09080', marginTop:4, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif" }}>{s.l}</div>
                </div>
              ))}
            </div>

            <div className={`fade-up d4 ${visible?'visible':''}`}>
              <button className="cta-btn" style={{ width:'auto', padding:'18px 48px', fontSize:16 }} onClick={() => setStep(1)}>
                Check My Eligibility →
              </button>
              <p style={{ fontSize:12, color:'#a09080', marginTop:12, fontFamily:"'Inter',sans-serif" }}>No credit score impact · 100% free · Instant result</p>
            </div>
          </div>

          {/* RIGHT: Hero image */}
          <div className="hero-img-side" style={{ position:'relative', height:600, borderRadius:32, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.18)' }}>
            <img src={HERO_IMG} alt="Luxury home" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
            {/* Floating card on image */}
            <div style={{ position:'absolute', bottom:28, left:24, right:24 }}>
              <div className="glass-card" style={{ padding:'16px 20px', borderRadius:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:11, color:'#8a7e6e', fontFamily:"'Inter',sans-serif", fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Sample Decision</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:'#166534', marginTop:2 }}>✓ Approved</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:11, color:'#8a7e6e', fontFamily:"'Inter',sans-serif" }}>Confidence</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:700, color:'#2c2416' }}>87.4%</div>
                  </div>
                </div>
                <div style={{ marginTop:10, background:'rgba(200,185,165,0.2)', borderRadius:999, height:6, overflow:'hidden' }}>
                  <div style={{ width:'87.4%', height:'100%', background:'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius:999 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div style={{ fontSize:11, color:'#b0a090', letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:"'Inter',sans-serif" }}>Scroll to Apply</div>
          <div style={{ width:1, height:40, background:'linear-gradient(to bottom,#c9a96e,transparent)' }} />
        </div>
      </section>

      {/* FORM SECTION */}
      {step >= 1 && (
        <section id="form" style={{ padding:'80px 24px', background:'linear-gradient(180deg,#f8f6f1 0%,#f0ebe0 100%)' }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            
            {/* Section header */}
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div className="section-tag">Step {step} of 2</div>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:48, fontWeight:700, color:'#1a1408', letterSpacing:'-0.02em', marginBottom:12 }}>
                {step === 1 ? 'About You' : 'Your Finances'}
              </h2>
              <p style={{ fontSize:16, color:'#8a7e6e', fontFamily:"'Inter',sans-serif", fontWeight:300 }}>
                {step === 1 ? 'Tell us a bit about yourself so our AI can assess accurately.' : 'Provide your income and loan requirements.'}
              </p>
              {/* Step dots */}
              <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:24 }}>
                {[1,2].map(n => (
                  <div key={n} className={`step-dot ${step===n?'active':step>n?'done':'idle'}`} onClick={()=>step>n&&setStep(n)} />
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding:'40px' }}>
              
              {step === 1 && (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }} className="form-grid">
                    {[
                      { name:'Gender', label:'Gender', options:['Male','Female'] },
                      { name:'Married', label:'Marital Status', options:['Yes','No'] },
                      { name:'Dependents', label:'Number of Dependents', options:['0','1','2','3+'] },
                      { name:'Education', label:'Education Level', options:['Graduate','Not Graduate'] },
                      { name:'Self_Employed', label:'Self Employed?', options:['Yes','No'] },
                      { name:'Property_Area', label:'Property Area', options:['Urban','Semiurban','Rural'] },
                    ].map(f => (
                      <div key={f.name} className="field-wrap select-arrow" style={{ position:'relative' }}>
                        <label>{f.label}</label>
                        <select name={f.name} value={form[f.name]} onChange={handleChange}>
                          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Feature highlight */}
                  <div style={{ marginTop:32, padding:'20px', background:'linear-gradient(135deg,rgba(201,169,110,0.1),rgba(160,120,64,0.05))', borderRadius:16, border:'1px solid rgba(201,169,110,0.2)', display:'flex', gap:16, alignItems:'center' }}>
                    <span style={{ fontSize:32 }}>🔐</span>
                    <div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:600, color:'#2c2416', marginBottom:4 }}>Your data stays private</div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:'#8a7e6e', lineHeight:1.5 }}>All processing happens locally. No data is stored or shared with any third party.</div>
                    </div>
                  </div>

                  <button className="cta-btn" style={{ marginTop:28 }} onClick={() => setStep(2)}>
                    Continue to Financial Details →
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }} className="form-grid">
                    {[
                      { name:'ApplicantIncome', label:'Your Monthly Income (₹)', placeholder:'e.g. 5000', unit:'₹/mo' },
                      { name:'CoapplicantIncome', label:'Co-applicant Income (₹)', placeholder:'e.g. 0', unit:'₹/mo' },
                      { name:'LoanAmount', label:'Loan Amount Required', placeholder:'e.g. 150', unit:'₹ thousands' },
                      { name:'Loan_Amount_Term', label:'Repayment Term', placeholder:'e.g. 360', unit:'months' },
                    ].map(f => (
                      <div key={f.name} className="field-wrap" style={{ position:'relative' }}>
                        <label>{f.label}</label>
                        <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} min="0" />
                        <span style={{ position:'absolute', right:14, bottom:15, fontSize:11, color:'#a09080', fontFamily:"'Inter',sans-serif", pointerEvents:'none', background:'rgba(255,255,255,0.8)', padding:'2px 6px', borderRadius:4 }}>{f.unit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Credit history special field */}
                  <div style={{ marginTop:20 }}>
                    <div className="field-wrap select-arrow" style={{ position:'relative' }}>
                      <label>Credit History</label>
                      <select name="Credit_History" value={form.Credit_History} onChange={handleChange}>
                        <option value="1">✓ Good — Meets guidelines</option>
                        <option value="0">✗ Poor — Does not meet guidelines</option>
                      </select>
                    </div>
                    <p style={{ marginTop:8, fontSize:12, color:'#a09080', fontFamily:"'Inter',sans-serif" }}>
                      💡 Credit history is the strongest predictor in our model (27% importance)
                    </p>
                  </div>

                  {error && (
                    <div style={{ marginTop:20, padding:'14px 18px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, color:'#991b1b', fontSize:13, fontFamily:"'Inter',sans-serif", display:'flex', gap:10, alignItems:'center' }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <div style={{ display:'flex', gap:12, marginTop:28 }}>
                    <button className="outline-btn" onClick={() => setStep(1)}>← Back</button>
                    <button className="cta-btn" onClick={handleSubmit} disabled={loading} style={{ flex:1 }}>
                      {loading
                        ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                            <span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block' }} className="spin" />
                            Analyzing your application...
                          </span>
                        : '✦ Get My Decision Now'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* RESULT SECTION */}
      {step === 3 && result && (
        <section ref={resultRef} style={{ padding:'0 24px 80px', background:'linear-gradient(180deg,#f0ebe0 0%,#f8f6f1 100%)' }}>
          <div style={{ maxWidth:720, margin:'0 auto' }} className="result-slide">
            
            {result.approved ? (
              <div style={{ borderRadius:28, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.12)' }}>
                {/* Green hero banner */}
                <div style={{ position:'relative', height:220, overflow:'hidden' }}>
                  <img src={CITY_IMG} alt="approved" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'saturate(1.2)' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(5,150,105,0.85),rgba(16,185,129,0.6))' }} />
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff' }}>
                    <div className="approved-ring" style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, marginBottom:12 }}>✓</div>
                    <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:42, fontWeight:700, letterSpacing:'-0.02em' }}>Congratulations!</h2>
                    <p style={{ fontSize:14, opacity:0.9, fontFamily:"'Inter',sans-serif", marginTop:4 }}>Your application is likely to be approved</p>
                  </div>
                </div>

                {/* Details */}
                <div className="glass-card" style={{ borderRadius:0, borderTop:'none', padding:'32px 40px' }}>
                  {/* Confidence */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:12 }}>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:600, color:'#6b5e4e', textTransform:'uppercase', letterSpacing:'0.08em' }}>AI Confidence Score</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:48, fontWeight:700, color:'#059669', lineHeight:1 }}>
                      <CountUp target={result.confidence} />%
                    </div>
                  </div>
                  <div style={{ background:'rgba(200,185,165,0.2)', borderRadius:999, height:10, overflow:'hidden', marginBottom:32 }}>
                    <div className="bar-grow" style={{ height:'100%', width:`${result.confidence}%`, background:'linear-gradient(90deg,#059669,#34d399)', borderRadius:999 }} />
                  </div>

                  {/* Factors */}
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#8a7e6e', marginBottom:16 }}>Key Approval Factors</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:32 }}>
                    {[
                      { l:'Credit History', v: form.Credit_History==="1"?"Good ✓":"Poor ✗", ok: form.Credit_History==="1", imp:'27% impact' },
                      { l:'Education', v: form.Education, ok: form.Education==="Graduate", imp:'4.5% impact' },
                      { l:'Property Area', v: form.Property_Area, ok: form.Property_Area==="Semiurban", imp:'5.6% impact' },
                    ].map(f => (
                      <div key={f.l} style={{ padding:'14px', background: f.ok?'rgba(5,150,105,0.06)':'rgba(239,68,68,0.04)', border:`1px solid ${f.ok?'rgba(5,150,105,0.2)':'rgba(239,68,68,0.15)'}`, borderRadius:12 }}>
                        <div style={{ fontSize:10, color:'#a09080', fontFamily:"'Inter',sans-serif", marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{f.l}</div>
                        <div style={{ fontSize:13, fontWeight:600, fontFamily:"'Inter',sans-serif", color: f.ok?'#059669':'#dc2626' }}>{f.v}</div>
                        <div style={{ fontSize:10, color:'#b0a090', marginTop:2 }}>{f.imp}</div>
                      </div>
                    ))}
                  </div>

                  <button className="cta-btn" onClick={reset}>Check Another Application →</button>
                </div>
              </div>

            ) : (
              <div style={{ borderRadius:28, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.12)' }}>
                {/* Red banner */}
                <div style={{ position:'relative', height:200, background:'linear-gradient(135deg,#991b1b,#dc2626)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff' }}>
                  <div className="rejected-ring" style={{ width:76, height:76, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:12 }}>✗</div>
                  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:700 }}>Not Approved</h2>
                  <p style={{ fontSize:13, opacity:0.85, fontFamily:"'Inter',sans-serif", marginTop:4 }}>Based on current profile</p>
                </div>

                <div className="glass-card" style={{ borderRadius:0, borderTop:'none', padding:'32px 40px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:12 }}>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:600, color:'#6b5e4e', textTransform:'uppercase', letterSpacing:'0.08em' }}>Rejection Confidence</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:48, fontWeight:700, color:'#dc2626', lineHeight:1 }}>
                      <CountUp target={result.confidence} />%
                    </div>
                  </div>
                  <div style={{ background:'rgba(200,185,165,0.2)', borderRadius:999, height:10, overflow:'hidden', marginBottom:28 }}>
                    <div className="bar-grow" style={{ height:'100%', width:`${result.confidence}%`, background:'linear-gradient(90deg,#dc2626,#f87171)', borderRadius:999 }} />
                  </div>

                  {/* Improvement tips */}
                  <div style={{ padding:'20px', background:'rgba(254,249,195,0.5)', border:'1px solid rgba(234,179,8,0.2)', borderRadius:14, marginBottom:24 }}>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:700, color:'#92400e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>💡 How to improve your chances</div>
                    {[
                      form.Credit_History!=="1" && "Improve your credit history — it has 27% impact on approval",
                      parseFloat(form.LoanAmount) > parseFloat(form.ApplicantIncome) * 0.5 && "Consider reducing the loan amount relative to income",
                      form.Education==="Not Graduate" && "Co-applicants with graduate education improve chances",
                    ].filter(Boolean).map((tip,i) => (
                      <div key={i} style={{ fontSize:13, color:'#78350f', fontFamily:"'Inter',sans-serif", marginBottom:6, display:'flex', gap:8 }}>
                        <span>→</span><span>{tip}</span>
                      </div>
                    ))}
                    {![form.Credit_History!=="1", parseFloat(form.LoanAmount)>parseFloat(form.ApplicantIncome)*0.5, form.Education==="Not Graduate"].some(Boolean) && (
                      <div style={{ fontSize:13, color:'#78350f', fontFamily:"'Inter',sans-serif" }}>→ Try reducing loan amount or increasing income documentation</div>
                    )}
                  </div>

                  <button className="cta-btn" onClick={reset}>Try a Different Profile →</button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ background:'#1a1408', color:'rgba(255,255,255,0.4)', padding:'32px 24px', textAlign:'center' }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:600, color:'rgba(255,255,255,0.8)', marginBottom:8 }}>LoanIQ</div>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, lineHeight:1.8, maxWidth:500, margin:'0 auto' }}>
          Built with XGBoost · FastAPI · React · Feature Engineering<br/>
          <span style={{ opacity:0.5 }}>For educational purposes only. Not financial advice. Model trained on 614 loan applications.</span>
        </p>
      </footer>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react'

function useEventSource(url) {
	const [events, setEvents] = useState([])
	useEffect(() => {
		const es = new EventSource(url, { withCredentials: true })
		es.onmessage = (ev) => {
			try {
				const data = JSON.parse(ev.data)
				setEvents((prev) => [...prev, data].slice(-500))
			} catch {}
		}
		es.addEventListener('log', (ev) => {
			try {
				const data = JSON.parse(ev.data)
				setEvents((prev) => [...prev, data].slice(-500))
			} catch {}
		})
		es.onerror = () => {}
		return () => es.close()
	}, [url])
	return events
}

function Json({ data }) {
	return (
		<pre style={{whiteSpace:'pre-wrap', wordBreak:'break-word', background:'#0b1020', color:'#cde3ff', padding:12, borderRadius:8, fontSize:12}}>
			{JSON.stringify(data, null, 2)}
		</pre>
	)
}

function Section({ title, children, actions }) {
	return (
		<section style={{marginBottom:24, border:'1px solid #e3e8ef', borderRadius:10, overflow:'hidden'}}>
			<header style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'#f7f9fc', borderBottom:'1px solid #e3e8ef'}}>
				<h3 style={{margin:0, fontSize:16}}>{title}</h3>
				<div>{actions}</div>
			</header>
			<div style={{padding:16}}>
				{children}
			</div>
		</section>
	)
}

async function api(path, opts = {}) {
	const res = await fetch(`/api${path}`, {
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		...opts,
	})
	if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
	return res.json()
}

export default function App() {
	const [creds, setCreds] = useState({ username:'', password:'', signature:'', env:'sandbox' })
	const [result, setResult] = useState({})
	const [searchParams, setSearchParams] = useState({ STARTDATE: '', ENDDATE: '', TRANSACTIONCLASS: '' })
	const [detailsId, setDetailsId] = useState('')
	const [refund, setRefund] = useState({ TRANSACTIONID:'', REFUNDTYPE:'Full', AMT:'', CURRENCYCODE:'USD' })
	const logs = useEventSource('/api/logs/stream')

	const onSaveCreds = async (e) => {
		e.preventDefault()
		await api('/session/credentials', { method:'POST', body: JSON.stringify(creds) })
		alert('Credentials saved in session')
	}
	const onClearCreds = async () => {
		await api('/session/credentials', { method:'DELETE' })
		alert('Credentials cleared')
	}

	const onGetBalance = async () => {
		const r = await api('/nvp/get-balance', { method:'POST', body: JSON.stringify({}) })
		setResult({ method:'GetBalance', r })
	}
	const onSearch = async () => {
		const r = await api('/nvp/transaction-search', { method:'POST', body: JSON.stringify(searchParams) })
		setResult({ method:'TransactionSearch', r })
	}
	const onDetails = async () => {
		const r = await api('/nvp/get-transaction-details', { method:'POST', body: JSON.stringify({ TRANSACTIONID: detailsId }) })
		setResult({ method:'GetTransactionDetails', r })
	}
	const onRefund = async () => {
		const r = await api('/nvp/refund-transaction', { method:'POST', body: JSON.stringify(refund) })
		setResult({ method:'RefundTransaction', r })
	}

	return (
		<div style={{maxWidth:1100, margin:'0 auto', padding:24, fontFamily:'Inter, system-ui, Arial'}}>
			<h2 style={{marginTop:0}}>PayPal NVP Dashboard</h2>
			<p style={{color:'#475467'}}>Enter your NVP API credentials (stored only in session) and call common API methods. Logs stream in real-time below.</p>

			<Section title="Credentials">
				<form onSubmit={onSaveCreds} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
					<label>Username<input value={creds.username} onChange={e=>setCreds(v=>({...v, username:e.target.value}))} required style={{width:'100%'}} /></label>
					<label>Password<input type="password" value={creds.password} onChange={e=>setCreds(v=>({...v, password:e.target.value}))} required style={{width:'100%'}} /></label>
					<label>Signature<input value={creds.signature} onChange={e=>setCreds(v=>({...v, signature:e.target.value}))} required style={{width:'100%'}} /></label>
					<label>Environment<select value={creds.env} onChange={e=>setCreds(v=>({...v, env:e.target.value}))}><option value="sandbox">Sandbox</option><option value="live">Live</option></select></label>
					<div style={{gridColumn:'1 / span 2', display:'flex', gap:8}}>
						<button type="submit">Save to session</button>
						<button type="button" onClick={onClearCreds}>Clear</button>
					</div>
				</form>
			</Section>

			<Section title="NVP Methods">
				<div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
					<div>
						<h4>GetBalance</h4>
						<button onClick={onGetBalance}>Call GetBalance</button>
					</div>
					<div>
						<h4>TransactionSearch</h4>
						<label>STARTDATE<input placeholder="YYYY-MM-DDTHH:MM:SSZ" value={searchParams.STARTDATE} onChange={e=>setSearchParams(v=>({...v, STARTDATE:e.target.value}))} style={{width:'100%'}}/></label>
						<label>ENDDATE<input placeholder="YYYY-MM-DDTHH:MM:SSZ" value={searchParams.ENDDATE} onChange={e=>setSearchParams(v=>({...v, ENDDATE:e.target.value}))} style={{width:'100%'}}/></label>
						<label>TRANSACTIONCLASS<input value={searchParams.TRANSACTIONCLASS} onChange={e=>setSearchParams(v=>({...v, TRANSACTIONCLASS:e.target.value}))} style={{width:'100%'}}/></label>
						<button onClick={onSearch}>Search</button>
					</div>
					<div>
						<h4>GetTransactionDetails</h4>
						<label>TRANSACTIONID<input value={detailsId} onChange={e=>setDetailsId(e.target.value)} style={{width:'100%'}}/></label>
						<button onClick={onDetails}>Get Details</button>
					</div>
					<div>
						<h4>RefundTransaction</h4>
						<label>TRANSACTIONID<input value={refund.TRANSACTIONID} onChange={e=>setRefund(v=>({...v, TRANSACTIONID:e.target.value}))} style={{width:'100%'}}/></label>
						<label>REFUNDTYPE<select value={refund.REFUNDTYPE} onChange={e=>setRefund(v=>({...v, REFUNDTYPE:e.target.value}))}><option>Full</option><option>Partial</option></select></label>
						{refund.REFUNDTYPE === 'Partial' && <>
							<label>AMT<input value={refund.AMT} onChange={e=>setRefund(v=>({...v, AMT:e.target.value}))} style={{width:'100%'}}/></label>
							<label>CURRENCYCODE<input value={refund.CURRENCYCODE} onChange={e=>setRefund(v=>({...v, CURRENCYCODE:e.target.value}))} style={{width:'100%'}}/></label>
						</>}
						<button onClick={onRefund}>Refund</button>
					</div>
				</div>
			</Section>

			<Section title="Result">
				<Json data={result} />
			</Section>

			<Section title="Logs (live)">
				<div style={{maxHeight:300, overflow:'auto', background:'#f8fafc', padding:8, borderRadius:8, border:'1px solid #e3e8ef'}}>
					{logs.map((l, i) => (
						<div key={i} style={{marginBottom:8}}>
							<div style={{fontSize:12, color:'#667085'}}>{l.ts} — {l.source} — {l.type}</div>
							<Json data={l} />
						</div>
					))}
				</div>
			</Section>
		</div>
	)
}

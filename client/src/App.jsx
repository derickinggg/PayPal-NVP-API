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
	const base = typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : '/api'
	const startTime = Date.now()
	
	console.log(`🚀 API Call: ${opts.method || 'GET'} ${path}`, {
		timestamp: new Date().toISOString(),
		body: opts.body ? JSON.parse(opts.body) : undefined
	})
	
	try {
		const res = await fetch(`${base}${path}`, {
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			...opts,
		})
		
		const duration = Date.now() - startTime
		
		if (!res.ok) {
			const errorData = await res.json().catch(() => ({ error: 'Request failed' }))
			console.error(`❌ API Error: ${res.status} ${path}`, {
				timestamp: new Date().toISOString(),
				duration: `${duration}ms`,
				status: res.status,
				error: errorData
			})
			throw new Error(errorData.error || `HTTP ${res.status}: Request failed`)
		}
		
		const data = await res.json()
		console.log(`✅ API Success: ${path}`, {
			timestamp: new Date().toISOString(),
			duration: `${duration}ms`,
			status: res.status,
			response: data
		})
		
		return data
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`💥 API Exception: ${path}`, {
			timestamp: new Date().toISOString(),
			duration: `${duration}ms`,
			error: error.message
		})
		throw error
	}
}

export default function App() {
	const [creds, setCreds] = useState({ username:'', password:'', signature:'', env:'sandbox' })
	const [result, setResult] = useState({})
	const [searchParams, setSearchParams] = useState({ STARTDATE: '', ENDDATE: '', TRANSACTIONCLASS: '' })
	const [detailsId, setDetailsId] = useState('')
	const [refund, setRefund] = useState({ TRANSACTIONID:'', REFUNDTYPE:'Full', AMT:'', CURRENCYCODE:'USD' })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [savedApiKeys, setSavedApiKeys] = useState([])
	const [showSaveForm, setShowSaveForm] = useState(false)
	const [saveKeyForm, setSaveKeyForm] = useState({ name: '', username: '', password: '', signature: '', environment: 'sandbox' })
	const [useKeyPassword, setUseKeyPassword] = useState('')
	const [selectedKeyId, setSelectedKeyId] = useState('')
	const logs = useEventSource('/api/logs/stream')

	// Load saved API keys on component mount
	useEffect(() => {
		loadSavedApiKeys()
	}, [])

	const loadSavedApiKeys = async () => {
		try {
			const response = await api('/api-keys')
			setSavedApiKeys(response.apiKeys || [])
		} catch (err) {
			console.error('Failed to load saved API keys:', err)
		}
	}

	const handleApiCall = async (apiCall, successMessage) => {
		setLoading(true)
		setError('')
		try {
			await apiCall()
			if (successMessage) {
				alert(successMessage)
			}
		} catch (err) {
			setError(err.message)
			console.error('API call failed:', err)
		} finally {
			setLoading(false)
		}
	}

	const onSaveCreds = async (e) => {
		e.preventDefault()
		await handleApiCall(async () => {
			await api('/session/credentials', { method:'POST', body: JSON.stringify(creds) })
		}, 'Credentials saved in session')
	}
	
	const onClearCreds = async () => {
		await handleApiCall(async () => {
			await api('/session/credentials', { method:'DELETE' })
		}, 'Credentials cleared')
	}

	const onGetBalance = async () => {
		await handleApiCall(async () => {
			const r = await api('/nvp/get-balance', { method:'POST', body: JSON.stringify({}) })
			setResult({ method:'GetBalance', r })
		})
	}
	
	const onSearch = async () => {
		await handleApiCall(async () => {
			const r = await api('/nvp/transaction-search', { method:'POST', body: JSON.stringify(searchParams) })
			setResult({ method:'TransactionSearch', r })
		})
	}
	
	const onDetails = async () => {
		await handleApiCall(async () => {
			const r = await api('/nvp/get-transaction-details', { method:'POST', body: JSON.stringify({ TRANSACTIONID: detailsId }) })
			setResult({ method:'GetTransactionDetails', r })
		})
	}
	
	const onRefund = async () => {
		await handleApiCall(async () => {
			const r = await api('/nvp/refund-transaction', { method:'POST', body: JSON.stringify(refund) })
			setResult({ method:'RefundTransaction', r })
		})
	}

	const onSaveApiKey = async (e) => {
		e.preventDefault()
		await handleApiCall(async () => {
			await api('/api-keys', { method:'POST', body: JSON.stringify(saveKeyForm) })
			setSaveKeyForm({ name: '', username: '', password: '', signature: '', environment: 'sandbox' })
			setShowSaveForm(false)
			await loadSavedApiKeys()
		}, 'API key saved successfully')
	}

	const onUseApiKey = async (keyId) => {
		if (!useKeyPassword) {
			setError('Password is required to use saved API key')
			return
		}
		
		await handleApiCall(async () => {
			await api(`/api-keys/${keyId}/use`, { method:'POST', body: JSON.stringify({ password: useKeyPassword }) })
			setUseKeyPassword('')
			setSelectedKeyId('')
		}, 'API key loaded into session')
	}

	const onDeleteApiKey = async (keyId) => {
		if (!confirm('Are you sure you want to delete this API key?')) return
		
		await handleApiCall(async () => {
			await api(`/api-keys/${keyId}`, { method:'DELETE' })
			await loadSavedApiKeys()
		}, 'API key deleted successfully')
	}

	return (
		<div style={{maxWidth:1100, margin:'0 auto', padding:24, fontFamily:'Inter, system-ui, Arial'}}>
			<h2 style={{marginTop:0}}>PayPal NVP Dashboard</h2>
			<p style={{color:'#475467'}}>Enter your NVP API credentials (stored only in session) and call common API methods. Logs stream in real-time below.</p>
			
			{loading && (
				<div style={{padding:12, background:'#e3f2fd', border:'1px solid #2196f3', borderRadius:8, marginBottom:16, color:'#1976d2'}}>
					🔄 Processing API request...
				</div>
			)}
			
			{error && (
				<div style={{padding:12, background:'#ffebee', border:'1px solid #f44336', borderRadius:8, marginBottom:16, color:'#d32f2f'}}>
					❌ Error: {error}
					<button 
						onClick={() => setError('')} 
						style={{marginLeft:8, background:'none', border:'none', color:'#d32f2f', cursor:'pointer'}}
					>
						✕
					</button>
				</div>
			)}

			<Section title="Credentials">
				<form onSubmit={onSaveCreds} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
					<label>Username<input value={creds.username} onChange={e=>setCreds(v=>({...v, username:e.target.value}))} required style={{width:'100%'}} /></label>
					<label>Password<input type="password" value={creds.password} onChange={e=>setCreds(v=>({...v, password:e.target.value}))} required style={{width:'100%'}} /></label>
					<label>Signature<input value={creds.signature} onChange={e=>setCreds(v=>({...v, signature:e.target.value}))} required style={{width:'100%'}} /></label>
					<label>Environment<select value={creds.env} onChange={e=>setCreds(v=>({...v, env:e.target.value}))}><option value="sandbox">Sandbox</option><option value="live">Live</option></select></label>
					<div style={{gridColumn:'1 / span 2', display:'flex', gap:8}}>
						<button type="submit">Save to session</button>
						<button type="button" onClick={onClearCreds}>Clear</button>
						<button type="button" onClick={() => {
							if (!showSaveForm) {
								// Auto-populate form with current credentials
								setSaveKeyForm({
									name: '',
									username: creds.username,
									password: creds.password,
									signature: creds.signature,
									environment: creds.env
								})
							}
							setShowSaveForm(!showSaveForm)
						}} style={{background:'#059669', color:'white'}}>
							{showSaveForm ? 'Cancel Save' : 'Save Permanently'}
						</button>
					</div>
				</form>

				{showSaveForm && (
					<div style={{marginTop:16, padding:16, background:'#f0f9ff', border:'1px solid #0ea5e9', borderRadius:8}}>
						<h4 style={{margin:'0 0 12px 0'}}>Save API Key Permanently</h4>
						<form onSubmit={onSaveApiKey} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
							<label>Name<input value={saveKeyForm.name} onChange={e=>setSaveKeyForm(v=>({...v, name:e.target.value}))} placeholder="My API Key" required style={{width:'100%'}} /></label>
							<label>Environment<select value={saveKeyForm.environment} onChange={e=>setSaveKeyForm(v=>({...v, environment:e.target.value}))}><option value="sandbox">Sandbox</option><option value="live">Live</option></select></label>
							<label>Username<input value={saveKeyForm.username} onChange={e=>setSaveKeyForm(v=>({...v, username:e.target.value}))} required style={{width:'100%'}} /></label>
							<label>Password<input type="password" value={saveKeyForm.password} onChange={e=>setSaveKeyForm(v=>({...v, password:e.target.value}))} required style={{width:'100%'}} /></label>
							<label style={{gridColumn:'1 / span 2'}}>Signature<input value={saveKeyForm.signature} onChange={e=>setSaveKeyForm(v=>({...v, signature:e.target.value}))} required style={{width:'100%'}} /></label>
							<div style={{gridColumn:'1 / span 2', display:'flex', gap:8}}>
								<button type="submit" style={{background:'#059669', color:'white'}}>Save API Key</button>
								<button type="button" onClick={() => setShowSaveForm(false)}>Cancel</button>
							</div>
						</form>
					</div>
				)}
			</Section>

			<Section title="Saved API Keys" actions={
				<span style={{fontSize:12, color:'#667085'}}>
					{savedApiKeys.length} saved key{savedApiKeys.length !== 1 ? 's' : ''}
				</span>
			}>
				{savedApiKeys.length === 0 ? (
					<div style={{textAlign:'center', color:'#6b7280', fontSize:14, padding:20}}>
						No saved API keys. Use "Save Permanently" above to store credentials securely.
					</div>
				) : (
					<div style={{display:'grid', gap:12}}>
						{savedApiKeys.map((key) => (
							<div key={key.id} style={{
								padding:12, 
								border:'1px solid #e3e8ef', 
								borderRadius:8, 
								background:'#f8fafc',
								display:'grid',
								gridTemplateColumns:'1fr auto',
								alignItems:'center',
								gap:12
							}}>
								<div>
									<div style={{fontWeight:500, marginBottom:4}}>{key.name}</div>
									<div style={{fontSize:12, color:'#6b7280'}}>
										{key.username} • {key.environment} • Created {new Date(key.created_at).toLocaleDateString()}
									</div>
								</div>
								<div style={{display:'flex', gap:8, alignItems:'center'}}>
									{selectedKeyId === key.id ? (
										<div style={{display:'flex', gap:8, alignItems:'center'}}>
											<input 
												type="password" 
												placeholder="Enter password" 
												value={useKeyPassword}
												onChange={e=>setUseKeyPassword(e.target.value)}
												style={{width:120}}
											/>
											<button 
												onClick={() => onUseApiKey(key.id)}
												style={{background:'#2563eb', color:'white', fontSize:12}}
											>
												Use
											</button>
											<button 
												onClick={() => {setSelectedKeyId(''); setUseKeyPassword('')}}
												style={{fontSize:12}}
											>
												Cancel
											</button>
										</div>
									) : (
										<>
											<button 
												onClick={() => setSelectedKeyId(key.id)}
												style={{background:'#2563eb', color:'white', fontSize:12}}
											>
												Use Key
											</button>
											<button 
												onClick={() => onDeleteApiKey(key.id)}
												style={{background:'#dc2626', color:'white', fontSize:12}}
											>
												Delete
											</button>
										</>
									)}
								</div>
							</div>
						))}
					</div>
				)}
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

			<Section title="API Monitoring & Logs (Real-time)" actions={
				<div>
					<button onClick={() => console.clear()} style={{marginRight:8}}>Clear Console</button>
					<span style={{fontSize:12, color:'#667085'}}>
						{logs.length} events • Live streaming
					</span>
				</div>
			}>
				<div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16}}>
					<div>
						<h4 style={{margin:'0 0 8px 0', fontSize:14}}>Recent API Calls</h4>
						<div style={{background:'#f8fafc', padding:8, borderRadius:8, border:'1px solid #e3e8ef', maxHeight:200, overflow:'auto'}}>
							{logs.filter(l => l.source === 'nvp').slice(-5).map((l, i) => (
								<div key={i} style={{marginBottom:4, fontSize:12}}>
									<span style={{color: l.type === 'request' ? '#2563eb' : '#059669'}}>
										{l.type === 'request' ? '→' : '←'} {l.method}
									</span>
									<span style={{color:'#6b7280', marginLeft:8}}>
										{new Date(l.ts).toLocaleTimeString()}
									</span>
								</div>
							))}
						</div>
					</div>
					<div>
						<h4 style={{margin:'0 0 8px 0', fontSize:14}}>System Status</h4>
						<div style={{background:'#f8fafc', padding:8, borderRadius:8, border:'1px solid #e3e8ef'}}>
							<div style={{fontSize:12, marginBottom:4}}>
								<span style={{color:'#059669'}}>● </span>
								Event Stream: Connected
							</div>
							<div style={{fontSize:12, marginBottom:4}}>
								<span style={{color:'#059669'}}>● </span>
								API Base: {typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : '/api'}
							</div>
							<div style={{fontSize:12}}>
								<span style={{color:'#6b7280'}}>Last Update: </span>
								{logs.length > 0 ? new Date(logs[logs.length - 1].ts).toLocaleTimeString() : 'Never'}
							</div>
						</div>
					</div>
				</div>
				
				<div>
					<h4 style={{margin:'0 0 8px 0', fontSize:14}}>Full Event Log</h4>
					<div style={{maxHeight:300, overflow:'auto', background:'#f8fafc', padding:8, borderRadius:8, border:'1px solid #e3e8ef'}}>
						{logs.map((l, i) => (
							<div key={i} style={{marginBottom:8}}>
								<div style={{fontSize:12, color:'#667085'}}>
									{l.ts} — {l.source} — {l.type}
									{l.method && ` — ${l.method}`}
									{l.status && ` — ${l.status}`}
								</div>
								<Json data={l} />
							</div>
						))}
						{logs.length === 0 && (
							<div style={{textAlign:'center', color:'#6b7280', fontSize:12, padding:20}}>
								No events yet. Make an API call to see real-time monitoring.
							</div>
						)}
					</div>
				</div>
			</Section>
		</div>
	)
}

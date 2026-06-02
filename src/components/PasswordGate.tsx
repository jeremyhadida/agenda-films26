'use client'

import { useState, useEffect } from 'react'

const PWD = process.env.NEXT_PUBLIC_MASTER_PASSWORD ?? ''

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false)
  const [val, setVal] = useState('')
  const [err, setErr] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('f26_master') === '1') setOk(true)
    setReady(true)
  }, [])

  if (!ready) return null

  if (ok) return <>{children}</>

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4">
      <form
        onSubmit={e => {
          e.preventDefault()
          if (val === PWD) {
            sessionStorage.setItem('f26_master', '1')
            setOk(true)
          } else {
            setErr(true)
            setVal('')
          }
        }}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <h1 className="font-display text-3xl font-bold text-gold">FILMS 26</h1>
        <p className="font-body text-muted text-sm">Accès réservé</p>
        <input
          type="password"
          value={val}
          onChange={e => { setVal(e.target.value); setErr(false) }}
          placeholder="Mot de passe"
          autoFocus
          className="bg-surface-low border border-[#2a4a7a] text-text font-body px-4 py-2.5 rounded-lg focus:outline-none focus:border-gold/60"
        />
        {err && <p className="text-red-400 text-xs font-body">Mot de passe incorrect</p>}
        <button
          type="submit"
          className="bg-gold text-surface font-display font-bold py-2.5 rounded-lg hover:bg-gold-light transition-colors"
        >
          Entrer
        </button>
      </form>
    </main>
  )
}

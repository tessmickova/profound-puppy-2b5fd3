'use client'
// components/NotifyModal.tsx
import { useState }          from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle, Bell, CheckCircle } from 'lucide-react'
import { supabase }          from '@/lib/supabase'
import clsx                  from 'clsx'

const KP_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9]
const KP_LABELS: Record<number, string> = {
  2: '📷 KP2 – Fotografická záře',
  3: '📷 KP3 – Silnější foto záře',
  4: '🌅 KP4 – Záře na obzoru',
  5: '🌈 KP5 – Oblouk (G1)',
  6: '🎆 KP6 – Silnější bouře (G2)',
  7: '🎆 KP7 – Záře nad ČR! (G3)',
  8: '✨ KP8 – Extrémní záře (G4)',
  9: '✨ KP9 – Max. bouře (G5)',
}

interface Props { open: boolean; onClose: () => void }

export function NotifyModal({ open, onClose }: Props) {
  const [channel,    setChannel]    = useState<'telegram' | 'whatsapp'>('telegram')
  const [kpTreshold, setKpTreshold] = useState(4)
  const [phone,      setPhone]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const telegramBotName = 'AuroraDogAlertBot' // ← ZMĚŇ na svůj bot username

  const handleWhatsAppRegister = async () => {
    if (!phone.match(/^\+?[0-9]{9,15}$/)) {
      setError('Zadej platné telefonní číslo s předvolbou (+420...)')
      return
    }
    setLoading(true); setError(null)
    try {
      const { error: sbErr } = await supabase().from('subscribers').upsert(
        { channel: 'whatsapp' as const, contact: phone.replace(/\D/g, ''), kp_threshold: kpTreshold, active: true },
        { onConflict: 'channel,contact' }
      )
      if (sbErr) throw sbErr
      setSuccess(true)
    } catch (e: any) {
      setError(e.message ?? 'Chyba při registraci')
    } finally {
      setLoading(false)
    }
  }

  const handleTelegramGo = () => {
    localStorage.setItem('tg_kp_threshold', String(kpTreshold))
    window.open(`https://t.me/${telegramBotName}?start=kp${kpTreshold}`, '_blank')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="w-full max-w-md bg-[#04101e] border border-white/10 rounded-2xl shadow-2xl p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Bell size={20} className="text-aurora-teal" />
                <h2 className="font-display text-sm font-bold tracking-widest text-aurora-teal uppercase">Aurora Alerty</h2>
              </div>

              {success ? (
                <div className="text-center py-6">
                  <CheckCircle size={40} className="text-aurora-green mx-auto mb-3" />
                  <div className="font-semibold text-lg text-aurora-green">Registrace úspěšná!</div>
                  <p className="text-sm text-slate-400 mt-2">
                    Dostaneš zprávu když KP dosáhne <strong className="text-white">{kpTreshold}</strong> nebo výš.
                  </p>
                  <button onClick={onClose} className="mt-4 px-6 py-2 rounded-xl bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal text-sm font-semibold">
                    Zavřít
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-5">
                    {[
                      { id: 'telegram' as const, icon: <Send size={14} />, label: 'Telegram' },
                      { id: 'whatsapp' as const, icon: <MessageCircle size={14} />, label: 'WhatsApp' },
                    ].map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => setChannel(ch.id)}
                        className={clsx(
                          'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                          channel === ch.id
                            ? ch.id === 'telegram'
                              ? 'bg-blue-500/15 border-blue-400/40 text-blue-300'
                              : 'bg-green-500/15 border-green-400/40 text-green-300'
                            : 'border-white/8 text-slate-400 hover:border-white/15'
                        )}
                      >
                        {ch.icon} {ch.label}
                      </button>
                    ))}
                  </div>

                  <div className="mb-5">
                    <label className="text-xs font-mono text-slate-400 tracking-widest uppercase mb-2 block">
                      Alertovat mě při KP:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {KP_OPTIONS.map(k => (
                        <button
                          key={k}
                          onClick={() => setKpTreshold(k)}
                          className={clsx(
                            'py-2 rounded-xl text-sm font-display font-bold border transition-all',
                            kpTreshold === k
                              ? 'bg-aurora-teal/15 border-aurora-teal/50 text-aurora-teal shadow-[0_0_12px_rgba(0,212,255,0.15)]'
                              : 'border-white/8 text-slate-400 hover:border-white/20'
                          )}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{KP_LABELS[kpTreshold]}</p>
                  </div>

                  {channel === 'telegram' && (
                    <div>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        Klikni níže → otevře se Telegram bot → napiš <code className="text-aurora-teal bg-aurora-teal/10 px-1 rounded-sm">/start</code>
                        → jsi registrovaný! KP práh nastavíš přímo v botu.
                      </p>
                      <button
                        onClick={handleTelegramGo}
                        className="w-full py-3 rounded-xl bg-blue-500/15 border border-blue-400/40 text-blue-300 font-bold text-sm
                                   flex items-center justify-center gap-2 hover:bg-blue-500/25 transition-all"
                      >
                        <Send size={15} /> Otevřít @{telegramBotName}
                      </button>
                    </div>
                  )}

                  {channel === 'whatsapp' && (
                    <div>
                      <label className="text-xs font-mono text-slate-400 tracking-widest uppercase mb-2 block">
                        Tvoje číslo (s předvolbou)
                      </label>
                      <input
                        type="tel"
                        placeholder="+420 XXX XXX XXX"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600
                                   focus:outline-hidden focus:border-aurora-teal/50 focus:ring-1 focus:ring-aurora-teal/30 mb-3 font-mono"
                      />
                      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
                      <button
                        onClick={handleWhatsAppRegister}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-green-500/15 border border-green-400/40 text-green-300 font-bold text-sm
                                   flex items-center justify-center gap-2 hover:bg-green-500/25 transition-all disabled:opacity-50"
                      >
                        <MessageCircle size={15} />
                        {loading ? 'Registruji...' : 'Registrovat WhatsApp alerty'}
                      </button>
                      <p className="text-[10px] text-slate-600 mt-2">
                        ⚠ WhatsApp Cloud API – musíš přijmout zprávu od bota do 24h (Meta policy).
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

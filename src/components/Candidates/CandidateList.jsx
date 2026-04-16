import { useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { MEMBERS } from '../../firebase/config'
import { useCandidates, updateVote, deleteCandidate, confirmCandidate } from '../../hooks/useFirestore'
import { formatDateInfo } from '../../utils/holidays'
import CandidateForm from './CandidateForm'
import AppIcon from '../brand/AppIcon'
import { BRAND } from '../../utils/brand'

const VOTE_OPTIONS = ['○', '△', '×']

const VOTE_STYLE = {
  '○': { active: 'bg-green-500 text-white border-green-500', inactive: 'border-gray-200 text-gray-300 bg-white' },
  '△': { active: 'bg-yellow-400 text-white border-yellow-400', inactive: 'border-gray-200 text-gray-300 bg-white' },
  '×': { active: 'bg-red-400 text-white border-red-400', inactive: 'border-gray-200 text-gray-300 bg-white' },
}

function formatDate(dateStr) {
  if (!dateStr) return { label: '', isSun: false, isSat: false, isHoliday: false, isRed: false }
  return formatDateInfo(dateStr)
}

function VoteSummary({ votes }) {
  const ok = MEMBERS.filter(m => votes?.[m.id] === '○').length
  const maybe = MEMBERS.filter(m => votes?.[m.id] === '△').length
  const no = MEMBERS.filter(m => votes?.[m.id] === '×').length
  const allOk = ok === MEMBERS.length

  if (ok + maybe + no === 0) return <span className="text-xs text-gray-300">-</span>
  if (allOk) return <span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">全員○</span>
  return (
    <div className="flex gap-1">
      {ok > 0 && <span className="text-xs text-green-600 font-bold">○{ok}</span>}
      {maybe > 0 && <span className="text-xs text-yellow-600 font-bold">△{maybe}</span>}
      {no > 0 && <span className="text-xs text-red-500 font-bold">×{no}</span>}
    </div>
  )
}

export default function CandidateList() {
  const candidates = useCandidates()
  const [showForm, setShowForm] = useState(false)
  const [activeMember, setActiveMember] = useState(MEMBERS[0].id)
  const [loading, setLoading] = useState(null)

  async function handleVote(candidateId, vote) {
    const current = candidates.find(c => c.id === candidateId)?.votes?.[activeMember]
    const next = current === vote ? null : vote
    setLoading(candidateId + activeMember)
    await updateVote(candidateId, activeMember, next)
    setLoading(null)
  }

  async function handleDelete(id) {
    if (!window.confirm('この候補日を削除しますか？')) return
    await deleteCandidate(id)
  }

  async function handleConfirmAll() {
    const unconfirmed = candidates.filter(c => !c.confirmed)
    if (unconfirmed.length === 0) return
    if (!window.confirm(`未確定の${unconfirmed.length}件をすべて確定しますか？`)) return
    await Promise.all(unconfirmed.map(c => confirmCandidate(c.id)))
  }

  return (
    <div className="pb-24">
      <div className="px-3 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">候補日・投票</h2>
          <p className="text-xs text-gray-400">日程候補を追加して全員で投票できます</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 text-white text-sm font-bold px-3 py-2 rounded-xl shadow-md active:scale-95 transition-transform"
          style={{ background: BRAND.orange }}
        >
          <Plus size={16} />
          候補日追加
        </button>
      </div>

      {showForm && (
        <div className="px-3 mb-3">
          <CandidateForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {candidates.length > 0 && (
        <div className="px-3 mb-3">
          <p className="text-xs text-gray-500 mb-1.5 font-medium">表示中のメンバー</p>
          <div className="flex gap-2">
            {MEMBERS.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMember(m.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMember === m.id ? 'text-white shadow-md scale-105' : 'bg-white text-gray-400 shadow-sm'}`}
                style={activeMember === m.id ? { background: m.color } : {}}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {candidates.length === 0 && !showForm ? (
        <div className="text-center py-14 text-gray-400 px-3">
          <AppIcon className="w-16 h-16 rounded-3xl shadow-lg mx-auto mb-3 opacity-80" />
          <p className="text-sm">候補日はまだありません</p>
          <p className="text-xs mt-1">「候補日追加」から登録できます</p>
        </div>
      ) : candidates.length > 0 && (
        <div className="mx-3 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid items-center bg-gray-50 border-b border-gray-100 px-3 py-2" style={{ gridTemplateColumns: '1fr auto auto auto auto' }}>
            <span className="text-xs font-bold text-gray-500">日付</span>
            {VOTE_OPTIONS.map(v => (
              <span key={v} className="text-xs font-bold text-gray-400 w-9 text-center">{v}</span>
            ))}
            <span className="text-xs font-bold text-gray-400 w-16 text-center">集計</span>
          </div>

          {candidates.map(c => {
            const { label, isRed, isSat } = formatDate(c.date)
            const currentVote = c.votes?.[activeMember]
            const isLoading = loading === c.id + activeMember
            const allOk = MEMBERS.every(m => c.votes?.[m.id] === '○')

            return (
              <div key={c.id} className={`border-b border-gray-50 last:border-0 ${c.confirmed || allOk ? 'bg-green-50' : ''}`}>
                <div className="grid items-center px-3 py-3" style={{ gridTemplateColumns: '1fr auto auto auto auto' }}>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-sm font-bold ${isRed ? 'text-red-500' : isSat ? 'text-blue-500' : 'text-gray-800'}`}>
                        {label}
                      </span>
                      {allOk && (
                        <span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">
                          全員OK!
                        </span>
                      )}
                    </div>
                    {c.note && <p className="text-xs text-gray-400 mt-0.5">メモ: {c.note}</p>}

                    <div className="flex gap-2 mt-1">
                      {MEMBERS.map(m => {
                        const v = c.votes?.[m.id]
                        return (
                          <div key={m.id} className="flex items-center gap-0.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                            <span className={`text-xs font-bold ${v === '○' ? 'text-green-500' : v === '△' ? 'text-yellow-500' : v === '×' ? 'text-red-400' : 'text-gray-200'}`}>
                              {v || '-'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {VOTE_OPTIONS.map(v => (
                    <button
                      key={v}
                      onClick={() => handleVote(c.id, v)}
                      disabled={isLoading}
                      className={`w-9 h-9 mx-0.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-90 ${currentVote === v ? VOTE_STYLE[v].active : VOTE_STYLE[v].inactive}`}
                    >
                      {v}
                    </button>
                  ))}

                  <div className="w-16 flex justify-center">
                    {c.confirmed
                      ? <span className="text-xs font-bold text-green-600 flex items-center gap-0.5"><Check size={12} />確定</span>
                      : <VoteSummary votes={c.votes} />
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {candidates.some(c => !c.confirmed) && (
        <div className="px-3 mt-3">
          <button
            onClick={handleConfirmAll}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm shadow-md active:scale-95 transition-transform"
            style={{ background: BRAND.orange }}
          >
            <Check size={16} />
            候補日をまとめて確定
          </button>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="px-3 mt-3 flex flex-wrap gap-2">
          {candidates.map(c => {
            const { label } = formatDate(c.date)
            return (
              <button
                key={c.id}
                onClick={() => handleDelete(c.id)}
                className="flex items-center gap-1 text-xs text-gray-400 bg-white px-2.5 py-1.5 rounded-full shadow-sm active:bg-red-50 active:text-red-400 transition-colors"
              >
                <Trash2 size={11} />
                {label}を削除
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { MEMBERS } from '../../firebase/config'
import { BRAND } from '../../utils/brand'

export default function DayCell({
  day, avail, isEvent, isCandidate, candidateAllOk, candidateVotes,
  isToday, isSun, isSat, isHoliday, holidayName, isSelected, onClick
}) {
  const isRed = isSun || isHoliday

  return (
    <button
      onClick={onClick}
      className={`aspect-square flex flex-col items-center justify-center p-0.5 border-b border-r border-gray-50 transition-all active:scale-95 relative
        ${candidateAllOk ? 'bg-green-50' : isCandidate ? 'bg-yellow-50/60' : isHoliday ? 'bg-red-50/40' : 'hover:bg-gray-50'}`}
      style={isSelected ? { background: BRAND.orangeTint, boxShadow: `inset 0 0 0 2px ${BRAND.orange}` } : undefined}
    >
      <div className={`text-xs font-semibold leading-none ${isRed ? 'text-red-500' : isSat ? 'text-blue-400' : 'text-gray-700'}`}>
        {isToday ? (
          <span
            className="text-white rounded-full w-5 h-5 flex items-center justify-center"
            style={{ background: BRAND.orange }}
          >
            {day}
          </span>
        ) : (
          day
        )}
      </div>

      {isHoliday && holidayName && (
        <div
          className="text-red-400 leading-none mt-0.5"
          style={{ fontSize: '6px', maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
        >
          {holidayName}
        </div>
      )}

      {isEvent && <div className="text-xs leading-none mt-0.5">▲</div>}

      {!isEvent && isCandidate && (
        <div className={`text-xs leading-none mt-0.5 ${candidateAllOk ? 'text-green-500' : 'text-yellow-500'}`}>
          {candidateAllOk ? '◎' : '…'}
        </div>
      )}

      {!isEvent && (
        <div className="flex gap-0.5 mt-0.5">
          {MEMBERS.map(m => {
            const status = isCandidate ? (candidateVotes?.[m.id] ?? '') : (avail[m.id] ?? '')
            const color = status === '○' ? m.color : 'transparent'
            return <div key={m.id} className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          })}
        </div>
      )}
    </button>
  )
}

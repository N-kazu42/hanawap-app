import { MEMBERS } from '../../firebase/config'

export default function DayCell({
  day, avail, isEvent, isCandidate, candidateAllOk,
  isToday, isSun, isSat, isHoliday, holidayName, isSelected, onClick
}) {
  const isRed = isSun || isHoliday

  return (
    <button
      onClick={onClick}
      className={`aspect-square flex flex-col items-center justify-center p-0.5 border-b border-r border-gray-50
                  transition-all active:scale-95 relative
                  ${isSelected        ? 'bg-orange-50 ring-2 ring-orange-400 ring-inset'
                  : candidateAllOk   ? 'bg-green-50'
                  : isCandidate      ? 'bg-yellow-50/60'
                  : isHoliday        ? 'bg-red-50/40'
                  : 'hover:bg-gray-50'}`}
    >
      {/* 日付数字 */}
      <div className={`text-xs font-semibold leading-none
        ${isToday
          ? 'bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center'
          : isRed  ? 'text-red-500'
          : isSat  ? 'text-blue-400'
          : 'text-gray-700'}`}>
        {day}
      </div>

      {/* 祝日名（極小） */}
      {isHoliday && holidayName && (
        <div className="text-red-400 leading-none mt-0.5"
          style={{ fontSize: '6px', maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {holidayName}
        </div>
      )}

      {/* 確定イベント */}
      {isEvent && <div className="text-xs leading-none mt-0.5">🏔️</div>}

      {/* 候補日マーカー（確定イベントがない日のみ） */}
      {!isEvent && isCandidate && (
        <div className={`text-xs leading-none mt-0.5 ${candidateAllOk ? 'text-green-500' : 'text-yellow-500'}`}>
          {candidateAllOk ? '◎' : '？'}
        </div>
      )}

      {/* メンバー空き状況ドット（候補・確定イベントがない日） */}
      {!isEvent && !isCandidate && (
        <div className="flex gap-0.5 mt-0.5">
          {MEMBERS.map(m => {
            const status = avail[m.id]
            const color  = status === '○' ? m.color
                         : status === '△' ? '#FCD34D'
                         : status === '×' ? '#E5E7EB'
                         : '#F3F4F6'
            return <div key={m.id} className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          })}
        </div>
      )}
    </button>
  )
}

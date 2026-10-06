import { useState } from 'react'
import { Target, CheckCircle2, Plus, Clock } from 'lucide-react'
import type { LearningGoal } from '@/types/engagement'
import { Button } from '@/components/ui/button'

interface LearningGoalCardProps {
  goal: LearningGoal
  onIncrement?: (goalId: string) => Promise<void>
}

export function LearningGoalCard({ goal, onIncrement }: LearningGoalCardProps) {
  const [updating, setUpdating] = useState(false)
  const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
  const isCompleted = goal.status === 'completed' || percent >= 100

  const handlePlus = async () => {
    if (!onIncrement || isCompleted || updating) return
    setUpdating(true)
    try {
      await onIncrement(goal.id)
    } finally {
      setUpdating(false)
    }
  }

  const getUnitLabel = (type: string) => {
    switch (type) {
      case 'sessions':
        return 'Sesi'
      case 'courses':
        return 'Kursus'
      case 'lessons':
        return 'Pelajaran'
      case 'minutes':
        return 'Menit'
      default:
        return 'Target'
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-border/80 p-5 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-[#EFEDFD] text-[#6C5CE7]'
          }`}>
            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#17181C] line-clamp-1">{goal.title}</h4>
            {goal.description && (
              <p className="text-xs text-[#676A78] line-clamp-1 mt-0.5">{goal.description}</p>
            )}
          </div>
        </div>

        {!isCompleted && onIncrement && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlus}
            disabled={updating}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </Button>
        )}
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#17181C]">
            {goal.currentValue} / {goal.targetValue} {getUnitLabel(goal.targetType)}
          </span>
          <span className={`font-bold ${isCompleted ? 'text-emerald-600' : 'text-[#6C5CE7]'}`}>
            {percent}%
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-[#EEF0F8] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-emerald-500' : 'bg-[#6C5CE7]'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {goal.targetDate && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/60 text-[11px] text-[#8A8D9A]">
          <Clock className="w-3.5 h-3.5" />
          <span>Batas Waktu: {goal.targetDate}</span>
        </div>
      )}
    </div>
  )
}

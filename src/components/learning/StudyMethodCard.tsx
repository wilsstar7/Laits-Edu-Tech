import { CheckCircle2 } from 'lucide-react'

interface StudyMethodCardProps {
  method: string
  index: number
}

export function StudyMethodCard({ method, index }: StudyMethodCardProps) {
  return (
    <div className="surface-card p-5 bg-white border border-border flex items-start gap-3.5 rounded-2xl hover:border-[#6C5CE7]/30 transition-colors">
      <div className="w-8 h-8 rounded-xl bg-[#EFEDFD] text-[#6C5CE7] flex items-center justify-center shrink-0 font-bold text-xs">
        0{index + 1}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-[#17181C] leading-snug">
          {method}
        </h4>
        <p className="text-xs text-[#676A78] leading-relaxed">
          Disarankan berdasarkan kecenderungan cara Anda memproses materi baru secara lebih optimal.
        </p>
      </div>
    </div>
  )
}

interface StudyMethodsSectionProps {
  methods: string[]
  strengths: string[]
}

export function StudyMethodsSection({ methods, strengths }: StudyMethodsSectionProps) {
  if (methods.length === 0 && strengths.length === 0) return null

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-extrabold text-[#17181C]">
          Pendekatan Belajar yang Disarankan
        </h3>
        <p className="text-xs text-[#676A78] mt-0.5">
          Strategi belajar berikut dirancang untuk memaksimalkan daya serap materi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((method, idx) => (
          <StudyMethodCard key={idx} method={method} index={idx} />
        ))}
      </div>

      {strengths.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#E6F6EE]/60 border border-[#45B97C]/20 flex items-start gap-3 mt-3">
          <CheckCircle2 className="w-4 h-4 text-[#45B97C] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1D1D24] leading-relaxed">
            <span className="font-bold text-[#207248]">Kekuatan Belajar: </span>
            {strengths.join(' • ')}
          </div>
        </div>
      )}
    </div>
  )
}

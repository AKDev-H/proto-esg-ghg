import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateYearOptions } from "@/lib/utils"

interface YearSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function YearSelector({ value, onValueChange }: YearSelectorProps) {
  const years = generateYearOptions()

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y.value} value={String(y.value)}>{y.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
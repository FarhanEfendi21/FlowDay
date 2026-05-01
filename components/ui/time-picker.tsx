"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string // HH:mm format
  onChange?: (time: string) => void
  disabled?: boolean
  id?: string
  label?: string
}

export function TimePicker({
  value = "23:59",
  onChange,
  disabled = false,
  id = "time",
  label = "Waktu",
}: TimePickerProps) {
  const [hours, setHours] = React.useState(23)
  const [minutes, setMinutes] = React.useState(59)

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      setHours(parseInt(h || "23", 10))
      setMinutes(parseInt(m || "59", 10))
    }
  }, [value])

  // Notify parent on change
  React.useEffect(() => {
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    onChange?.(timeString)
  }, [hours, minutes, onChange])

  const handleHoursInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "")
    if (val === "") return
    
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= 0 && num <= 23) {
      setHours(num)
    }
  }

  const handleMinutesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "")
    if (val === "") return
    
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= 0 && num <= 59) {
      setMinutes(num)
    }
  }

  return (
    <div className="space-y-3">
      {label && <Label htmlFor={id} className="text-sm font-medium">{label}</Label>}
      
      {/* Time Display & Input */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          {/* Hours */}
          <div className="relative flex-1">
            <Input
              type="text"
              inputMode="numeric"
              value={hours.toString().padStart(2, "0")}
              onChange={handleHoursInputChange}
              disabled={disabled}
              className="text-center text-lg font-semibold h-11"
              maxLength={2}
              placeholder="00"
            />
            <span className="absolute left-0 right-0 -bottom-5 text-[10px] text-center text-muted-foreground">
              Jam
            </span>
          </div>
          
          <span className="text-lg font-semibold text-muted-foreground pb-1">:</span>
          
          {/* Minutes */}
          <div className="relative flex-1">
            <Input
              type="text"
              inputMode="numeric"
              value={minutes.toString().padStart(2, "0")}
              onChange={handleMinutesInputChange}
              disabled={disabled}
              className="text-center text-lg font-semibold h-11"
              maxLength={2}
              placeholder="00"
            />
            <span className="absolute left-0 right-0 -bottom-5 text-[10px] text-center text-muted-foreground">
              Menit
            </span>
          </div>
        </div>
        
        {/* Clock Icon */}
        <div className="flex items-center justify-center w-11 h-11 rounded-md border bg-muted/50">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3 pt-2">
        {/* Hours Slider */}
        <div className="space-y-1.5">
          <Slider
            value={[hours]}
            onValueChange={(val) => setHours(val[0])}
            min={0}
            max={23}
            step={1}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Minutes Slider */}
        <div className="space-y-1.5">
          <Slider
            value={[minutes]}
            onValueChange={(val) => setMinutes(val[0])}
            min={0}
            max={59}
            step={1}
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex gap-1.5 pt-1">
        {[
          { label: "Pagi", time: [8, 0] },
          { label: "Siang", time: [12, 0] },
          { label: "Sore", time: [17, 0] },
          { label: "Malam", time: [23, 59] },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setHours(preset.time[0])
              setMinutes(preset.time[1])
            }}
            disabled={disabled}
            className={cn(
              "flex-1 px-2 py-1.5 text-xs font-medium rounded-md border transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

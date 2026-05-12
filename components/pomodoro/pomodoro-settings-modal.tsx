"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Timer, Loader2 } from "lucide-react"
import { useGetPomodoroSettings, useUpdatePomodoroSettings } from "@/features/pomodoro"
import { toast } from "sonner"

interface PomodoroSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PomodoroSettingsModal({ open, onOpenChange }: PomodoroSettingsModalProps) {
  const { data: pomodoroSettings, isLoading } = useGetPomodoroSettings()
  const updatePomodoroSettings = useUpdatePomodoroSettings()

  // Local state for sliders
  const [localWorkDuration, setLocalWorkDuration] = useState<number>(25)
  const [localShortBreak, setLocalShortBreak] = useState<number>(5)
  const [localLongBreak, setLocalLongBreak] = useState<number>(15)
  const [localSessionsUntilLong, setLocalSessionsUntilLong] = useState<number>(4)
  const [localAutoStartBreaks, setLocalAutoStartBreaks] = useState<boolean>(false)
  const [localAutoStartWork, setLocalAutoStartWork] = useState<boolean>(false)
  const [localSoundEnabled, setLocalSoundEnabled] = useState<boolean>(true)
  
  const [isSaving, setIsSaving] = useState(false)

  // Sync local state with fetched settings
  useEffect(() => {
    if (pomodoroSettings) {
      setLocalWorkDuration(pomodoroSettings.workDuration)
      setLocalShortBreak(pomodoroSettings.shortBreak)
      setLocalLongBreak(pomodoroSettings.longBreak)
      setLocalSessionsUntilLong(pomodoroSettings.sessionsUntilLongBreak)
      setLocalAutoStartBreaks(pomodoroSettings.autoStartBreaks)
      setLocalAutoStartWork(pomodoroSettings.autoStartWork)
      setLocalSoundEnabled(pomodoroSettings.soundEnabled)
    }
  }, [pomodoroSettings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePomodoroSettings.mutateAsync({
        workDuration: localWorkDuration,
        shortBreak: localShortBreak,
        longBreak: localLongBreak,
        sessionsUntilLongBreak: localSessionsUntilLong,
        autoStartBreaks: localAutoStartBreaks,
        autoStartWork: localAutoStartWork,
        soundEnabled: localSoundEnabled,
      })
      
      toast.success("Pengaturan Pomodoro berhasil disimpan!")
      
      // Small delay to ensure cache invalidation completes
      await new Promise(resolve => setTimeout(resolve, 100))
      
      onOpenChange(false)
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan")
      console.error("Failed to save Pomodoro settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    if (pomodoroSettings) {
      setLocalWorkDuration(pomodoroSettings.workDuration)
      setLocalShortBreak(pomodoroSettings.shortBreak)
      setLocalLongBreak(pomodoroSettings.longBreak)
      setLocalSessionsUntilLong(pomodoroSettings.sessionsUntilLongBreak)
      setLocalAutoStartBreaks(pomodoroSettings.autoStartBreaks)
      setLocalAutoStartWork(pomodoroSettings.autoStartWork)
      setLocalSoundEnabled(pomodoroSettings.soundEnabled)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Pengaturan Pomodoro Timer
          </DialogTitle>
          <DialogDescription>
            Kustomisasi durasi dan perilaku timer Pomodoro sesuai kebutuhan Anda
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Duration Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Durasi Timer</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="work-duration">Durasi Fokus</Label>
                  <span className="text-sm font-medium tabular-nums">{localWorkDuration} menit</span>
                </div>
                <Slider
                  id="work-duration"
                  min={15}
                  max={60}
                  step={5}
                  value={[localWorkDuration]}
                  onValueChange={([value]) => setLocalWorkDuration(value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="short-break">Istirahat Pendek</Label>
                  <span className="text-sm font-medium tabular-nums">{localShortBreak} menit</span>
                </div>
                <Slider
                  id="short-break"
                  min={3}
                  max={15}
                  step={1}
                  value={[localShortBreak]}
                  onValueChange={([value]) => setLocalShortBreak(value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="long-break">Istirahat Panjang</Label>
                  <span className="text-sm font-medium tabular-nums">{localLongBreak} menit</span>
                </div>
                <Slider
                  id="long-break"
                  min={10}
                  max={30}
                  step={5}
                  value={[localLongBreak]}
                  onValueChange={([value]) => setLocalLongBreak(value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sessions-until-long">Sesi Sebelum Istirahat Panjang</Label>
                  <span className="text-sm font-medium tabular-nums">{localSessionsUntilLong}</span>
                </div>
                <Slider
                  id="sessions-until-long"
                  min={2}
                  max={8}
                  step={1}
                  value={[localSessionsUntilLong]}
                  onValueChange={([value]) => setLocalSessionsUntilLong(value)}
                  className="w-full"
                />
              </div>
            </div>

            <Separator />

            {/* Behavior Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Perilaku Timer</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-start-breaks">Auto-start Istirahat</Label>
                  <p className="text-xs text-muted-foreground">
                    Mulai istirahat otomatis setelah sesi fokus
                  </p>
                </div>
                <Switch
                  id="auto-start-breaks"
                  checked={localAutoStartBreaks}
                  onCheckedChange={setLocalAutoStartBreaks}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-start-work">Auto-start Fokus</Label>
                  <p className="text-xs text-muted-foreground">
                    Mulai sesi fokus otomatis setelah istirahat
                  </p>
                </div>
                <Switch
                  id="auto-start-work"
                  checked={localAutoStartWork}
                  onCheckedChange={setLocalAutoStartWork}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-enabled">Suara Notifikasi</Label>
                  <p className="text-xs text-muted-foreground">
                    Putar suara saat timer selesai
                  </p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={localSoundEnabled}
                  onCheckedChange={setLocalSoundEnabled}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

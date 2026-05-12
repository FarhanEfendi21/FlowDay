# 🍅 Pomodoro Timer Feature

Complete Pomodoro Timer implementation for FlowDay productivity app.

## Features

### ✨ Core Functionality
- **Work Sessions**: Customizable focus time (default 25 minutes)
- **Short Breaks**: Quick rest periods (default 5 minutes)
- **Long Breaks**: Extended rest after multiple sessions (default 15 minutes)
- **Auto-advance**: Automatically transition between work and breaks
- **Task Integration**: Link Pomodoro sessions to specific tasks
- **Session Tracking**: All sessions saved to database for analytics

### 🎨 UI/UX
- Beautiful animated timer with progress ring
- Visual session counter (dots showing progress to long break)
- Color-coded session types (red for work, green for breaks)
- Pause/Resume functionality
- Skip to next phase
- Sound notification on completion
- Real-time stats display

### 📊 Analytics
- Total focus time tracking
- Session completion rate
- Daily breakdown of work sessions
- Achievement badges for milestones
- Integration with Analytics page

### ⚙️ Settings
- Customizable durations for all session types
- Configure sessions until long break (2-8)
- Auto-start options for breaks and work
- Sound notification toggle
- All settings persist per user

## Database Schema

### `pomodoro_sessions` Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- task_id: UUID (optional, foreign key to tasks)
- type: TEXT ('work' | 'short_break' | 'long_break')
- duration_minutes: INTEGER
- completed_minutes: INTEGER
- status: TEXT ('in_progress' | 'completed' | 'cancelled')
- started_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Settings (in `notification_preferences` table)
```sql
- pomodoro_work_duration: INTEGER (default 25)
- pomodoro_short_break: INTEGER (default 5)
- pomodoro_long_break: INTEGER (default 15)
- pomodoro_sessions_until_long_break: INTEGER (default 4)
- pomodoro_auto_start_breaks: BOOLEAN (default false)
- pomodoro_auto_start_work: BOOLEAN (default false)
- pomodoro_sound_enabled: BOOLEAN (default true)
```

## File Structure

```
features/pomodoro/
├── types/
│   └── index.ts              # TypeScript types & Zod schemas
├── api/
│   └── pomodoroService.ts    # Supabase API calls
├── hooks/
│   └── usePomodoro.ts        # React Query hooks
└── index.ts                  # Public exports

components/pomodoro/
├── pomodoro-timer.tsx        # Main timer component
└── pomodoro-stats-card.tsx   # Analytics card component

supabase/migrations/
└── 013_add_pomodoro_sessions.sql  # Database migration
```

## Usage

### Open Timer from Tasks Page
```tsx
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer"

<Button onClick={() => setPomodoroOpen(true)}>
  <Timer className="h-4 w-4" /> Pomodoro
</Button>

<PomodoroTimer
  open={pomodoroOpen}
  onOpenChange={setPomodoroOpen}
  tasks={todoTasks}
/>
```

### Display Stats in Analytics
```tsx
import { PomodoroStatsCard } from "@/components/pomodoro/pomodoro-stats-card"

<PomodoroStatsCard />
```

### Settings Integration
```tsx
import { useGetPomodoroSettings, useUpdatePomodoroSettings } from "@/features/pomodoro"

const { data: settings } = useGetPomodoroSettings()
const updateSettings = useUpdatePomodoroSettings()

// Update setting
await updateSettings.mutateAsync({ workDuration: 30 })
```

## API Reference

### Hooks

#### `useGetPomodoroSessions(limit?: number)`
Fetch user's Pomodoro sessions.

#### `useCreatePomodoroSession()`
Create a new Pomodoro session.

#### `useUpdatePomodoroSession()`
Update existing session (mark complete, cancelled, etc).

#### `useGetPomodoroStats(days?: number)`
Get aggregated stats for last N days (default 7).

#### `useGetPomodoroSettings()`
Fetch user's Pomodoro preferences.

#### `useUpdatePomodoroSettings()`
Update user's Pomodoro preferences.

### Service Functions

#### `createPomodoroSession(input: CreatePomodoroSessionInput)`
```ts
{
  type: 'work' | 'short_break' | 'long_break',
  durationMinutes: number,
  taskId?: string | null
}
```

#### `updatePomodoroSession(sessionId: string, input: UpdatePomodoroSessionInput)`
```ts
{
  completedMinutes?: number,
  status?: 'in_progress' | 'completed' | 'cancelled',
  completedAt?: string
}
```

#### `getPomodoroStats(days: number)`
Returns:
```ts
{
  totalSessions: number,
  completedSessions: number,
  totalWorkMinutes: number,
  totalBreakMinutes: number,
  dailyBreakdown: Array<{
    date: string,
    workMinutes: number,
    sessions: number
  }>
}
```

## Sound Notification

Timer completion sound is located at `/public/sounds/timer-complete.mp3`.

**To add custom sound:**
1. Replace `public/sounds/timer-complete.mp3` with your audio file
2. Recommended: Pleasant bell/chime, 1-2 seconds duration
3. Free sources: [Freesound.org](https://freesound.org/), [Mixkit](https://mixkit.co/free-sound-effects/)

## Migration

Run migration to add Pomodoro tables:

```bash
# If using Supabase CLI
supabase db push

# Or apply via Supabase Dashboard
# Copy content from supabase/migrations/013_add_pomodoro_sessions.sql
```

## Future Enhancements

- [ ] Pomodoro history page with calendar view
- [ ] Weekly/monthly focus time goals
- [ ] Integration with task time estimates
- [ ] Desktop notifications (PWA)
- [ ] Pomodoro leaderboard (optional social feature)
- [ ] Export Pomodoro data to CSV
- [ ] Pomodoro widget for dashboard
- [ ] Custom timer presets (e.g., "Deep Work: 90min")

## Credits

Pomodoro Technique® created by Francesco Cirillo.

'use client'

import { Mode, calendarModes } from '../../calendar-types'
import { useCalendarContext } from '../../calendar-context'
import { calendarModeIconMap } from '../../calendar-mode-icon-map'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function CalendarHeaderActionsMode() {
  const { mode, setMode } = useCalendarContext()

  return (
    <ToggleGroup
      className="flex gap-0 -space-x-px rounded-lg shadow-xs shadow-black/5 rtl:space-x-reverse"
      type="single"
      variant="outline"
      value={mode}
      onValueChange={(value) => {
        if (value) setMode(value as Mode)
      }}
    >
      {calendarModes.map((modeValue) => (
        <ToggleGroupItem
          key={modeValue}
          className={`flex-1 rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 
            text-base flex items-center justify-center gap-2 
            hover:bg-background-hover bg-background`}
          value={modeValue}
        >
          {calendarModeIconMap[modeValue]}
          <p className="hidden xl:block font-medium text-foreground">
            {modeValue.charAt(0).toUpperCase() + modeValue.slice(1)}
          </p>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

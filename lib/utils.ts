import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
  }).format(amount)

  return `Rp ${formatted}`
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function generateBookingId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `HS-${timestamp}-${random}`.toUpperCase()
}

export function calculateEndTime(startTime: string, durationHours: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + durationHours * 60
  const endHours = Math.floor(endMinutes / 60) % 24
  const endMins = endMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
}

export function isTimeSlotAvailable(
  existingBookings: Array<{ start_time: string; duration_hours: number; additional_hour: boolean | null }>,
  requestedStartTime: string,
  requestedDuration: number,
  requestedAdditionalHour: boolean
): boolean {
  const newStart = timeToMinutes(requestedStartTime)
  const totalNewDuration = requestedDuration + (requestedAdditionalHour ? 1 : 0)
  const newEnd = newStart + totalNewDuration * 60

  for (const booking of existingBookings) {
    const existingStart = timeToMinutes(booking.start_time)
    const totalExistingDuration = booking.duration_hours + (booking.additional_hour ? 1 : 0)
    const existingEnd = existingStart + totalExistingDuration * 60

    // Check for overlap
    if (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    ) {
      return false
    }
  }

  return true
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function getBookedTimeSlots(
  existingBookings: Array<{ start_time: string; duration_hours: number; additional_hour: boolean | null }>
): Array<{ start: string; end: string }> {
  const bookedSlots: Array<{ start: string; end: string }> = []
  
  for (const booking of existingBookings) {
    const totalDuration = booking.duration_hours + (booking.additional_hour ? 1 : 0)
    const endTime = calculateEndTime(booking.start_time, totalDuration)
    bookedSlots.push({
      start: booking.start_time,
      end: endTime
    })
  }
  
  return bookedSlots
}

export function getAvailableTimeSlots(
  date: string,
  existingBookings: Array<{ start_time: string; duration_hours: number; additional_hour: boolean | null }>,
  durationHours: number,
  additionalHour: boolean
): string[] {
  const slots: string[] = []
  const startHour = 8 // 8 AM
  const endHour = 18 // 6 PM (1080 minutes)
  const totalDuration = durationHours + (additionalHour ? 1 : 0)
  const closingMinutes = endHour * 60 // 1080 minutes

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const startMinutes = timeToMinutes(timeSlot)
      const endMinutes = startMinutes + (totalDuration * 60)

      // Check if booking would end before or at 6 PM
      // Don't use calculateEndTime here because it wraps around midnight with % 24
      if (endMinutes <= closingMinutes) {
        if (isTimeSlotAvailable(existingBookings, timeSlot, durationHours, additionalHour)) {
          slots.push(timeSlot)
        }
      }
    }
  }

  return slots
}

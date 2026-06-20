import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { api }     from '../services/api'
import socket      from '../services/socket'

export function useTripHistory() {
  const { user }          = useAuth()
  const [trips, setTrips] = useState([])

  useEffect(() => {
    if (!user) return
    api.getTrips(user.uid).then(setTrips)
    socket.on('trip_saved', (trip) => {
      setTrips(prev => [trip, ...prev])
    })
    return () => socket.off('trip_saved')
  }, [user])

  return { trips }
}

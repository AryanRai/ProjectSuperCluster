'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('offline')
  const [isLoading, setIsLoading] = useState(false)

  const startServer = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('start-server')
      if (error) throw error
      setServerStatus('online')
    } catch (error) {
      console.error('Error starting server:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stopServer = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('stop-server')
      if (error) throw error
      setServerStatus('offline')
    } catch (error) {
      console.error('Error stopping server:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateDynDNS = async () => {
    try {
      const { error } = await supabase.functions.invoke('update-dyndns')
      if (error) throw error
      alert('DynDNS updated successfully')
    } catch (error) {
      console.error('Error updating DynDNS:', error)
      alert('Failed to update DynDNS')
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Server Status</h2>
          <div className="mt-4 flex items-center space-x-4">
            <div className={`h-4 w-4 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-lg font-medium capitalize">{serverStatus}</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={startServer}
            disabled={isLoading || serverStatus === 'online'}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Start Server
          </button>
          <button
            onClick={stopServer}
            disabled={isLoading || serverStatus === 'offline'}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Stop Server
          </button>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button 
              onClick={updateDynDNS}
              className="bg-gray-100 p-4 rounded-lg hover:bg-gray-200 text-left"
            >
              <h4 className="font-medium">Update DynDNS</h4>
              <p className="text-sm text-gray-600">Update your server's IP address</p>
            </button>
            <button className="bg-gray-100 p-4 rounded-lg hover:bg-gray-200 text-left">
              <h4 className="font-medium">View Logs</h4>
              <p className="text-sm text-gray-600">Check server activity and errors</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
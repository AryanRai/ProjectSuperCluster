'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ServerControl() {
  const [memory, setMemory] = useState('2G')
  const [isLoading, setIsLoading] = useState(false)

  const updateServerSettings = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('update-server-settings', {
        body: { memory }
      })
      if (error) throw error
      alert('Server settings updated successfully')
    } catch (error) {
      console.error('Error updating server settings:', error)
      alert('Failed to update server settings')
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

  const createBackup = async () => {
    try {
      const { error } = await supabase.functions.invoke('create-backup')
      if (error) throw error
      alert('Backup created successfully')
    } catch (error) {
      console.error('Error creating backup:', error)
      alert('Failed to create backup')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Server Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="memory" className="block text-sm font-medium text-gray-700">
              Memory Allocation
            </label>
            <select
              id="memory"
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="1G">1GB</option>
              <option value="2G">2GB</option>
              <option value="4G">4GB</option>
              <option value="8G">8GB</option>
            </select>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                onClick={updateServerSettings}
                disabled={isLoading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">DynDNS Settings</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Current Domain: mc.aryanrai.me</p>
          </div>
          <button
            onClick={updateDynDNS}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update IP Address
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Backup Management</h2>
        <div className="space-y-4">
          <button
            onClick={createBackup}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Create Backup
          </button>
        </div>
      </div>
    </div>
  )
} 
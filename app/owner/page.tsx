// app/owner/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/store'

interface UserData {
  id: string
  email: string
  role: string
  commissionRate: number
  cutPercentage: number
  taxPercentage: number
  monthlyGoal: number
}

export default function OwnerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifică dacă utilizatorul este owner
    if (!user) {
      router.push('/login')
      return
    }
    
    if (user.role !== 'owner') {
      router.push('/dashboard')
      return
    }

    fetchUsers()
  }, [user, router])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/owner/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Owner Dashboard</h1>
      
      {/* Statistici generale */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600">Total Dispatcheri</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600">Owners</div>
          <div className="text-2xl font-bold">
            {users.filter(u => u.role === 'owner').length}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600">Dispatchers</div>
          <div className="text-2xl font-bold">
            {users.filter(u => u.role === 'dispatcher').length}
          </div>
        </div>
      </div>

      {/* Tabel cu toți utilizatorii */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comision
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cut %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tax %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Goal
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'owner' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.commissionRate}%</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.cutPercentage}%</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.taxPercentage}%</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(user.monthlyGoal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
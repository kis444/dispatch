'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  type User,
  defaultUserSettings,
  generateId,
  getAuthUser,
  setAuthUser,
  getUsers,
  saveUser,
  updateUserSettings,
} from './store'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateSettings: (settings: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authUser = getAuthUser()
    setUser(authUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers()
    const userEntry = users[email]

    if (!userEntry) {
      return { success: false, error: 'No account found with this email' }
    }

    if (userEntry.password !== password) {
      return { success: false, error: 'Incorrect password' }
    }

    setAuthUser(userEntry.user)
    setUser(userEntry.user)
    return { success: true }
  }

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers()

    if (users[email]) {
      return { success: false, error: 'An account with this email already exists' }
    }

    const newUser: User = {
      id: generateId(),
      email,
      ...defaultUserSettings,
    }

    saveUser(email, password, newUser)
    setAuthUser(newUser)
    setUser(newUser)
    return { success: true }
  }

  const logout = () => {
    setAuthUser(null)
    setUser(null)
  }

  const updateSettings = (settings: Partial<User>) => {
    if (user) {
      updateUserSettings(user.id, settings)
      setUser({ ...user, ...settings })
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signUp, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

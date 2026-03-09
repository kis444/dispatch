// app/api/owner/users/route.ts
import { NextRequest } from "next/server"
import { getUsers } from "@/lib/store"

export async function GET(request: NextRequest) {
  try {
    // Obține toți utilizatorii din localStorage
    const usersData = getUsers()
    
    // Transformă în array și adaugă statistici
    const users = Object.values(usersData).map(entry => {
      const user = entry.user
      
      // Aici poți adăuga statistici din localStorage dacă vrei
      // De exemplu, numără câți șoferi are fiecare utilizator
      
      return {
        id: user.id,
        email: user.email,
        role: user.role || 'dispatcher', // Dacă nu există rol, default dispatcher
        commissionRate: user.commissionRate,
        cutPercentage: user.cutPercentage,
        taxPercentage: user.taxPercentage,
        monthlyGoal: user.monthlyGoal,
        defaultAfterHoursValue: user.defaultAfterHoursValue,
        averageLoadValue: user.averageLoadValue
      }
    })
    
    return Response.json(users)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
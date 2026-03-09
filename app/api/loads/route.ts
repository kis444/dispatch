import { connectDB } from "@/lib/mongodb"
import Load from "@/models/Load"

export async function GET() {
  await connectDB()

  const loads = await Load.find()

  return Response.json(loads)
}

export async function POST(req: Request) {
  await connectDB()

  const body = await req.json()

  const load = await Load.create(body)

  return Response.json(load)
}
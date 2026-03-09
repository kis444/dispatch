import { connectDB } from "@/lib/mongodb"
import Driver from "@/models/Driver"

export async function GET() {
  await connectDB()

  const drivers = await Driver.find()

  return Response.json(drivers)
}

export async function POST(req: Request) {
  await connectDB()

  const body = await req.json()

  const driver = await Driver.create(body)

  return Response.json(driver)
}
import { NextFunction, Request, Response } from "express"
import { checkUser } from "../queries/checkUser"

export const validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header("Authorization")?.replace("Token ", "") // Extract token
  if (!token) {
    res.status(401).json({ error: "Token required" })
    return
  }
  try {
    const checkUserResult = await checkUser(token)
    if (!checkUserResult) {
      console.log("???")
      res.status(401).json({ error: "Invalid token" })
      return
    }
    console.log("Validated")
    next()
  } catch (err) {
    console.error("Token validation error:", err)
    res.status(500).json({ error: "Internal server error" })
    return
  }
}

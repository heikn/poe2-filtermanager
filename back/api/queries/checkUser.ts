import { QueryResult } from "pg"
import { client } from ".."

export const checkUser = async (token: string): Promise<boolean> => {
  try {
    const query = "SELECT 1 FROM users WHERE token = $1 LIMIT 1;"
    const result = (await client.query(query, [token])) as QueryResult
    if (result.rows.length > 0) return true
    return false
  } catch (err) {
    console.error("Error checking token:", err)
    throw new Error("Failed to check token validity.")
  }
}

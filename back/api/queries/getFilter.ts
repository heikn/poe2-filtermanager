import { client } from ".."

export const getFilter = async (id: string, token?: string): Promise<object> => {
  const query = `
    SELECT * FROM filters WHERE id = $1;
  `
  const values = [id]

  try {
    const res = await client.query(query, values)
    if (res.rows.length === 0) {
      throw new Error("Filter not found")
    }
    if(!token || token !== res.rows[0].user_token) {
      console.log("Token not found or invalid")
      console.log("Token:",token)
      return {
        filter_name: res.rows[0].filter_name,
        blocks: res.rows[0].blocks
      }
    }
    return res.rows[0]
  } catch (err) {
    console.error("Error fetching filter:", err)
    throw err
  }
}

import { client } from ".."

export const addFilter = async (filterName: string, blocks: string, token: string): Promise<string> => {
  const query = `
    INSERT INTO filters (filter_name, blocks, user_token)
    VALUES ($1, $2, $3)
    RETURNING id, filter_name, created_at;
  `
  const values = [filterName, blocks, token]

  try {
    const res = await client.query(query, values)
    return res.rows[0]
  } catch (err) {
    console.error("Error inserting filter:", err)
    throw err
  }
}

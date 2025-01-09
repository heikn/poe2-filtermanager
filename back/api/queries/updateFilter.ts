import { client } from ".."

export const updateFilter = async (filterName: string, blocks: string, id: string, token: string): Promise<boolean> => {
  const query = `
    UPDATE filters
    SET filter_name = $1, blocks = $2
    WHERE id = $3 AND user_token = $4
  `
  const values = [filterName, blocks, id, token]
  console.log("VALUES:", values)
  try {
    const res = await client.query(query, values);
    console.log("MIKSI")
    if (!res.rowCount) return false
    return res.rowCount > 0
  } catch (err) {
    console.error("Error updating filter:", err);
    throw err;
  }
}
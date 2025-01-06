import { client } from ".."

export const addFilter = async (filterName: string, blocks: object): Promise<string> => {
  const query = `
    INSERT INTO filters (filter_name, blocks)
    VALUES ($1, $2)
    RETURNING id;
  `
  const values = [filterName, blocks]

  try {
    const res = await client.query(query, values)
    return res.rows[0].id
  } catch (err) {
    console.error("Error inserting filter:", err)
    throw err
  }
}

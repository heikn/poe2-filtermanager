import {client} from ".."

export const getFilter = async(id: string): Promise<object> => {
  const query = `
    SELECT * FROM filters WHERE id = $1;
  `;
  const values = [id];

  try {
    const res = await client.query(query, values);
    if (res.rows.length === 0) {
      throw new Error('Filter not found');
    }
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching filter:', err);
    throw err;
  }
}
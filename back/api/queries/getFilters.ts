import {client} from ".."

export const getFilters = async(token: string): Promise<object> => {
  const query = `
    SELECT id, filter_name, created_at FROM filters WHERE user_token = $1;
  `;
  const values = [token];

  try {
    const res = await client.query(query, values);
    if (res.rows.length === 0) {
      throw new Error('Filter not found');
    }
    return res.rows;
  } catch (err) {
    console.error('Error fetching filter:', err);
    throw err;
  }
}
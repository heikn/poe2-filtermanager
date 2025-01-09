import { client } from ".."

export const addUser = async () => {
  try{
    const query = "INSERT INTO users DEFAULT VALUES RETURNING token"
    const result = await client.query(query)
    if(result.rows.length > 0){
      return result.rows[0]
    }
  } catch(err) {
    throw new Error("No user was created")
  }
}
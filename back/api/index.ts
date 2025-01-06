import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import { Client } from "pg"
import { addFilter } from "./queries/addFilter"
import { getFilter } from "./queries/getFilter"
import cors from 'cors'

dotenv.config()

const app: Express = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())

export const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
})

client
  .connect()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Database connection error", err))

app.get("/", (req: Request, res: Response) => {
  res.send("test")
})

app.post("/create-link", async (req: Request, res: Response) => {
  const data = req.body
  try {
    const response = await addFilter(data.filterName, data.blocks)
    res.status(200).json({ message: "ok", id: response })
  } catch (err) {
    console.error("ERROR:", err)
    res.status(200).send({ message: err })
  }
})

app.get("/get-filter/:id", async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const filter = await getFilter(id)
    res.status(200).json(filter)
  } catch (err ) {
    if (err instanceof Error) {
      console.error("Server error: ", err.message);
    } else {
      console.error("Unknown error: ", err);
    }
  }
})

app.listen(port, () => {
  console.log("Server running on port ", port)
})

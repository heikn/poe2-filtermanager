import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import { Client } from "pg"
import { addFilter } from "./queries/addFilter"
import { getFilter } from "./queries/getFilter"
import cors from "cors"
import { addUser } from "./queries/addUser"
import { validateToken } from "./middleware/validateToken"
import { getFilters } from "./queries/getFilters"
import { updateFilter } from "./queries/updateFilter"

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

app.post("/create-link", validateToken, async (req: Request, res: Response) => {})

app.get("/get-filter/:id", async (req: Request, res: Response) => {
  // Need to check if owner
  const { id } = req.params
  const token = req.header("Authorization")?.replace("Token ", "")
  try {
    const filter = await getFilter(id, token)
    res.status(200).json(filter)
  } catch (err) {
    if (err instanceof Error) {
      console.error("Server error: ", err.message)
      res.status(400).json({message: "Error", error: err.message})
    } else {
      res.status(400).json({message: "Error", error: err})
      console.error("Unknown error: ", err)
    }
  }
})

app.post("/create-filter", validateToken, async (req: Request, res: Response) => {
  if (!req.body) res.status(400).send("You must provide filter data")
  try {
    const token = req.header("Authorization")?.replace("Token ", "")
    if (!token) {
      res.status(400)
      return
    }
    console.log("Blocks:", req.body.blocks)
    const addFilterResult = await addFilter(req.body.filterName, JSON.stringify(req.body.blocks), token)
    res.status(200).json({ message: "Ok", data: addFilterResult })
  } catch (err) {}
})

app.put("/update-filter", validateToken, async (req: Request, res: Response) => {
  if (!req.body) res.status(400).send("You must provide filter data")
  try {
    const token = req.header("Authorization")?.replace("Token ", "")
    const updated = await updateFilter(req.body.filterName, JSON.stringify(req.body.blocks), req.body.filterId, token!)
    if(updated) {
      res.status(200).json({message: "Ok"})
    } else {
      res.status(400).send("Didn't update anything")
    }
  } catch (err) {}
})

app.delete("/delete-filter", async (req: Request, res: Response) => {})

app.get("/get-filters", validateToken, async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Token ", "")
    if (!token) {
      res.status(400)
      return
    }
    const getFiltersResult = await getFilters(token)
    res.status(200).json({ message: "Ok", data: getFiltersResult })
  } catch (err) {}
})

app.get("/get-token", async (req: Request, res: Response) => {
  try {
    const queryResult = await addUser()
    if (queryResult) {
      res.status(200).json({ message: "Ok", data: queryResult })
    }
  } catch (err) {
    res.status(400).json({ message: "Error", error: err })
  }
})

app.get("/check-token", validateToken, async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Ok" })
})

app.listen(port, () => {
  console.log("Server running on port ", port)
})

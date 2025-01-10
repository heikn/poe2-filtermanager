import axios from "axios"
import { BlockType, Filter } from "./types"

const API_URL = import.meta.env.VITE_API_URL

// Get new token
const getToken = async (): Promise<string | void> => {
  try {
    const response = await axios({
      method: "get",
      url: `${API_URL}/get-token`,
    })
    if (response.data) {
      console.log("response:", response)
      return response.data.data.token
    }
  } catch (err) {
    console.error("Error getting token")
  }
}

// Validate token
const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await axios({
      method: "get",
      url: `${API_URL}/check-token`,
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    console.log("CHECK RESPONSE:", response)
    if (response.data.message === "Ok") {
      return true
    }
    return false
  } catch (err) {
    console.error("Error validating token", err)
    return false
  }
}

// Get filters
const getFilters = async (token: string): Promise<Filter[] | null> => {
  try {
    const response = await axios({
      method: "get",
      url: `${API_URL}/get-filters`,
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    if (response.data) {
      return response.data.data
    }
    return null
  } catch (err) {
    console.error("Error getting filters", err)
    return null
  }
}

// Get filter
const getFilter = async (id: string): Promise<Filter | null> => {
  console.log("Retrieving filter...")
  const token = localStorage.getItem("token")
  try {
    const headers = token ? { Authorization: `Token ${token}` } : undefined
    const response = await axios({
      method: "get",
      url: `${API_URL}/get-filter/${id}`,
      headers,
    })
    console.log("???")
    if (!response) return null
    console.log("Found filter:", response.data)
    return response.data
  } catch (err) {
    console.error("Error getting filter:", err)
    return null
  }
}

const createFilter = async (filterName: string, blocks: BlockType[]) => {
  const token = localStorage.getItem("token")
  if (!blocks || !filterName || !token) return
  try {
    const response = await axios({
      method: "post",
      url: `${API_URL}/create-filter`,
      headers: {
        Authorization: `Token ${token}`,
      },
      data: {
        filterName,
        blocks
      },
    })
    return response.data
  } catch (err) {
    console.error("Error creating new filter")
  }
}

const updateFilter = async (filterName: string, blocks: BlockType[], filterId: string) => {
  const token = localStorage.getItem("token")
  if (!blocks || !filterName || !token || filterId) return
  try {
    const response = await axios({
      method: "put",
      url: `${API_URL}/update-filter`,
      headers: {
        Authorization: `Token ${token}`,
      },
      data: {
        filterName,
        blocks,
        filterId,
      },
    })
    console.log("Saved filter", response)
  } catch (err) {}
}

const api = { getToken, validateToken, getFilter, getFilters, createFilter, updateFilter }
export default api

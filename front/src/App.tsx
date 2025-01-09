import {
  AccordionValueChangeDetails,
  Box,
  Center,
  Container,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import Block from "./Block"
import { parseBlockToFilterBlock, parseFilterFileIntoBlocks } from "./parser"
import { debounce } from "lodash"
import "./app.css"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { AiOutlineDrag } from "react-icons/ai"
import { BlockType, Filter } from "@/types"
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from "@/components/ui/accordion"
import { initialBlock } from "@/constants"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { Provider } from "./components/ui/provider"
import { Alert } from "./components/ui/alert"
import axios from "axios"
import { useParams } from "react-router-dom"
import { MenuContent, MenuTrigger, MenuItem, MenuRoot, MenuTriggerItem } from "./components/ui/menu"
import { Field } from "./components/ui/field"
import { Tooltip } from "./components/ui/tooltip"
import { Button } from "./components/ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"

const saveStringAsFile = (str: string, filename: string) => {
  const blob = new Blob([str], { type: "text/plain" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const App = () => {
  const { id } = useParams<{ id: string }>()
  const [blocks, setBlocks] = useState<BlockType[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [filterName, setFilterName] = useState("")
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"info" | "warning" | "success" | "error" | "neutral">("info")
  const [filters, setFilters] = useState<Filter[]>([])
  const [filterId, setFilterId] = useState<string>("")
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL
  // Load blocks from local storage if no id
  useEffect(() => {
    if (id) return
    const blocks = localStorage.getItem("blocks")
    const filterName = localStorage.getItem("filterName")
    if (blocks) {
      let parsedBlocks = JSON.parse(blocks)
      parsedBlocks = parsedBlocks.map((block: BlockType) => {
        if (!block.sockets) {
          block.sockets = [0, 5] // Default value for sockets
        }
        if (!block.areaLevel) {
          block.areaLevel = [0, 100]
        }
        return block
      })
      setBlocks(parsedBlocks)
    }
    if (filterName) {
      setFilterName(filterName)
    }
    setIsLoaded(true)
  }, [])

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
      if (!response) return null
      console.log("Found filter:", response.data)
      return response.data
    } catch (err) {
      console.error("Error getting filter", err)
      return null
    }
  }

  // Get token from locaStorage, if no token, get one
  useEffect(() => {
    ;(async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        const newToken = await getToken()
        if (newToken) {
          localStorage.setItem("token", newToken)
        }
      } else {
        // Validate token
        console.log("Validating token")
        const validate = await validateToken(token)
        console.log("Got:", validate)
        if (validate) {
          console.log("Validated")
          const filtersData = await getFilters(token)
          console.log("filterdata:", filtersData)
          if (filtersData) {
            localStorage.setItem("filters", JSON.stringify(filtersData))
            setFilters(filtersData)
          }
          // Set filters to state
        } else {
          console.error("Token invalid, getting new one")
          const newToken = await getToken()
          if (newToken) {
            localStorage.setItem("token", newToken)
          }
        }
      }
    })()
  }, [])

  // Fetch filter by ID from backend
  useEffect(() => {
    const getFilter = async () => {
      if (id) {
        handleToastNotification("Retrieving filter...", "info")
        try {
          const response = await axios.get(`${API_URL}/get-filter/${id}`)
          const { filter_name, blocks } = response.data
          setFilterName(filter_name)
          setBlocks(blocks)
          setIsLoaded(true)
          handleToastNotification("Successfully loaded filter", "success", 3000)
        } catch (err) {
          console.error("Error fetching filter:", err)
          handleToastNotification("Failed to load filter", "error", 3000)
        }
      }
    }
    getFilter()
  }, [id])

  // Save blocks to local storage
  useEffect(() => {
    if (isLoaded) {
      saveBlocksToLocalStorage()
    }
  }, [blocks, filterName])

  // Scroll to active block
  useEffect(() => {
    if (activeIndex !== null && contentRefs.current[activeIndex]) {
      setTimeout(() => {
        contentRefs.current[activeIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 200)
    }
  }, [activeIndex])

  // Update block
  const updateBlock = useCallback(
    (index: number, updatedBlock: BlockType) => {
      setBlocks((prevBlocks) => prevBlocks.map((block, i) => (i === index ? { ...block, ...updatedBlock } : block)))
    },
    [setBlocks]
  )

  // Add new block
  const addNewBlock = useCallback(() => {
    setBlocks((prevBlocks) => [...prevBlocks, { ...initialBlock }])
  }, [setBlocks])

  // Remove block
  const removeBlock = useCallback(
    (index: number) => {
      setBlocks((prevBlocks) => prevBlocks.filter((_, i) => i !== index))
    },
    [setBlocks]
  )

  // Drag and drop blocks
  const onDragEnd = (result: any) => {
    if (!result.destination) return
    const reorderedBlocks = Array.from(blocks)
    const [removed] = reorderedBlocks.splice(result.source.index, 1)
    reorderedBlocks.splice(result.destination.index, 0, removed)
    setBlocks(reorderedBlocks)
  }

  // Save blocks to local storage
  const saveBlocksToLocalStorage = useCallback(
    debounce(() => {
      localStorage.setItem("blocks", JSON.stringify(blocks))
      localStorage.setItem("filterName", filterName)
    }, 1000),
    [blocks, filterName]
  )

  // Import filter
  const importFilter = async () => {
    try {
      handleToastNotification("Importing filter...", "info")
      setIsLoaded(false)
      let handle
      if (window.showOpenFilePicker) {
        ;[handle] = await window.showOpenFilePicker({
          types: [
            {
              description: "Filter Files",
              accept: { "text/plain": [".filter"] },
            },
          ],
          multiple: false,
        })
      } else {
        console.log("Trying to import")
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".filter"
        input.onchange = async (e: any) => {
          const file = e.target.files[0]
          const content = await file.text()
          const blocks = await parseFilterFileIntoBlocks(content)
          setBlocks(blocks)
          setFilterName(file.name.replace(".filter", ""))
          setFileHandle(file)
          setIsLoaded(true)
          handleToastNotification("Filter imported successfully.", "success", 3000)
        }
        input.click()
        return
      }
      const file = await handle.getFile()
      const content = await file.text()
      const blocks = await parseFilterFileIntoBlocks(content)
      setBlocks(blocks)
      setFilterName(file.name.replace(".filter", ""))
      setFileHandle(handle)
      setIsLoaded(true)
      handleToastNotification("Filter imported successfully.", "success", 3000)
    } catch (error) {
      handleToastNotification("Error importing filter.", "error", 3000)
      console.error("Error importing filter:", error)
    }
  }

  // Save filter file
  const saveFilterFile = async () => {
    if (!fileHandle) {
      console.error("No file handle available for saving.")
      return
    }
    try {
      const writable = await fileHandle.createWritable()
      let filterBlocks = ""
      blocks.forEach((block) => {
        const parsedBlock = parseBlockToFilterBlock(block)
        filterBlocks += parsedBlock
        filterBlocks += "\n"
      })
      filterBlocks = filterBlocks.trimEnd()
      await writable.write(filterBlocks)
      await writable.close()
      console.log("Filter saved successfully.")
      handleToastNotification("Filter saved successfully.", "success", 3000)
    } catch (error) {
      console.error("Error saving filter:", error)
    }
  }

  // Save filter
  const saveFilter = async () => {
    let urlSuffix = "/create-filter"
    if (filterId) {
      urlSuffix = "/update-filter"
    }
    const token = localStorage.getItem("token")
    if (!blocks || !filterName || !token) return
    try {
      const response = await axios({
        method: filterId ? "put" : "post",
        url: `${API_URL}${urlSuffix}`,
        headers: {
          Authorization: `Token ${token}`,
        },
        data: {
          filterName,
          blocks,
          filterId
        },
      })
      console.log("Saved filter", response)
    } catch (err) {}
  }

  // Handle accordion toggle
  const handleAccordionToggle = (e: AccordionValueChangeDetails, index: number) => {
    if (e.value[0] === `accordion-${index}`) {
      setActiveIndex(index)
    }
  }

  // Download filter
  const downloadHandler = () => {
    let filterBlocks = ""
    blocks.forEach((block) => {
      const parsedBlock = parseBlockToFilterBlock(block)
      filterBlocks += parsedBlock
      filterBlocks += "\n"
    })
    filterBlocks = filterBlocks.trimEnd()
    saveStringAsFile(filterBlocks, `${filterName}.filter`)
  }

  // Toast notifications
  const handleToastNotification = (
    message: string,
    type: "info" | "warning" | "success" | "error" | "neutral",
    duration?: number
  ) => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    if (duration) {
      setTimeout(() => {
        setShowToast(false)
      }, duration)
    }
  }

  const handleShareFilter = async () => {
    if (blocks.length === 0) return
    try {
      const response = await axios({
        method: "post",
        url: `${API_URL}/create-link`,
        data: {
          filterName: filterName,
          blocks: JSON.stringify(blocks),
        },
      })
      const link = `${window.location.origin}/filter/${response.data.id}`
      await navigator.clipboard.writeText(link)
      handleToastNotification("Link copied to clipboard!", "success", 3000)
      console.log("RESPONSE", response)
    } catch (err) {
      console.log("ERROR", err)
    }
  }

  const handleFilterLoad = async (id: string) => {
    handleToastNotification("Loading filter...", "info")
    setIsLoaded(false)
    const filterData = await getFilter(id)
    if (!filterData || !filterData.blocks) return
    setBlocks(filterData.blocks)
    setFilterId(filterData.id)
    setFilterName(filterData.filter_name)
    setIsLoaded(true)
    handleToastNotification("Filter loaded!", "success", 3000)
  }

  const handleFilterClear = async () => {
    setBlocks([])
    setFilterId("")
    setFilterName("")
    setClearDialogOpen(false)
  }

  return (
    <Provider>
      <Container minW={"dvw"} minH={"100vh"} display="flex" flexDirection="column" justifyContent="space-between" p={0}>
        {showToast && <Alert position={"absolute"} status={toastType} title={toastMessage} />}
        <VStack w={"100%"} h={"100%"} display={"flex"} flexDirection={"column"} flex={1}>
          <Header />
          <Container w={"100%"} id="asd">
            <HStack alignItems={"flex-end"} mb={1}>
              <MenuRoot>
                <MenuTrigger>
                  <Button size={"md"}>Filtermenu</Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="clear-filter" onClick={() => setClearDialogOpen(true)}>
                    New filter...
                  </MenuItem>
                  <MenuItem value="import-filter" onClick={importFilter}>
                    Import filter...
                  </MenuItem>
                  {fileHandle && (
                    <MenuItem value="save-filter-file" onClick={saveFilterFile}>
                      Save file
                    </MenuItem>
                  )}
                  {filters.length > 0 && (
                    <MenuRoot positioning={{ placement: "right-start", gutter: 2 }}>
                      <MenuTriggerItem value="load-filter">Load filter</MenuTriggerItem>
                      <MenuContent>
                        {filters.map((filter) => (
                          <MenuItem
                            key={filter.id}
                            value={`load-filter-${filter.id}`}
                            onClick={() => {
                              handleFilterLoad(filter.id)
                            }}
                          >
                            {filter.filter_name}
                          </MenuItem>
                        ))}
                      </MenuContent>
                    </MenuRoot>
                  )}
                  <MenuItem value="save-new-filter" onClick={saveFilter}>
                    {filterId ? 'Save' : 'Save as new'}
                  </MenuItem>
                  {filterId && (
                    <>
                      <MenuItem value="share-filter" onClick={handleShareFilter}>
                        Share
                      </MenuItem>
                      <MenuItem value="download-filter" onClick={downloadHandler}>
                        Download
                      </MenuItem>
                    </>
                  )}
                </MenuContent>
              </MenuRoot>
              <Field label={"Filter name"}>
                <Input
                  placeholder="Filter name"
                  value={filterName}
                  w={"100%"}
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </Field>
            </HStack>
            <Center flex={1} alignItems={"flex-start"}>
              <VStack w={"100%"}>
                {isLoaded && (
                  <>
                    <Box w="80vw" maxH="70vh" overflowY="auto" className="hide-scrollbar">
                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="blocks">
                          {(provided) => (
                            <Box {...provided.droppableProps} ref={provided.innerRef}>
                              {blocks.map((block, index) => (
                                <DraggableBlock
                                  key={index}
                                  block={block}
                                  index={index}
                                  handleAccordionToggle={handleAccordionToggle}
                                  updateBlock={updateBlock}
                                  removeBlock={removeBlock}
                                  contentRefs={contentRefs}
                                />
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </Box>
                    <HStack w={"100%"} justifyContent={"space-between"}>
                      <Tooltip content="Add new filter rule" openDelay={100} positioning={{ placement: "top" }}>
                        <Button onClick={addNewBlock}>NEW FILTER RULE</Button>
                      </Tooltip>
                      <HStack></HStack>
                    </HStack>
                  </>
                )}
              </VStack>
            </Center>
          </Container>
        </VStack>
        <ConfirmationDialog open={clearDialogOpen} setOpen={setClearDialogOpen} handleFilterClear={handleFilterClear} />
        <Footer />
      </Container>
    </Provider>
  )
}

const DraggableBlock = ({
  block,
  index,
  handleAccordionToggle,
  updateBlock,
  removeBlock,
  contentRefs,
}: {
  block: BlockType
  index: number
  handleAccordionToggle: (e: AccordionValueChangeDetails, index: number) => void
  updateBlock: (index: number, updatedBlock: BlockType) => void
  removeBlock: (index: number) => void
  contentRefs: React.MutableRefObject<(HTMLDivElement | null)[]>
}) => {
  const showColor = "green.200/30"
  const hideColor = "red.200/30"

  return (
    <Box w="100%">
      <Draggable key={index} draggableId={index.toString()} index={index}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <AccordionRoot
              variant={"plain"}
              collapsible
              w={"100%"}
              onValueChange={(e) => handleAccordionToggle(e, index)}
              borderWidth={1}
            >
              <AccordionItem value={`accordion-${index}`} borderWidth={0} p={0}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  position="relative"
                  bgColor={block.show ? showColor : hideColor}
                >
                  <Box position="relative" {...provided.dragHandleProps}>
                    <AiOutlineDrag size={24} cursor={"grab"} />
                  </Box>
                  <AccordionItemTrigger flex="1">
                    <Box>
                      {block.show ? "Show" : "Hide"} - {block.name}
                    </Box>
                  </AccordionItemTrigger>
                </Box>

                <AccordionItemContent>
                  <div ref={(el) => (contentRefs.current[index] = el)}>
                    <VStack>
                      <Block index={index} block={block} updateBlock={updateBlock} />
                      <Container w={"100%"} gapX={"16px"}>
                        <Button w={"100%"} onClick={() => removeBlock(index)} mt={2}>
                          Remove
                        </Button>
                      </Container>
                    </VStack>
                  </div>
                </AccordionItemContent>
              </AccordionItem>
            </AccordionRoot>
          </div>
        )}
      </Draggable>
    </Box>
  )
}

const ConfirmationDialog = ({
  open,
  setOpen,
  handleFilterClear,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleFilterClear: () => void
}) => {
  return (
    <DialogRoot lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New filter</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>Are you sure you want to create a new filter?</Text>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">No</Button>
          </DialogActionTrigger>
          <Button onClick={handleFilterClear}>Yes</Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

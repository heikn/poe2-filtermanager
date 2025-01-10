import { AccordionValueChangeDetails, Box, Center, Container, HStack, Input, VStack } from "@chakra-ui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { parseBlockToFilterBlock, parseFilterFileIntoBlocks } from "./parser"
import { debounce } from "lodash"
import "./app.css"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { BlockType, Filter } from "@/types"
import { initialBlock } from "@/constants"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { Provider } from "./components/ui/provider"
import { Alert } from "./components/ui/alert"
import { useParams } from "react-router-dom"
import { MenuContent, MenuTrigger, MenuItem, MenuRoot, MenuTriggerItem } from "./components/ui/menu"
import { Field } from "./components/ui/field"
import { Tooltip } from "./components/ui/tooltip"
import { Button } from "./components/ui/button"
import { ConfirmationDialog } from "./components/ConfirmationDialog"
import { DraggableBlock } from "./components/DraggableBlock"
import api from "./api"

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

  // Load blocks from local storage if no id
  useEffect(() => {
    if (id) return
    const storageBlocks = localStorage.getItem("blocks")
    const storageFilterName = localStorage.getItem("filterName")
    const storafeFilterId = localStorage.getItem("filterId")
    if (storageBlocks) {
      let parsedBlocks = JSON.parse(storageBlocks)
      // Add updated fields to data retrieved from localStorage
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
    if (storageFilterName) {
      setFilterName(storageFilterName)
    }
    if (storafeFilterId) {
      setFilterId(storafeFilterId)
    }
    setIsLoaded(true)
  }, [])

  // Get token from locaStorage, if no token, get one
  useEffect(() => {
    ;(async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        const newToken = await api.getToken()
        if (newToken) {
          localStorage.setItem("token", newToken)
        }
      } else {
        // Validate token
        console.log("Validating token")
        const validate = await api.validateToken(token)
        console.log("Got:", validate)
        if (validate) {
          console.log("Validated")
          const filtersData = await api.getFilters(token)
          console.log("filterdata:", filtersData)
          if (filtersData) {
            localStorage.setItem("filters", JSON.stringify(filtersData))
            setFilters(filtersData)
          }
          // Set filters to state
        } else {
          console.error("Token invalid, getting new one")
          const newToken = await api.getToken()
          if (newToken) {
            localStorage.setItem("token", newToken)
          }
        }
      }
    })()
  }, [])

  // Fetch filter by ID from backend
  useEffect(() => {
    ;(async () => {
      if (id) {
        // Empty localStorage
        localStorage.removeItem("filterId")
        localStorage.removeItem("filterName")
        localStorage.removeItem("blocks")
        handleToastNotification("Loading filter...", "info")
        setIsLoaded(false)
        console.log("Trying to get filter")
        const filterData = await api.getFilter(id)
        if (!filterData || !filterData.blocks) {
          handleToastNotification("Error loading filter", "error", 3000)
          return
        }
        setBlocks(filterData.blocks)
        setFilterName(filterData.filter_name)
        setIsLoaded(true)
        handleToastNotification("Filter loaded!", "success", 3000)
      }
    })()
  }, [id])

  // Save blocks to local storage
  useEffect(() => {
    if (isLoaded) {
      saveBlocksToLocalStorage()
    }
  }, [blocks, filterName, filterId])

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
      localStorage.setItem("filterId", filterId)
    }, 1000),
    [blocks, filterName, filterId]
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
      handleToastNotification("Filter file saved successfully!", "success", 3000)
    } catch (error) {
      console.error("Error saving filter:", error)
    }
  }

  // Save new filter
  // TODO: error handling
  const createFilterHandler = async () => {
    const createFilterResult = await api.createFilter(filterName, blocks)
    setFilterId(createFilterResult.data.id)
    // Push to filters
    setFilters([...filters, createFilterResult.data])
    localStorage.setItem("filterId", createFilterResult.data.id)
    handleToastNotification("New filter saved successfully!", "success", 3000)
  }

  // Save filter
  // TODO: error handling
  const saveFilterHandler = async () => {
    await api.updateFilter(filterName, blocks, filterId)
    handleToastNotification("Filter saved successfully!", "success", 3000)
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

  // Handle toast notifications
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

  // Handle filter sharing
  const handleShareFilter = async () => {
    if (blocks.length === 0 || !filterId) return
    const link = `${window.location.origin}/filter/${filterId}`
    await navigator.clipboard.writeText(link)
    handleToastNotification("Link copied to clipboard!", "success", 3000)
  }

  const handleFilterLoad = async (id: string) => {
    handleToastNotification("Loading filter...", "info")
    setIsLoaded(false)
    const filterData = await api.getFilter(id)
    if (!filterData || !filterData.blocks) {
      handleToastNotification("Error loading filter", "error", 3000)
      return
    }
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
      <Container
        maxW={"1280px"}
        w={"100%"}
        minH={"100vh"}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        p={0}
      >
        {showToast && <Alert position={"absolute"} status={toastType} title={toastMessage} />}
        <VStack
          w={"100%"}
          maxW={"1280px"}
          h={"100%"}
          display={"flex"}
          flexDirection={"column"}
          flex={1}
          alignItems={"center"}
        >
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
                  {filterId && (
                    <MenuItem value="save-filter" onClick={saveFilterHandler}>
                      Save
                    </MenuItem>
                  )}
                  <MenuItem value="save-new-filter" onClick={createFilterHandler}>
                    Save as new
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

            <VStack w={"100%"}>
              {isLoaded && (
                <>
                  <Box w={"100%"} maxH="70vh" overflowY="auto" className="hide-scrollbar">
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

                  <Tooltip content="Add new filter rule" openDelay={100} positioning={{ placement: "top" }}>
                    <Button w={"100%"} onClick={addNewBlock}>
                      NEW FILTER RULE
                    </Button>
                  </Tooltip>
                </>
              )}
            </VStack>
          </Container>
        </VStack>
        <ConfirmationDialog open={clearDialogOpen} setOpen={setClearDialogOpen} handleFilterClear={handleFilterClear} />
        <Footer />
      </Container>
    </Provider>
  )
}

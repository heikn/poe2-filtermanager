import { AccordionValueChangeDetails, Box, Button, Center, Container, HStack, Input, VStack } from "@chakra-ui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import Block from "./Block"
import { parseBlockToFilterBlock, parseFilterFileIntoBlocks } from "./parser"
import { debounce } from "lodash"
import "./app.css"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { AiOutlineDrag } from "react-icons/ai"
import { BlockType } from "@/types"
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from "@/components/ui/accordion"
import { initialBlock } from "@/constants"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { Provider } from "./components/ui/provider"
import { Alert } from "./components/ui/alert"
import axios from "axios"
import { useParams } from "react-router-dom"

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

  // Load blocks from local storage if no id
 useEffect(() => {
    if(id) return
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

  // Fetch filter by ID from backend
  useEffect(() => {
    const getFilter = async () => {
      if (id) {
        handleToastNotification("Retrieving filter...", "info")
        try {
          const response = await axios.get(`http://localhost:3000/get-filter/${id}`)
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

  // Save filter
  const saveFilter = async () => {
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
        url: "http://localhost:3000/create-link",
        data: {
          filterName: filterName,
          blocks: JSON.stringify(blocks),
        },
      })
      const link = `${window.location.origin}/filter/${response.data.id}`
      await navigator.clipboard.writeText(link)
      handleToastNotification('Link copied to clipboard!', 'success', 3000);
      console.log("RESPONSE", response)
    } catch (err) {
      console.log("ERROR", err)
    }
  }

  return (
    <Provider>
      <Container minW={"dvw"} minH={"100vh"} display="flex" flexDirection="column" justifyContent="space-between" p={0}>
        {showToast && <Alert position={"absolute"} status={toastType} title={toastMessage} />}
        <VStack h={"100%"} display={"flex"} flexDirection={"column"} flex={1}>
          <Header />
          <Container>
            <Center flex={1} alignItems={"flex-start"}>
              <VStack>
                <HStack w={"100%"} justifyContent={"space-between"}>
                  <HStack>
                    <Button onClick={importFilter}>Import filter</Button>
                    <Button disabled={!fileHandle} onClick={saveFilter}>
                      Save filter
                    </Button>
                  </HStack>
                  <Button onClick={handleShareFilter}>Share filter</Button>
                  <HStack>
                    <Input
                      placeholder="Filter name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                    <Button disabled={blocks.length === 0 ? true : false} onClick={downloadHandler}>
                      Download filter
                    </Button>
                  </HStack>
                </HStack>
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
                    <Button w={"100%"} onClick={addNewBlock}>
                      NEW FILTER RULE
                    </Button>
                  </>
                )}
              </VStack>
            </Center>
          </Container>
        </VStack>
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

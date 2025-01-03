import { AccordionValueChangeDetails, Box, Button, Center, HStack, Input, VStack } from "@chakra-ui/react"
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
  const [blocks, setBlocks] = useState<BlockType[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [filterName, setFilterName] = useState("")
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null)
  
  // Load blocks from local storage
  useEffect(() => {
    const blocks = localStorage.getItem("blocks")
    const filterName = localStorage.getItem("filterName")
    if (blocks) {
      setBlocks(JSON.parse(blocks))
    }
    if (filterName) {
      setFilterName(filterName)
    }
    setIsLoaded(true)
  }, [])

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
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".filter"
        input.onchange = async (e: any) => {
          const file = e.target.files[0]
          const content = await file.text()
          const blocks = parseFilterFileIntoBlocks(content)
          setBlocks(blocks)
          setFilterName(file.name.replace(".filter", ""))
          setFileHandle(file)
        }
        input.click()
        return
      }
      const file = await handle.getFile()
      const content = await file.text()
      const blocks = parseFilterFileIntoBlocks(content)
      setBlocks(blocks)
      setFilterName(file.name.replace(".filter", ""))
      setFileHandle(handle)
    } catch (error) {
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

  return (
    <Provider>
      <VStack display={"flex"} flexDirection={"column"} minH={"100vh"}>
        <Header />
        <Center flex={1} alignItems={"flex-start"}>
          <VStack>
            <HStack>
              <Button onClick={importFilter}>Import filter</Button>
              <Button disabled={!fileHandle} onClick={saveFilter}>
                Save file
              </Button>
            </HStack>
            <HStack>
              <Input placeholder="Filter name" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
              <Button disabled={blocks.length === 0 ? true : false} onClick={downloadHandler}>Download filter</Button>
            </HStack>
            {isLoaded && (
              <Box w="80vw" maxH="70vh" overflowY="auto" border="1px solid gray" className="hide-scrollbar">
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
            )}
            <Button onClick={addNewBlock}>Add new filter block</Button>
          </VStack>
        </Center>
        <Footer />
      </VStack>
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
              variant={"enclosed"}
              collapsible
              w={"100%"}
              onValueChange={(e) => handleAccordionToggle(e, index)}
          
            >
              <AccordionItem value={`accordion-${index}`} borderWidth={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" position="relative">
                  <Box position="relative" {...provided.dragHandleProps} zIndex={1}>
                    <AiOutlineDrag size={24} cursor={"grab"} />
                  </Box>
                  <AccordionItemTrigger flex="1" bgColor={block.show ? showColor : hideColor}>
                    <Box>
                      {block.show ? "Show" : "Hide"} - {block.name}
                    </Box>
                  </AccordionItemTrigger>
                </Box>

                <AccordionItemContent>
                  <div ref={(el) => (contentRefs.current[index] = el)}>
                    <VStack>
                      <Block index={index} block={block} updateBlock={updateBlock} />
                      <Button w={"100%"} onClick={() => removeBlock(index)}>Remove</Button>
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

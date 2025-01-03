import { Box, Button, Center, HStack, Input, VStack } from "@chakra-ui/react"
import { useCallback, useEffect, useRef, useState } from "react"
import Block from "./Block"
import { parseBlockToFilterBlock, parseFilterFileIntoBlocks } from "./parser"
import { debounce } from "lodash"
import "./app.css"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { AiOutlineDrag } from "react-icons/ai"

import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "@/components/ui/accordion"

export interface BlockType {
  name: string
  show: boolean
  class: {
    value: string
    exact: boolean
  }
  basetype: {
    value: string
    exact: boolean
  }
  itemRarity: {
    normal: boolean
    magic: boolean
    rare: boolean
    unique: boolean
  }
  itemLevel: number[]
  quality: number[]
  text: {
    color: string
    backgroundColor: string
    borderColor: string
    fontSize: number[]
  }
  minimapIcon: {
    show: boolean
    icon: string
    color: string
    size: number[]
  }
  playEffect: {
    show: boolean
    color: string
    temporary: boolean
  }
  playAlertSound: {
    show: boolean
    sound: string
    volume: number[]
  }
}

const initialBlock: BlockType = {
  name: "New block",
  show: false,
  class: { value: "", exact: false },
  basetype: { value: "", exact: false },
  itemRarity: { normal: true, magic: true, rare: true, unique: true },
  itemLevel: [0, 100],
  quality: [0, 20],
  text: {
    color: "255 0 0 255",
    backgroundColor: "255 255 255 255",
    borderColor: "255 0 0 255",
    fontSize: [32],
  },
  minimapIcon: { show: false, icon: "", color: "", size: [1] },
  playEffect: { show: false, color: "", temporary: false },
  playAlertSound: { show: false, sound: "", volume: [150] },
}

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
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
    null
  )

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

  // Save blocks if they change
  useEffect(() => {
    if (isLoaded) {
      saveBlocksToLocalStorage()
    }
  }, [blocks, filterName])

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

  const updateBlock = useCallback(
    (index: number, updatedBlock: BlockType) => {
      setBlocks((prevBlocks) =>
        prevBlocks.map((block, i) =>
          i === index ? { ...block, ...updatedBlock } : block
        )
      )
    },
    [setBlocks]
  )

  const addNewBlock = useCallback(() => {
    setBlocks((prevBlocks) => [...prevBlocks, { ...initialBlock }])
  }, [setBlocks])

  const removeBlock = useCallback(
    (index: number) => {
      setBlocks((prevBlocks) => prevBlocks.filter((_, i) => i !== index))
    },
    [setBlocks]
  )

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const reorderedBlocks = Array.from(blocks)
    const [removed] = reorderedBlocks.splice(result.source.index, 1)
    reorderedBlocks.splice(result.destination.index, 0, removed)

    setBlocks(reorderedBlocks)
  }

  const saveBlocksToLocalStorage = useCallback(
    debounce(() => {
      localStorage.setItem("blocks", JSON.stringify(blocks))
      localStorage.setItem("filterName", filterName)
    }, 1000),
    [blocks, filterName]
  )

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
      filterBlocks = filterBlocks.trimEnd();
      await writable.write(filterBlocks)
      await writable.close()
      console.log("Filter saved successfully.")
    } catch (error) {
      console.error("Error saving filter:", error)
    }
  }

  const handleAccordionToggle = (index: number) => {
    setActiveIndex(index)
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <Center>
        <VStack>
          <HStack>
            <Button onClick={importFilter}>Import filter</Button>
            <Button disabled={!fileHandle} onClick={saveFilter}>
              Save file
            </Button>
          </HStack>
          <HStack>
            <Input
              placeholder="Filter name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            <Button
              onClick={() => {
                let filterBlocks = ""
                blocks.forEach((block) => {
                  const parsedBlock = parseBlockToFilterBlock(block)
                  filterBlocks += parsedBlock
                  filterBlocks += "\n"
                })
                filterBlocks = filterBlocks.trimEnd()
                saveStringAsFile(filterBlocks, `${filterName}.filter`)
              }}
            >
              Download filter
            </Button>
          </HStack>
          {isLoaded && (
            <Box
              w="80vw"
              maxH="70vh"
              overflowY="auto"
              border="1px solid gray"
              className="hide-scrollbar"
            >
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="blocks">
                  {(provided) => (
                    <Box {...provided.droppableProps} ref={provided.innerRef}>
                      {blocks.map((block, index) => (
                        <Draggable
                          key={index}
                          draggableId={index.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <AccordionRoot
                                variant={"enclosed"}
                                collapsible
                                w={"100%"}
                                onValueChange={(e) => {
                                  if (e.value[0] === `accordion-${index}`) {
                                    handleAccordionToggle(index)
                                  }
                                }}
                              >
                                <AccordionItem value={`accordion-${index}`}>
                                  <Box
                                    display="flex" // Make it a flex container
                                    justifyContent="space-between" // Ensure space between elements
                                    alignItems="center"
                                    position="relative" // Ensure relative positioning
                                  >
                                    <Box
                                      position="relative"
                                      {...provided.dragHandleProps} // Apply drag handle props here
                                      zIndex={1}
                                    >
                                      <AiOutlineDrag
                                        size={24}
                                        cursor={"grab"}
                                      />
                                    </Box>
                                    <AccordionItemTrigger
                                      backgroundColor={
                                        block.show ? "green.900" : "red.900"
                                      }
                                      flex="1" // Allow the trigger to take up available space
                                    >
                                      <Box>
                                        {block.show ? "Show" : "Hide"} -{" "}
                                        {block.name}
                                      </Box>
                                    </AccordionItemTrigger>
                                  </Box>

                                  <AccordionItemContent>
                                    <div
                                      ref={(el) =>
                                        (contentRefs.current[index] = el)
                                      }
                                    >
                                      <HStack>
                                        <Block
                                          index={index}
                                          block={block}
                                          updateBlock={updateBlock}
                                        />
                                        <Button
                                          onClick={() => removeBlock(index)}
                                        >
                                          Remove
                                        </Button>
                                      </HStack>
                                    </div>
                                  </AccordionItemContent>
                                </AccordionItem>
                              </AccordionRoot>
                            </div>
                          )}
                        </Draggable>
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
    </div>
  )
}

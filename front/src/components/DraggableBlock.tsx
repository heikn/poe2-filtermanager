import { BlockType } from "@/types"
import { AccordionValueChangeDetails, Box, Container, VStack } from "@chakra-ui/react"
import { Draggable } from "@hello-pangea/dnd"
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from "./ui/accordion"
import { AiOutlineDrag } from "react-icons/ai"
import Block from "@/Block"
import { Button } from "./ui/button"

export const DraggableBlock = ({
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
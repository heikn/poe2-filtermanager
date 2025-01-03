import { Box, Heading, Input, List, VStack, Text } from "@chakra-ui/react"
import itemClasses from "./assets/itemclasses.json"
import React, { useState } from "react"

export const ItemClasses: React.FC<{ handleItemSelect: (item: any, dataType: string) => void }> = ({ handleItemSelect }) => {
  const [filterText, setFilterText] = useState("")

  const filteredItemClasses = itemClasses.filter((itemClass: any) =>
    itemClass.Name.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <Box>
      <VStack align="stretch">
        <Heading size="lg">Item Classes</Heading>
        <Input placeholder="Filter item classes" value={filterText} onChange={(e) => setFilterText(e.target.value)} />
        <Box maxH={"60vh"}>
          <List.Root maxH={"60vh"} overflowY={"auto"} variant={"plain"}>
            {filteredItemClasses.map((itemClass: any) => {
              if (itemClass.Name) {
                return (
                  <List.Item key={itemClass._rid}>
                    <Text cursor={"pointer"} _hover={{ bg: "gray.500" }} onClick={() => handleItemSelect(itemClass, "itemClass")}>
                      {itemClass.Name}
                    </Text>
                  </List.Item>
                )
              }
            })}
          </List.Root>
        </Box>
      </VStack>
    </Box>
  )
}

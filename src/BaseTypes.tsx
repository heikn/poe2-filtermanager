import { Box, Heading, Input, List, VStack, Text } from "@chakra-ui/react"
import basetypes from "./assets/basetypes.json"
import React, { useState } from "react"


export const BaseTypes : React.FC<{handleItemSelect: (item: any, dataType: string)=>void}> = ({handleItemSelect}) => {
  const [filterText, setFilterText] = useState("")

  const filteredBasetypes = basetypes.filter(
    (basetype: any) => basetype.Name.toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <VStack align="stretch">
      <Heading size="lg">Item Classes</Heading>
      <Input placeholder="Filter item classes" value={filterText} onChange={(e) => setFilterText(e.target.value)} />
      <Box maxH={"60vh"}>
        <List.Root maxH={"60vh"} overflowY={"auto"} variant={"plain"}>
          {filteredBasetypes.map((basetype: any) => {
            if (basetype.Name) {
              return (
                <List.Item key={basetype.Id}>
                  <Text cursor={"pointer"} _hover={{ bg: "gray.500" }} onClick={() => handleItemSelect(basetype, "basetype")}>
                    {basetype.Name}
                  </Text>
                </List.Item>
              )
            }
          })}
        </List.Root>
      </Box>
    </VStack>
  )
}

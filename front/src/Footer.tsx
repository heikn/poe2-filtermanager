import { Container, VStack, Text, Link, HStack } from "@chakra-ui/react"
import { DrawerActionTrigger, DrawerBackdrop, DrawerBody, DrawerCloseTrigger, DrawerContent, DrawerFooter, DrawerHeader, DrawerRoot, DrawerTrigger } from "./components/ui/drawer"
import { Button } from "./components/ui/button"

export const Footer = () => {
  return (
    <Container minW={"100%"} textAlign="center" m={0} bg={"gray.500"}>
      <VStack>
        <HStack>
          <Link href="mailto:poe2filter@versus-gaming.eu">Contact</Link>
          <Text>poe2filter@versus-gaming.eu</Text>
          |
          <Text>Feedback</Text>
          |
          <HowToUseDrawer />
        </HStack>
        <Text>This is a fan-made site and is not affiliated with Grinding Gear Games in any way.</Text>
      </VStack>
    </Container>
  )
}

const HowToUseDrawer = () => {
  return(
    <DrawerRoot placement={"bottom"} size={'full'}>
      <DrawerBackdrop />
      <DrawerTrigger asChild>
        <Text cursor={"pointer"}>How to use</Text>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>How to use</DrawerHeader>
        <DrawerBody></DrawerBody>
        <DrawerFooter>
          <DrawerActionTrigger asChild>
            <Button>Close</Button>
          </DrawerActionTrigger>
        </DrawerFooter>
        <DrawerCloseTrigger />
      </DrawerContent>
    </DrawerRoot>
  )
}

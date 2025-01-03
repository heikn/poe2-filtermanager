import { Container, VStack, Text, Link, HStack } from "@chakra-ui/react"

export const Footer = () => {
  return (
    <Container maxW="container.lg" textAlign="center" mt={4} mb={4}>
      <VStack>
        <HStack>
          <Link href="mailto:poe2filter@versus-gaming.eu">Contact</Link>
          <Text>poe2filter@versus-gaming.eu</Text>
        </HStack>
        <Text>This is a fan-made site and is not affiliated with Grinding Gear Games in any way.</Text>
      </VStack>
    </Container>
  )
}

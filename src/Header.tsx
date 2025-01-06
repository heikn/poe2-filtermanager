import { Container, Heading } from "@chakra-ui/react"

export const Header = () => {
  return (
    <Container w={"dvw"}>
      <Heading as="h1" size="4xl" textAlign="center" mb={4}>
        PoE 2 Filter Manager
      </Heading>
    </Container>
  )
}

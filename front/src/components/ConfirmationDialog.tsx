import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"
import { Text } from "@chakra-ui/react"
import { Button } from "./ui/button"

export const ConfirmationDialog = ({
  open,
  setOpen,
  handleFilterClear,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleFilterClear: () => void
}) => {
  return (
    <DialogRoot lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New filter</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>Are you sure you want to create a new filter?</Text>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">No</Button>
          </DialogActionTrigger>
          <Button onClick={handleFilterClear}>Yes</Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
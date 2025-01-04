import { Container, HStack, Input, VStack, parseColor, Heading } from "@chakra-ui/react"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import React, { memo } from "react"

import {
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerEyeDropper,
  ColorPickerRoot,
  ColorPickerSliders,
  ColorPickerSwatchGroup,
  ColorPickerSwatchTrigger,
  ColorPickerTrigger,
} from "@/components/ui/color-picker"

import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import { BlockType, BlockProps } from "@/types"
import { alertSounds, colorPalette, minimapIcons } from "@/constants"
import { Button } from "./components/ui/button"

import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ItemClasses } from "./ItemClasses"
import { BaseTypes } from "./BaseTypes"
import { toLower } from "lodash"

const Block: React.FC<BlockProps> = ({ index, block, updateBlock }) => {
  const playSound = (soundFile: string) => {
    const audio = new Audio(`/assets/sounds/${soundFile}`)
    audio.play().catch((e) => console.error(e))
  }

  const handleItemSelect = (item: any, dataType: string) => {
    switch (dataType) {
      case "basetype":
        updateBlock(index, {
          ...block,
          basetype: { value: block.basetype.value + ` "${item.Name}"`, exact: block.basetype.exact },
        })
        break
      case "itemClass":
        updateBlock(index, {
          ...block,
          class: { value: block.class.value + ` "${item.Name}"`, exact: block.class.exact },
        })
        break
    }
  }

  return (
    <Container>
      <Input
        placeholder="Block name"
        value={block.name}
        onChange={(e) => {
          updateBlock(index, { ...block, name: e.target.value })
        }}
      />
      <Switch
        my={2}
        checked={block.show}
        onCheckedChange={(e) => {
          updateBlock(index, { ...block, show: e.checked })
        }}
      >
        {block.show ? "Show" : "Hide"}
      </Switch>
      <HStack mt={1}>
        <Input
          placeholder="Class"
          value={block.class.value}
          onChange={(e) => {
            updateBlock(index, {
              ...block,
              class: { value: e.target.value, exact: block.class.exact },
            })
          }}
        />
        <Checkbox
          checked={block.class.exact}
          onCheckedChange={(e) => {
            updateBlock(index, {
              ...block,
              class: { value: block.class.value, exact: !!e.checked },
            })
          }}
        >
          Exact?
        </Checkbox>
        <DataDrawer dataType={"itemClass"} buttonLabel={"Item classes"} handleItemSelect={handleItemSelect} />
      </HStack>
      <HStack mt={1}>
        <Input
          placeholder="Basetype"
          value={block.basetype.value}
          onChange={(e) => {
            updateBlock(index, {
              ...block,
              basetype: { value: e.target.value, exact: block.basetype.exact },
            })
          }}
        />
        <Checkbox
          checked={block.basetype.exact}
          onCheckedChange={(e) => {
            updateBlock(index, {
              ...block,
              basetype: { value: block.basetype.value, exact: !!e.checked },
            })
          }}
        >
          Exact?
        </Checkbox>
        <DataDrawer dataType={"basetype"} buttonLabel={"Basetypes"} handleItemSelect={handleItemSelect} />
      </HStack>
      <Heading size="sm" mt={4}>
        Item Rarity
      </Heading>
      <HStack mt={1}>
        <Checkbox
          checked={block.itemRarity.normal}
          onCheckedChange={(e) => {
            updateBlock(index, {
              ...block,
              itemRarity: { ...block.itemRarity, normal: !!e.checked },
            })
          }}
        >
          Normal
        </Checkbox>
        <Checkbox
          checked={block.itemRarity.magic}
          onCheckedChange={(e) => {
            updateBlock(index, {
              ...block,
              itemRarity: { ...block.itemRarity, magic: !!e.checked },
            })
          }}
          color={"blue.600"}
        >
          Magic
        </Checkbox>
        <Checkbox
          checked={block.itemRarity.rare}
          onCheckedChange={(e) => {
            updateBlock(index, {
              ...block,
              itemRarity: { ...block.itemRarity, rare: !!e.checked },
            })
          }}
          color={"yellow.400"}
        >
          Rare
        </Checkbox>
        <Checkbox
          checked={block.itemRarity.unique}
          onCheckedChange={(e) => {
            updateBlock(index, {
              ...block,
              itemRarity: { ...block.itemRarity, unique: !!e.checked },
            })
          }}
          color={"orange.600"}
        >
          Unique
        </Checkbox>
      </HStack>
      <HStack mt={4}>
        <Slider
          width={"100%"}
          label={`Itemlevel ${block.itemLevel[0]} - ${block.itemLevel[1]}`}
          value={block.itemLevel}
          onValueChange={(e) => {
            updateBlock(index, { ...block, itemLevel: e.value })
          }}
        />
      </HStack>
      <Slider
        width={"100%"}
        label={`Quality ${block.quality[0]} - ${block.quality[1]}`}
        value={block.quality}
        step={1}
        min={0}
        max={20}
        onValueChange={(e) => {
          updateBlock(index, { ...block, quality: e.value })
        }}
      />
      <Slider
        width={"100%"}
        label={`Sockets ${block.sockets[0]} - ${block.sockets[1]}`}
        value={block.sockets}
        step={1}
        min={0}
        max={5}
        onValueChange={(e) => {
          updateBlock(index, {
            ...block,
            sockets: e.value,
          })
        }}
      />
      {block.show && (
        <VStack mt={12}>
          <Container p={4} borderRadius={5}>
            <HStack w={"100%"} gap={4} alignItems={"flex-start"}>
              <HStack w={"100%"} gap={4} justifyContent={"space-between"}>
                <VStack alignItems={"flex-start"} gap={4}>
                  <Heading size="sm">Text</Heading>
                  <ColorPicker label={"TextColor"} block={block} index={index} updateBlock={updateBlock} />
                </VStack>
                <VStack alignItems={"center"} gap={4} justifyContent={"center"}>
                  <Heading size="sm">Background</Heading>
                  <ColorPicker label={"BackgroundColor"} block={block} index={index} updateBlock={updateBlock} />
                </VStack>
                <VStack alignItems={"center"} gap={4}>
                  <Heading size="sm">Border</Heading>
                  <ColorPicker label={"BorderColor"} block={block} index={index} updateBlock={updateBlock} />
                </VStack>
              </HStack>
              <Slider
                width={"100%"}
                label={`Font size ${block.text.fontSize}`}
                value={block.text.fontSize}
                step={1}
                min={18}
                max={45}
                onValueChange={(e) => {
                  updateBlock(index, {
                    ...block,
                    text: { ...block.text, fontSize: e.value },
                  })
                }}
              />
            </HStack>
            <HStack w={"100%"} justifyContent={"space-between"} gap={4} mt={4}>
              <Checkbox
                checked={block.minimapIcon.show}
                onCheckedChange={(e) => {
                  updateBlock(index, {
                    ...block,
                    minimapIcon: { ...block.minimapIcon, show: !!e.checked },
                  })
                }}
              >
                Minimap icon?
              </Checkbox>

              <Checkbox
                checked={block.playEffect.show}
                onCheckedChange={(e) => {
                  updateBlock(index, {
                    ...block,
                    playEffect: { ...block.playEffect, show: !!e.checked },
                  })
                }}
              >
                Beam?
              </Checkbox>

              <Checkbox
                checked={block.playAlertSound.show}
                onCheckedChange={(e) => {
                  updateBlock(index, {
                    ...block,
                    playAlertSound: {
                      ...block.playAlertSound,
                      show: !!e.checked,
                    },
                  })
                }}
              >
                Alert sound?
              </Checkbox>
            </HStack>
          </Container>
          {block.minimapIcon.show && (
            <HStack alignItems={"flex-start"} w={"100%"} justifyContent={"space-between"} gap={4} p={4}>
              <SelectRoot
                collection={minimapIcons}
                size="sm"
                width="320px"
                value={[block.minimapIcon.icon]}
                onValueChange={(e) => {
                  updateBlock(index, {
                    ...block,
                    minimapIcon: { ...block.minimapIcon, icon: e.value[0] },
                  })
                }}
              >
                <SelectLabel>Minimap icon</SelectLabel>
                <SelectTrigger>
                  <SelectValueText placeholder="Select Icon" />
                </SelectTrigger>
                <SelectContent>
                  {minimapIcons.items.map((item) => (
                    <SelectItem key={item.value} item={item}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              <SelectRoot
                collection={colorPalette}
                size="sm"
                width="320px"
                value={[block.minimapIcon.color]}
                onValueChange={(e) => {
                  updateBlock(index, {
                    ...block,
                    minimapIcon: { ...block.minimapIcon, color: e.value[0] },
                  })
                }}
              >
                <SelectLabel>Icon color</SelectLabel>
                <SelectTrigger>
                  <SelectValueText placeholder="Select Color" />
                </SelectTrigger>
                <SelectContent>
                  {colorPalette.items.map((item) => (
                    <SelectItem key={item.value} item={item} backgroundColor={item.value} color={"black"}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              <Slider
                label={`Icon size ${block.minimapIcon.size[0] + 1}`}
                width={"100%"}
                defaultValue={block.minimapIcon.size || 0}
                step={1}
                min={0}
                max={2}
                onValueChange={(e) => {
                  updateBlock(index, {
                    ...block,
                    minimapIcon: { ...block.minimapIcon, size: e.value },
                  })
                }}
              />
            </HStack>
          )}
          {block.playEffect.show && (
            <HStack w={"100%"} gap={4} p={4}>
              <SelectRoot
                collection={colorPalette}
                size="sm"
                width="320px"
                value={[block.playEffect.color]}
                onValueChange={(e) => {
                  updateBlock(index, {
                    ...block,
                    playEffect: { ...block.playEffect, color: e.value[0] },
                  })
                }}
              >
                <SelectLabel>Beam color</SelectLabel>
                <SelectTrigger>
                  <SelectValueText placeholder="Select Color" />
                </SelectTrigger>
                <SelectContent>
                  {colorPalette.items.map((item) => (
                    <SelectItem key={item.value} item={item} backgroundColor={item.value} color={"black"}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              <Checkbox
                checked={block.playEffect.temporary}
                onCheckedChange={(e) => {
                  updateBlock(index, {
                    ...block,
                    playEffect: {
                      ...block.playEffect,
                      temporary: !!e.checked,
                    },
                  })
                }}
              >
                Temporary?
              </Checkbox>
            </HStack>
          )}
          {block.playAlertSound.show && (
            <HStack w={"100%"} justifyContent={"space-between"} gap={4} p={4}>
              <SelectRoot
                collection={alertSounds}
                size="sm"
                width="320px"
                value={[block.playAlertSound.sound]}
                onValueChange={(e) => {
                  playSound(e.items[0].file)
                  updateBlock(index, {
                    ...block,
                    playAlertSound: {
                      ...block.playAlertSound,
                      sound: e.value[0],
                    },
                  })
                }}
              >
                <SelectLabel>Select alert sound</SelectLabel>
                <SelectTrigger>
                  <SelectValueText placeholder="Select Sound" />
                </SelectTrigger>
                <SelectContent>
                  {alertSounds.items.map((item) => (
                    <SelectItem key={item.value} item={item}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              <Slider
                label={`Volume ${block.playAlertSound.volume}`}
                width={"100%"}
                defaultValue={block.playAlertSound.volume || 0}
                min={0}
                max={300}
                onValueChange={(e) => {
                  updateBlock(index, {
                    ...block,
                    playAlertSound: {
                      ...block.playAlertSound,
                      volume: e.value,
                    },
                  })
                }}
              />
            </HStack>
          )}
        </VStack>
      )}
    </Container>
  )
}

const ColorPicker = (props: {
  label: string
  block: BlockType
  index: number
  updateBlock: (index: number, block: BlockType) => void
}) => {
  let r, g, b, a
  switch (props.label) {
    case "TextColor":
      ;[r, g, b, a] = props.block.text.color.split(" ").map(Number)
      break
    case "BackgroundColor":
      ;[r, g, b, a] = props.block.text.backgroundColor.split(" ").map(Number)
      break
    case "BorderColor":
      ;[r, g, b, a] = props.block.text.borderColor.split(" ").map(Number)
      break
  }
  const colorString = `rgba(${r}, ${g}, ${b}, ${a! / 255})`
  const [color, setColor] = React.useState(colorString)
  const [favoriteColors, setFavoriteColors] = React.useState<{ value: string }[]>([])
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)

  React.useEffect(() => {
    if (isPickerOpen) {
      const storedFavoriteColors = localStorage.getItem("favoriteColors")
      if (storedFavoriteColors) {
        setFavoriteColors(JSON.parse(storedFavoriteColors).items)
      }
    }
  }, [isPickerOpen])

  const handleAddToFavorites = () => {
    const newFavoriteColors = [...favoriteColors, { value: color }]
    setFavoriteColors(newFavoriteColors)
    localStorage.setItem("favoriteColors", JSON.stringify({ items: newFavoriteColors }))
  }

  const handleRemoveFromFavorites = () => {
    const newFavoriteColors = favoriteColors.filter((item) => item.value !== color)
    setFavoriteColors(newFavoriteColors)
    localStorage.setItem("favoriteColors", JSON.stringify({ items: newFavoriteColors }))
  }

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    switch (props.label) {
      case "TextColor":
        props.updateBlock(props.index, {
          ...props.block,
          text: {
            ...props.block.text,
            color: parseColorString(newColor),
          },
        })
        break
      case "BackgroundColor":
        props.updateBlock(props.index, {
          ...props.block,
          text: {
            ...props.block.text,
            backgroundColor: parseColorString(newColor),
          },
        })
        break
      case "BorderColor":
        props.updateBlock(props.index, {
          ...props.block,
          text: {
            ...props.block.text,
            borderColor: parseColorString(newColor),
          },
        })
        break
    }
  }

  return (
    <ColorPickerRoot
      defaultValue={parseColor(colorString)}
      onValueChangeEnd={(e) => handleColorChange(e.valueAsString)}
      maxW="200px"
      onOpenChange={(e) => setIsPickerOpen(e.open)}
    >
      <ColorPickerControl>
        <ColorPickerTrigger />
      </ColorPickerControl>
      <ColorPickerContent>
        <ColorPickerArea />
        <HStack>
          <ColorPickerEyeDropper />
          <ColorPickerSliders />
        </HStack>
        <ColorPickerSwatchGroup>
          {favoriteColors.map((item) => (
            <ColorPickerSwatchTrigger
              swatchSize={"4.5"}
              key={item.value}
              value={toLower(item.value)}
              onClick={() => handleColorChange(item.value)}
            />
          ))}
        </ColorPickerSwatchGroup>
        <HStack>
          <Button size={"xs"} onClick={handleAddToFavorites}>
            Add to favorites
          </Button>
          <Button size={"xs"} onClick={handleRemoveFromFavorites}>
            Remove
          </Button>
        </HStack>
      </ColorPickerContent>
    </ColorPickerRoot>
  )
}

const DataDrawer: React.FC<{
  dataType: string
  buttonLabel: string
  handleItemSelect: (item: any, dataType: string) => void
}> = ({ dataType, buttonLabel, handleItemSelect }) => {
  return (
    <DrawerRoot>
      <DrawerBackdrop />
      <DrawerTrigger asChild>
        <Button w={24}>{buttonLabel}</Button>
      </DrawerTrigger>
      <DrawerContent offset="4" rounded="md">
        <DrawerHeader>
          <DrawerTitle>{buttonLabel}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          {dataType === "basetype" ? (
            <BaseTypes handleItemSelect={handleItemSelect} />
          ) : (
            <ItemClasses handleItemSelect={handleItemSelect} />
          )}
        </DrawerBody>
        <DrawerFooter>
          <DrawerActionTrigger asChild>
            <Button variant="outline">Close</Button>
          </DrawerActionTrigger>
        </DrawerFooter>
        <DrawerCloseTrigger />
      </DrawerContent>
    </DrawerRoot>
  )
}

// Remove rgba and brackets from color string
const parseColorString = (color: string) => {
  const rgba = color.match(/rgba?\((\d+), (\d+), (\d+),? ?(\d?.?\d+)?\)/)
  if (rgba) {
    const r = parseInt(rgba[1])
    const g = parseInt(rgba[2])
    const b = parseInt(rgba[3])
    const a = rgba[4] ? Math.round(parseFloat(rgba[4]) * 255) : 255
    return `${r} ${g} ${b} ${a}`
  }
  return "0 0 0 255"
}

export default memo(Block)

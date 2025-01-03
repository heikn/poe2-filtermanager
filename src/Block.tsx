import {
  Container,
  HStack,
  Input,
  VStack,
  parseColor,
  createListCollection,
  Heading,
} from "@chakra-ui/react"
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
import { BlockType } from "./App"

interface BlockProps {
  block: BlockType
  index: number
  updateBlock: (index: number, block: BlockType) => void
}

const minimapIcons = createListCollection({
  items: [
    { value: "circle", label: "Circle" },
    { value: "diamond", label: "Diamond" },
    { value: "hexagon", label: "Hexagon" },
    { value: "square", label: "Square" },
    { value: "star", label: "Star" },
    { value: "triangle", label: "Triangle" },
    { value: "cross", label: "Cross" },
    { value: "moon", label: "Moon" },
    { value: "raindrop", label: "Raindrop" },
    { value: "kite", label: "Kite" },
    { value: "pentagon", label: "Pentagon" },
    { value: "upsideDownHouse", label: "Upside Down House" },
  ],
})

const alertSounds = createListCollection({
  items: [
    { value: "alert1", label: "Alert 1", file: "AlertSound_01.wav" },
    { value: "alert2", label: "Alert 2", file: "AlertSound_02.wav" },
    { value: "alert3", label: "Alert 3", file: "AlertSound_03.wav" },
    { value: "alert4", label: "Alert 4", file: "AlertSound_04.wav" },
    { value: "alert5", label: "Alert 5", file: "AlertSound_05.wav" },
    { value: "alert6", label: "Alert 6", file: "AlertSound_06.wav" },
    { value: "alert7", label: "Alert 7", file: "AlertSound_07.wav" },
    { value: "alert8", label: "Alert 8", file: "AlertSound_08.wav" },
    { value: "alert9", label: "Alert 9", file: "AlertSound_09.wav" },
    { value: "alert10", label: "Alert 10", file: "AlertSound_10.wav" },
    { value: "alert11", label: "Alert 11", file: "AlertSound_11.wav" },
    { value: "alert12", label: "Alert 12", file: "AlertSound_12.wav" },
    { value: "alert13", label: "Alert 13", file: "AlertSound_13.wav" },
    { value: "alert14", label: "Alert 14", file: "AlertSound_14.wav" },
    { value: "alert15", label: "Alert 15", file: "AlertSound_15.wav" },
    { value: "alert16", label: "Alert 16", file: "AlertSound_16.wav" },
  ],
})

const colorPalette = createListCollection({
  items: [
    { value: "red", label: "Red" },
    { value: "green", label: "Green" },
    { value: "blue", label: "Blue" },
    { value: "brown", label: "Brown" },
    { value: "white", label: "White" },
    { value: "yellow", label: "Yellow" },
    { value: "cyan", label: "Cyan" },
    { value: "grey", label: "Grey" },
    { value: "orange", label: "Orange" },
    { value: "pink", label: "Pink" },
    { value: "purple", label: "Purple" },
  ],
})

const Block: React.FC<BlockProps> = ({ index, block, updateBlock }) => {

  const playSound = (soundFile: string) => {
    const audio = new Audio(`/assets/sounds/${soundFile}`)
    audio.play().catch((e) => console.error(e))
  }

  return (
    <Container

    >
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
      {block.show && (
        <VStack mt={12}>
          <Container backgroundColor={"gray.900"} p={4} borderRadius={5}>
            <HStack w={"100%"} gap={4} alignItems={"flex-start"}>
              <HStack w={"100%"} gap={4} justifyContent={"space-between"}>
                <VStack alignItems={"flex-start"} gap={4}>
                  <Heading size="sm">Text</Heading>
                  <ColorPicker
                    label={"TextColor"}
                    block={block}
                    index={index}
                    updateBlock={updateBlock}
                  />
                </VStack>
                <VStack alignItems={"center"} gap={4} justifyContent={"center"}>
                  <Heading size="sm">Background</Heading>
                  <ColorPicker
                    label={"BackgroundColor"}
                    block={block}
                    index={index}
                    updateBlock={updateBlock}
                  />
                </VStack>
                <VStack alignItems={"center"} gap={4}>
                  <Heading size="sm">Border</Heading>
                  <ColorPicker
                    label={"BorderColor"}
                    block={block}
                    index={index}
                    updateBlock={updateBlock}
                  />
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
            <HStack
              alignItems={"flex-start"}
              w={"100%"}
              justifyContent={"space-between"}
              gap={4}
              backgroundColor={"gray.900"}
              p={4}
            >
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
                    <SelectItem
                      key={item.value}
                      item={item}
                      backgroundColor={item.value}
                      color={"black"}
                    >
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
            <HStack w={"100%"} gap={4} backgroundColor={"gray.900"} p={4}>
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
                    <SelectItem
                      key={item.value}
                      item={item}
                      backgroundColor={item.value}
                      color={"black"}
                    >
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
            <HStack
              w={"100%"}
              justifyContent={"space-between"}
              gap={4}
              backgroundColor={"gray.900"}
              p={4}
            >
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
  return (
    <ColorPickerRoot
      defaultValue={parseColor(colorString)}
      onValueChangeEnd={(e) => {
        switch (props.label) {
          case "TextColor":
            props.updateBlock(props.index, {
              ...props.block,
              text: {
                ...props.block.text,
                color: parseColorString(e.valueAsString),
              },
            })
            break
          case "BackgroundColor":
            props.updateBlock(props.index, {
              ...props.block,
              text: {
                ...props.block.text,
                backgroundColor: parseColorString(e.valueAsString),
              },
            })
            break
          case "BorderColor":
            props.updateBlock(props.index, {
              ...props.block,
              text: {
                ...props.block.text,
                borderColor: parseColorString(e.valueAsString),
              },
            })
            break
        }
      }}
      maxW="200px"
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
      </ColorPickerContent>
    </ColorPickerRoot>
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
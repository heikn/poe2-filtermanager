import { BlockType } from "@/types"

export const parseBlockToFilterBlock = (block: BlockType) => {
  let filterBlock = ""
  if (block.name) filterBlock += `# ${block.name}\n`
  filterBlock += block.show ? `Show\n` : `Hide\n`
  if (block.class.value) {
    filterBlock += "Class"
    filterBlock += block.class.exact ? " == " : " = "
    filterBlock += block.class.value
    filterBlock += "\n"
  }
  if (block.basetype.value) {
    filterBlock += "BaseType"
    filterBlock += block.basetype.exact ? " == " : " = "
    filterBlock += block.basetype.value
    filterBlock += "\n"
  }
  if (
    block.itemRarity.normal ||
    block.itemRarity.magic ||
    block.itemRarity.rare ||
    block.itemRarity.unique
  ) {
    filterBlock += "Rarity ="
    filterBlock += block.itemRarity.normal ? " Normal" : ""
    filterBlock += block.itemRarity.magic ? " Magic" : ""
    filterBlock += block.itemRarity.rare ? " Rare" : ""
    filterBlock += block.itemRarity.unique ? " Unique" : ""
    filterBlock += "\n"
  }
  if (block.itemLevel[0] === block.itemLevel[1]) {
    filterBlock += "ItemLevel == "
    filterBlock += block.itemLevel[0]
    filterBlock += "\n"
  } else {
    if (block.itemLevel[0] !== 0) {
      filterBlock += "ItemLevel >= "
      filterBlock += block.itemLevel[0]
      filterBlock += "\n"
    }
    if (block.itemLevel[1] !== 100) {
      filterBlock += "ItemLevel <= "
      filterBlock += block.itemLevel[1]
      filterBlock += "\n"
    }
  }
  if (block.quality[0] === block.quality[1]) {
    filterBlock += "Quality == "
    filterBlock += block.quality[0]
    filterBlock += "\n"
  } else {
    if (block.quality[0] !== 0) {
      filterBlock += "Quality >= "
      filterBlock += block.quality[0]
      filterBlock += "\n"
    }
    if (block.quality[1] !== 20) {
      filterBlock += "Quality <= "
      filterBlock += block.quality[1]
      filterBlock += "\n"
    }
  }
  if (!block.show) return filterBlock
  filterBlock += "SetTextColor"
  filterBlock += block.text.color ? ` ${block.text.color}` : ""
  filterBlock += "\n"
  filterBlock += "SetBackgroundColor"
  filterBlock += block.text.backgroundColor
    ? ` ${block.text.backgroundColor}`
    : ""
  filterBlock += "\n"
  filterBlock += "SetBorderColor"
  filterBlock += block.text.borderColor ? ` ${block.text.borderColor}` : ""
  filterBlock += "\n"
  filterBlock += "SetFontSize"
  filterBlock += block.text.fontSize[0] ? ` ${block.text.fontSize[0]}` : ""
  filterBlock += "\n"

  if (block.minimapIcon.show) {
    filterBlock += `MinimapIcon ${block.minimapIcon.size[0]} ${block.minimapIcon.color} ${block.minimapIcon.icon} \n`
  }
  if (block.playEffect.show) {
    filterBlock += `PlayEffect ${block.playEffect.color}`
    if (block.playEffect.temporary) {
      filterBlock += " Temp"
    }
    filterBlock += "\n"
  }
  if (block.playAlertSound.show) {
    filterBlock += `PlayAlertSound ${block.playAlertSound.sound.replace(
      "alert",
      ""
    )} ${block.playAlertSound.volume[0]}\n`
  }
  return filterBlock
}

// Go through the filter file and parse it into blocks
export const parseFilterFileIntoBlocks = (filterFile: string): BlockType[] => {
  const blocks = filterFile.split(/\r?\n\r?\n|\r\r|\n\n/)
  // Check if last block is empty
  if (blocks[blocks.length - 1] === "") {
    blocks.pop()
  }

  const parsedBlocks: BlockType[] = []

  blocks.forEach((block) => {
    const lines = block.split("\n")
    const newBlock: BlockType = {
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
      playAlertSound: { show: false, sound: "", volume: [100] },
    }
    let hasShowHide = false
    lines.forEach((line) => {
      if (line.startsWith("#")) {
        const parts = line.split(" ")
        const name = parts.slice(1).join(" ")
        newBlock.name = name
      } else if (line.includes("Show")) {
        newBlock.show = true
        hasShowHide = true
      } else if (line.includes("Hide")) {
        newBlock.show = false
        hasShowHide = true
      } else if (line.includes("Class")) {
        const parts = line.split(" ")
        const value = parts.slice(2).join(" ")
        const exact = line.includes("==")
        newBlock.class = { value, exact }
      } else if (line.includes("BaseType")) {
        const parts = line.split(" ")
        const value = parts.slice(2).join(" ")
        const exact = line.includes("==")
        newBlock.basetype = { value, exact }
      } else if (line.includes("Rarity")) {
        newBlock.itemRarity = {
          normal: line.includes("Normal"),
          magic: line.includes("Magic"),
          rare: line.includes("Rare"),
          unique: line.includes("Unique"),
        }
      } else if (line.includes("ItemLevel")) {
        const value = parseInt(line.split(" ")[2])
        if (line.includes(">=")) newBlock.itemLevel = [value, 100]
        else if (line.includes(">")) newBlock.itemLevel = [value + 1, 100]
        else if (line.includes("<=")) newBlock.itemLevel = [0, value]
        else if (line.includes("<")) newBlock.itemLevel = [0, value - 1]
        else if (line.includes("==")) newBlock.itemLevel = [value, value]
      } else if (line.includes("Quality")) {
        const value = parseInt(line.split(" ")[2])
        if (line.includes(">=")) newBlock.quality = [value, 20]
        else if (line.includes(">")) newBlock.quality = [value + 1, 20]
        else if (line.includes("<=")) newBlock.quality = [0, value]
        else if (line.includes("<")) newBlock.quality = [0, value - 1]
        else if (line.includes("==")) newBlock.quality = [value, value]
      } else if (line.includes("SetTextColor")) {
        const firstSpaceIndex = line.indexOf(" ")
        newBlock.text.color = line.substring(firstSpaceIndex + 1)
      } else if (line.includes("SetBackgroundColor")) {
        const firstSpaceIndex = line.indexOf(" ")
        newBlock.text.backgroundColor = line.substring(firstSpaceIndex + 1)
      } else if (line.includes("SetBorderColor")) {
        const firstSpaceIndex = line.indexOf(" ")
        newBlock.text.borderColor = line.substring(firstSpaceIndex + 1)
      } else if (line.includes("SetFontSize")) {
        newBlock.text.fontSize = [parseInt(line.split(" ")[1])]
      } else if (line.includes("MinimapIcon")) {
        const size = parseInt(line.split(" ")[1])
        const color = line.split(" ")[2]
        const icon = line.split(" ")[3]
        newBlock.minimapIcon = { show: true, size: [size], color, icon }
      } else if (line.includes("PlayEffect")) {
        const color = line.split(" ")[1]
        const temporary = line.includes("Temp")
        newBlock.playEffect = { show: true, color, temporary }
      } else if (line.includes("PlayAlertSound")) {
        const sound = line.split(" ")[1]
        const alertSound = "alert" + sound
        const volume = parseInt(line.split(" ")[2])
        newBlock.playAlertSound = {
          show: true,
          sound: alertSound,
          volume: [volume],
        }
      }
    })
    if (!hasShowHide) {
      console.warn("Skipping block without 'Show' or 'Hide':", block);
      return
    }
    parsedBlocks.push(newBlock)
  })
  return parsedBlocks
}

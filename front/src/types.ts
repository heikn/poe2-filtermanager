export interface BlockType {
  name: string
  show: boolean
  class: {
    value: string
    exact: boolean
  }
  basetype: {
    value: string
    exact: boolean
  }
  itemRarity: {
    normal: boolean
    magic: boolean
    rare: boolean
    unique: boolean
  }
  itemLevel: number[]
  quality: number[]
  sockets: number[]
  areaLevel: number[]
  text: {
    color: string
    backgroundColor: string
    borderColor: string
    fontSize: number[]
  }
  minimapIcon: {
    show: boolean
    icon: string
    color: string
    size: number[]
  }
  playEffect: {
    show: boolean
    color: string
    temporary: boolean
  }
  playAlertSound: {
    show: boolean
    sound: string
    volume: number[]
  }
}

export interface BlockProps {
  block: BlockType
  index: number
  updateBlock: (index: number, block: BlockType) => void
}

export interface Filter {
  id: string
  filter_name: string
  blocks?: BlockType[]
  user_token?: string
  created_at?: string
}
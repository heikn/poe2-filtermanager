import { BlockType } from "@/types";
import { createListCollection } from "@chakra-ui/react";

export const initialBlock: BlockType = {
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
  playAlertSound: { show: false, sound: "", volume: [150] },
}

export const minimapIcons = createListCollection({
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

export const alertSounds = createListCollection({
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

export const colorPalette = createListCollection({
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
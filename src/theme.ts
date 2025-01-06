import { createSystem, defaultConfig, defineRecipe } from "@chakra-ui/react"

const buttonRecipe = defineRecipe({
  base: {
    display: "flex",
  },
  variants: {
    visual: {
      solid: {},
      outline: { borderWidth: "1px", borderColor: "red.200" },
    },
    size: {
      sm: { padding: "2", fontSize: "12px" },
      md: { padding: "3", fontSize: "16px" },
      lg: { padding: "4", fontSize: "24px" },
    },
  },
  defaultVariants: {
    visual: "solid",
    size: "md",
  }
})

const inputRecipe = defineRecipe({
  base: {
    display: "flex",
  },
  variants: {
    visual: {
      solid: {borderWidth: "2px", borderColor: "colorPalette.200"},
      outline: { borderWidth: "1px", borderColor: "red.200" },
    },
    size: {
      sm: {fontSize: "12px" },
      md: { fontSize: "16px" },
      lg: { fontSize: "24px" },
    },
  },
  defaultVariants: {
    visual: "solid",
    size: "md",
  }
})

const checkboxRecipe = defineRecipe({
  base: {
    display: "flex",
  },
  variants: {
    visual: {
      solid: {borderWidth: "2px", borderColor: "colorPalette.200"},
    },
  },
  defaultVariants: {
    visual: "solid",
  }
})

const config = {
  theme: {
    tokens: {
      fonts: {
        body: {value: "system-ui"},
        heading: {value: "system-ui"},
      },
    },
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
      checkbox: checkboxRecipe,
    }
  },
  globalCss: {
    html: {
      colorPalette: "gray",
    },
  }
}

export const system = createSystem(defaultConfig, config)
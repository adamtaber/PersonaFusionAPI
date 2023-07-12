import { Item } from "../graphql-types";

export const isItem = (input: any): input is Item => {
  const item = (input.itemId !== undefined) &&
               (input.name !== undefined) &&
               (input.description !== undefined)
  return item
}

export const isItemArray = (input: any): input is Array<Item> => {
  const initLength = input.length
  const filter = input.filter(isItem)
  return initLength === filter.length
}
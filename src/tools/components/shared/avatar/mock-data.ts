import { HISTORICAL_PERSONAS } from '@/tools/shared/seeds'

const commentsTwitter = [
  'Hilarious!',
  'Miau miau 🐱',
  "I can't stop laughing",
  "I'm dying 😂",
  'This is too good',
  "I'm crying",
  "I can't even",
  'This is too much',
  "I'm in tears",
  "I can't breathe",
  'Cat content 🐱',
  'Cats are the best',
]

const namesList = HISTORICAL_PERSONAS.slice(10, 15)
const namesTwitter = HISTORICAL_PERSONAS.slice(10, 14)
const namesSuggested = HISTORICAL_PERSONAS.slice(20, 24)
const namesShared = HISTORICAL_PERSONAS.slice(28, 36)

export const nameProfile = HISTORICAL_PERSONAS[6]
export const nameInstagram = HISTORICAL_PERSONAS[14]
export const nameUpload = HISTORICAL_PERSONAS[8]
export const nameUploadLikes = HISTORICAL_PERSONAS.slice(30, 35)
export const nameSample = HISTORICAL_PERSONAS.slice(0, 10)

export const dataList = namesList.map((name: string, index) => ({
  name: name,
  email: `@${name.toLowerCase().split(' ')[0]}`,
  status: index % 2 === 0,
  time: `${(index * 7 + 3) % 50} min`,
}))

export const dataTwitter = namesTwitter.map((name: string, index) => ({
  name: name,
  handle: `@${name.toLowerCase().split(' ')[0]}`,
  tweet: commentsTwitter[index % commentsTwitter.length],
  time: `${(index * 11 + 5) % 50}m`,
}))

export const dataSuggested = namesSuggested.map((name: string) => ({
  name: `${name.split(' ')[0]}`,
}))

export const dataShared = namesShared.map((name: string, index) => ({
  name: `${name.split(' ')[0]}`,
  role: `@${name.split(' ')[0]}${index % 10}`,
}))

export const playgroundMockupImages = {
  imgProfile: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  imgUpload: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop',
}

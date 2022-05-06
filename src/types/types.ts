export type Task = {
  _key: string
  _type: string
  complete: boolean
  title?: string
  userId?: string
  due?: string
}

export type User = {
  createdAt: string
  displayName: string
  email: string
  familyName: string
  givenName: string
  id: string
  imageUrl: string
  isCurrentUser: boolean
  middleName: string
  projectId: string
  provider: string
  sanityUserId: string
  updatedAt: string
}

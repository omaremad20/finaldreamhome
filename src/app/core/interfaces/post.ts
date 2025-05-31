export interface Post {
  docs: Doc[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: any
  nextPage: any
}
export interface Doc {
  _id: string
  job: string
  content: string
  image?: string
  userId: string
  createdAt: string
  updatedAt: string
  __v: number
  userName:string
}

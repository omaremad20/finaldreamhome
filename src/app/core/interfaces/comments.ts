export interface Comments {
  success: boolean
  data: commentData
}
export interface commentData {
  docs: DocComment[]
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

export interface DocComment {
  _id: string
  comment: string
  userId: userInfo
  postId: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface userInfo {
  _id: string
  firstName: string
  lastName: string
  email: string
  images: any
}

import { TagItem } from './TagItem'
export interface ImgItem {
  userId: string
  imgId: string
  createdAt: string
  name: string
  tags?: TagItem[]
  attachmentUrl?: string
  SK?: string
  PK?: string
  


}

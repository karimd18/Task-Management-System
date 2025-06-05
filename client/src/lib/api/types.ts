export type PublicUser = {
  id: string
  username: string
  email: string
}

export type AuthResponse = {
  token: string
  user: PublicUser
}


export type ErrorResponse = {
  statusCode: number
  message: string
  errorCode: string
  errors?: Record<string, string[]>
}

export type LoginDTO = {
  identifier: string
  password: string
}

export type RegisterDTO = {
  email: string
  username: string
  password: string
  confirmPassword: string
}

export type InvitationResponse = {
  id: string
  teamId: string
  teamName: string
  inviterUsername: string
  createdAt: string
  status: 'Pending' | 'Accepted' | 'Declined'
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export type Status = {
  id: string
  name: string
  createdAt: string
  teamId?: string
  createdBy: string
}

export type StatusCreateDTO = {
  name: string
  teamId?: string
}

export type StatusUpdateDTO = {
  name: string,
  teamId?: string
}

export type Task = {
  id: string
  title: string
  description?: string
  dueDate?: string
  isPersonal: boolean
  teamId?: string
  statusId: string
  status: Status
  createdBy: string
  createdAt: string
  assignedToUserId?: string
  assignedToUser?: PublicUser
}

export type TaskCreateDTO = {
  title: string
  description?: string
  dueDate?: string
  isPersonal: boolean
  teamId?: string
  statusId: string
  assignedToUserId?: string
}

export type TaskUpdateDTO = {
  title?: string
  description?: string
  dueDate?: string | null
  statusId?: string
  assignedToUserId?: string | null
}

export interface MemberDTO_GET {
  teamId: string;
  userId: string;
  role: "admin" | "member";
  userDetails: PublicUser;
}

export type Team = {
  id: string
  name: string
  description?: string
  createdAt: string
  createdBy: string
  members: Member[]
  statuses: Status[]
}

export type Member = {
  id: string
  teamId: string
  userId: string
  role: 'admin' | 'member'
  user: PublicUser
}

export type MemberUpdateDTO = {
  role: 'admin' | 'member'
}

export type TeamCreateDTO = {
  name: string
  description?: string
}

export type TeamUpdateDTO = {
  name: string
  description?: string
}

export type MemberInviteDTO = {
  identifier: string
  role: 'admin' | 'member'
}
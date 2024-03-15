import bcrypt from 'bcryptjs'
import fs from 'fs'
import { v4 as random } from 'uuid'
import { type UnitUser, type User, type Users } from './user.interface'

const users: Users = loadUsers()

function loadUsers(): Users {
  try {
    const data = fs.readFileSync('./users.json', 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.log(`Error: ${error}`)
    return {}
  }
}

function saveUsers(): void {
  try {
    fs.writeFileSync('./users.json', JSON.stringify(users), 'utf-8')
    console.log('User saved successfully!')
  } catch (error) {
    console.log(`Error: ${error}`)
  }
}

export const findAll = async (): Promise<UnitUser[]> => Object.values(users)

export const findOne = async (id: string): Promise<UnitUser> => users[id]

export const create = async (userData: UnitUser): Promise<UnitUser | null> => {
  let id = random()
  let checkUser = await findOne(id)

  while (checkUser) {
    id = random()
    checkUser = await findOne(id)
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(userData.password, salt)
  const user: UnitUser = {
    id,
    username: userData.username,
    email: userData.email,
    password: hashedPassword
  }

  users[id] = user

  saveUsers()

  return user
}

export const findByEmail = async (userEmail: string): Promise<UnitUser | undefined> => {
  const allUsers = await findAll()
  const getUser = allUsers.find(result => userEmail === result.email)
  return getUser
}

export const comparePassword = async (email: string, suppliedPassword: string): Promise<UnitUser | undefined> => {
  const user = await findByEmail(email)
  const decryptPassword = await bcrypt.compare(suppliedPassword, user?.password)

  if (!decryptPassword) {
    return
  }

  return user
}

export const update = async (id: string, updateValues: User): Promise<UnitUser | null> => {
  const userExists = await findOne(id)

  if (!userExists) {
    return null
  }

  if (updateValues.password) {
    const salt = await bcrypt.genSalt(10)
    const newPass = await bcrypt.hash(updateValues.password, salt)

    updateValues.password = newPass
  }

  users[id] = {
    ...userExists,
    ...updateValues
  }

  saveUsers()

  return users[id]
}

export const remove = async (id: string): Promise<null | void> => {
  const user = await findOne(id)

  if (!user) {
    return null
  }

  delete users[id]

  saveUsers()
}

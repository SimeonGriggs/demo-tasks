import React, {useCallback, useRef, useState} from 'react'
import {Box, Popover, Button, Avatar, Flex, TextInput} from '@sanity/ui'
import {randomKey} from '@sanity/util/content'
import {UserAvatar} from '@sanity/base/components'
import sanityClient from 'part:@sanity/base/client'

import {Task, User} from '../types/types'
import UserAssignmentMenu from './UserAssignmentMenu'

const client = sanityClient.withConfig({apiVersion: `2021-05-19`})

type TaskNewProps = {
  documentId: string
  taskCount: number
  userList: User[]
}

export default function TaskNew(props: TaskNewProps) {
  const {documentId, taskCount, userList} = props
  const taskId = `task.${documentId}`

  const [title, setTitle] = useState(``)
  const [userId, setUserId] = useState(``)
  const [mutating, setMutating] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const input = useRef<HTMLInputElement>()

  const handleSubmit = useCallback(
    async (e, newTitle, newUserId) => {
      if (!newTitle) {
        return
      }

      e.preventDefault()
      setMutating(true)

      const newTask: Task = {
        _type: `task`,
        _key: randomKey(12),
        complete: false,
      }

      if (newTitle) {
        newTask.title = newTitle
      }
      if (newUserId) {
        newTask.userId = newUserId
      }

      if (!taskCount) {
        await client.createIfNotExists({_id: taskId, _type: `sanity.task`, documentId})
      }

      client
        .patch(taskId)
        .setIfMissing({tasks: []})
        .insert(`after`, `tasks[-1]`, [newTask])
        .commit()
        .then(() => {
          setTitle(``)
          setUserId(``)
          setMutating(false)
          setAvatarOpen(false)

          if (input?.current) {
            input.current.focus()
          }
        })
        .catch((err) => {
          console.error(err)
        })
    },
    [taskId]
  )

  const onAssigneeAdd = useCallback((id) => {
    setUserId(id)
    setAvatarOpen(false)
    if (input?.current) {
      input.current.focus()
    }
  }, [])

  const onAssigneesClear = useCallback(() => {
    setUserId(``)
  }, [])

  const onAssigneeRemove = useCallback(() => {
    setUserId(``)
  }, [])

  return (
    <Flex items="center" gap={2}>
      <Popover
        content={
          <UserAssignmentMenu
            value={[]}
            userList={userList}
            onAdd={onAssigneeAdd}
            onClear={onAssigneesClear}
            onRemove={onAssigneeRemove}
            open={avatarOpen}
          />
        }
        padding={0}
        portal
        placement="right"
        open={avatarOpen}
      >
        <Button padding={1} mode="bleed" onClick={() => setAvatarOpen(!avatarOpen)}>
          {userId ? <UserAvatar size={1} userId={userId} /> : <Avatar size={1} />}
        </Button>
      </Popover>
      <Box flex={1}>
        <form onSubmit={(e) => handleSubmit(e, title, userId)}>
          <TextInput
            ref={input}
            placeholder="Add new task..."
            onChange={(event) => setTitle(event.currentTarget.value)}
            onBlur={(e) => handleSubmit(e, title, userId)}
            padding={[3, 3, 4]}
            value={title}
            disabled={mutating}
          />
        </form>
      </Box>
    </Flex>
  )
}

import React, {useState, useCallback} from 'react'
import {Button, TextInput, Label, Box, Avatar, Popover, Flex, Card} from '@sanity/ui'
import {TrashIcon, CheckmarkCircleIcon, CircleIcon} from '@sanity/icons'
import {formatRelative} from 'date-fns'
import {UserAvatar} from '@sanity/base/components'
import sanityClient from 'part:@sanity/base/client'

import type {User, Task} from '../types/types'
import UserAssignmentMenu from './UserAssignmentMenu'

const client = sanityClient.withConfig({apiVersion: `2021-05-19`})

type TaskItemProps = Task & {
  documentId: string
  userList: User[]
}

const handleToggle = (documentId: string, _key: string, complete: boolean) => {
  client
    .patch(`task.${documentId}`)
    .set({[`tasks[_key == "${_key}"].complete`]: !complete})
    .commit()
    .then((res) => {
      // console.log(res);
    })
    .catch((err) => {
      console.error(err)
    })
}

export default function TaskItem(props: TaskItemProps) {
  const {documentId, _key, complete, due, userId, userList} = props
  const taskId = `task.${documentId}`

  const [title, setTitle] = useState(props.title)
  const [mutating, setMutating] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const handleUpdate = useCallback(
    (e) => {
      if (title === props.title) {
        return
      }

      e.preventDefault()
      setMutating(true)

      client
        .patch(taskId)
        .set({[`tasks[_key == "${_key}"].title`]: title})
        .commit()
        .then(() => {
          setMutating(false)
        })
        .catch((err) => {
          console.error(err)
        })
    },
    [title]
  )

  const handleDelete = useCallback(() => {
    client
      .patch(taskId)
      .unset([`tasks[_key == "${_key}"]`])
      .commit()
      .then((res) => res)
      .catch((err) => {
        console.error(err)
      })
  }, [_key])

  const onAssigneeAdd = useCallback((id) => {
    client
      .patch(taskId)
      .set({[`tasks[_key == "${_key}"].userId`]: id})
      .commit()
      .then((res) => {
        setAvatarOpen(false)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

  const onAssigneesClear = useCallback(() => {
    client
      .patch(taskId)
      .unset([`tasks[_key == "${_key}"].userId`])
      .commit()
      .then((res) => res)
      .catch((err) => {
        console.error(err)
      })
  }, [])

  const onAssigneeRemove = useCallback(() => {
    client
      .patch(taskId)
      .unset([`tasks[_key == "${_key}"].userId`])
      .commit()
      .then((res) => res)
      .catch((err) => {
        console.error(err)
      })
  }, [])

  return (
    <Card tone={complete ? `positive` : `default`} borderTop>
      <Flex align="center" gap={2} paddingX={2}>
        <Popover
          content={
            <UserAssignmentMenu
              value={userId ? [userId] : []}
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
        <Box paddingLeft={2}>
          <Button
            tone="positive"
            mode="bleed"
            icon={complete ? CheckmarkCircleIcon : CircleIcon}
            onClick={() => handleToggle(documentId, _key, complete)}
          />
        </Box>
        <Box flex={1}>
          <TextInput
            onChange={(event) => setTitle(event.currentTarget.value)}
            onBlur={handleUpdate}
            padding={[3, 3, 4]}
            value={title}
            disabled={mutating}
            border={false}
          />
        </Box>
        {due ? (
          <Label size={0} muted>
            {formatRelative(new Date(due), new Date())}
          </Label>
        ) : null}
        <Button icon={TrashIcon} tone="critical" padding={2} mode="ghost" onClick={handleDelete} />
      </Flex>
    </Card>
  )
}

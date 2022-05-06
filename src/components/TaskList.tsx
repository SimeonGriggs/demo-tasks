import React, {useState, useEffect, useRef} from 'react'
import {Box, Flex, Inline, Button, Spinner, Stack, Card} from '@sanity/ui'
import sanityClient from 'part:@sanity/base/client'

import type {Task} from '../types/types'
import {useProjectUsers} from '../lib/user'
import TaskNew from './TaskNew'
import TaskItem from './TaskItem'

const client = sanityClient.withConfig({apiVersion: `2021-05-19`})

type TaskListProps = {
  documentId: string
}

const FILTERS: string[] = [`All`, `Mine`, `Complete`, `Incomplete`]

export default function TaskList(props: TaskListProps) {
  const {documentId} = props
  const taskId = `task.${documentId}`
  const userList = useProjectUsers() || []
  const myUserId = userList.find((user) => user.isCurrentUser)?.id
  const [currentFilter, setCurrentFilter] = useState<string>(FILTERS[0])

  const [tasks, setTasks] = useState<Task[]>(null)

  useEffect(() => {
    if (!tasks) {
      client
        .fetch(`*[_id == $taskId][0].tasks`, {taskId})
        .then((res) => {
          if (res?.length) {
            return setTasks(res)
          }

          return setTasks([])
        })
        .catch((err) => console.error(err))
    }
  }, [tasks])

  const subscription = useRef()

  useEffect(() => {
    if (!subscription.current) {
      subscription.current = client.listen(`*[_id == $taskId][0]`, {taskId}).subscribe((update) => {
        if (update?.result?.tasks?.length) {
          setTasks(update.result.tasks)
        }
      })
    }

    return () => (subscription.current ? subscription.current.unsubscribe() : null)
  }, [])

  if (!tasks) {
    return (
      <Flex align="center" justify="center" padding={5}>
        <Spinner />
      </Flex>
    )
  }

  return (
    <Stack padding={4} space={0}>
      <Card padding={1} radius={3} shadow={1} marginBottom={2}>
        <Inline space={1}>
          {FILTERS.map((filter) => (
            <Button
              mode="ghost"
              key={filter}
              text={filter}
              onClick={() => setCurrentFilter(filter)}
              selected={filter === currentFilter}
            />
          ))}
        </Inline>
      </Card>

      <Box paddingBottom={2} />
      {tasks
        .filter((task) => {
          switch (currentFilter) {
            case 'All':
              return true
            case 'Mine':
              return task.userId === myUserId
            case 'Complete':
              return task.complete
            case 'Incomplete':
              return !task.complete
            default:
              return true
          }
        })
        .map((task) => (
          <TaskItem userList={userList} documentId={documentId} key={task._key} {...task} />
        ))}
      <Card paddingLeft={2} borderTop borderBottom>
        <TaskNew userList={userList} documentId={documentId} taskCount={tasks?.length} />
      </Card>
    </Stack>
  )
}

import React, {useState, useEffect, useRef} from 'react'
import {Box, Flex, Inline, Button, Spinner, Stack, Card} from '@sanity/ui'
import sanityClient from 'part:@sanity/base/client'
import Preview from 'part:@sanity/base/preview'
import schema from 'part:@sanity/base/schema'

import type {Task} from '../types/types'
import {useProjectUsers} from '../../lib/user'
import TaskItem from '../../components/TaskItem'
import TaskNew from '../../components/TaskNew'

const client = sanityClient.withConfig({apiVersion: `2021-05-19`})

const FILTERS: string[] = [`All`, `Mine`, `Complete`, `Incomplete`]

type TaskDoc = {
  _id: string
  documentId: string
  tasks: Task[]
}

export default function TasksTool() {
  const userList = useProjectUsers() || []
  const myUserId = userList.find((user) => user.isCurrentUser)?.id
  const [currentFilter, setCurrentFilter] = useState<string>(FILTERS[0])

  const [taskDocs, setTaskDocs] = useState<TaskDoc[]>(null)

  useEffect(() => {
    if (!taskDocs) {
      client
        .fetch(
          `*[_type == "sanity.task"]{
            ...,
            "originalDocument": *[_id == ^.documentId][0]{ _id, _type },
        }`
        )
        .then((res) => {
          if (res?.length) {
            return setTaskDocs(res)
          }

          return setTaskDocs([])
        })
        .catch((err) => console.error(err))
    }
  }, [taskDocs])

  const subscription = useRef()

  useEffect(() => {
    if (!subscription.current) {
      subscription.current = client.listen(`*[_type == "sanity.task"]`).subscribe((update) => {
        if (update?.result?.tasks?.length) {
          setTaskDocs(update.result)
        }
      })
    }

    return () => (subscription.current ? subscription.current.unsubscribe() : null)
  }, [])

  if (!taskDocs) {
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

      <Stack paddingBottom={2} space={4} />
      {taskDocs.length > 0 &&
        taskDocs.map((doc) => (
          <Card key={doc._id} shadow={1} radius={3} marginBottom={4} style={{overflow: `hidden`}}>
            <Box padding={2}>
              {doc?.originalDocument?._type ? (
                <Preview
                  value={doc.originalDocument}
                  type={schema.get(doc.originalDocument._type)}
                />
              ) : null}
            </Box>
            <Stack>
              {doc.tasks
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
                  <TaskItem
                    key={task._key}
                    userList={userList}
                    documentId={doc._id.replace(`task.`, ``)}
                    {...task}
                  />
                ))}
            </Stack>
          </Card>
        ))}
      {/* <Card paddingY={2} borderTop borderBottom>
        <TaskNew userList={userList} documentId={documentId} taskCount={tasks?.length} />
      </Card> */}
    </Stack>
  )
}

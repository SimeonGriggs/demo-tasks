import React from 'react'
import UserSelectInput from 'sanity-plugin-user-select-input'
import {CheckmarkCircleIcon, CircleIcon} from '@sanity/icons'

export default {
  name: 'sanity.task',
  title: 'Task Group',
  type: 'document',
  liveEdit: true,
  fields: [
    {name: 'documentId', type: 'string'},
    {
      name: 'tasks',
      type: 'array',
      of: [
        {
          name: 'task',
          title: 'title',
          type: 'object',
          fields: [
            {name: 'title', type: 'string'},
            {name: 'userId', title: 'User ID', type: 'string', inputComponent: UserSelectInput},
            {name: 'complete', type: 'boolean', initialValue: false},
            {name: 'due', type: 'datetime'},
          ],
          preview: {
            select: {
              title: 'title',
              complete: 'complete',
              userId: 'userId',
              due: 'due',
            },
            prepare({title, userId, due, complete}) {
              return {
                title,
                subtitle: [userId, due ? `Due: ${due}` : null].filter(Boolean).join(`, `),
                media: React.createElement(complete ? CheckmarkCircleIcon : CircleIcon),
              }
            },
          },
        },
      ],
    },
  ],
}

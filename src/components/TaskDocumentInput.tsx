import React, {forwardRef, Ref, useMemo} from 'react'
// import {SanityProps} from './helperTypes'
import {ObjectSchemaType} from '@sanity/types'
import {NestedFormBuilder} from './NestedFormBuilder'
import TaskPrompt from './TaskPrompt'

export const scheduledMarkerFieldName = 'hasScheduleWrapper'
export const validationMarkerField = '_validationError'

export const TaskDocumentInput = forwardRef(function TaskDocumentInput(props: any, ref: Ref<any>) {
  if (props.type.jsonType !== 'object') {
    throw new Error(`jsonType of schema must be object, but was ${props.type.jsonType}`)
  }

  const type = useTypeWithMarkerField(props.type)
  const {value, markers} = props

  return (
    <>
      {/* {value?._id ? <ScheduleBanner id={value._id} markers={markers} type={type} /> : null} */}
      <TaskPrompt />
      <NestedFormBuilder {...props} ref={ref} type={type} />
    </>
  )
})

function useTypeWithMarkerField(type: ObjectSchemaType): ObjectSchemaType {
  return useMemo(() => typeWithMarkerField(type), [type])
}

function typeWithMarkerField(type: ObjectSchemaType): ObjectSchemaType {
  const t = {
    ...type,
    [scheduledMarkerFieldName]: true,
  }
  const typeOfType =
    'type' in type && type.type ? typeWithMarkerField(type.type as ObjectSchemaType) : undefined
  return {
    ...t,
    type: typeOfType,
  }
}

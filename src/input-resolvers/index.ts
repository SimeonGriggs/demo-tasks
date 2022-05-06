import {TaskDocumentInput} from '../components/TaskDocumentInput'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function resolveInput(type: any): any {
  const rootType = getRootType(type)
  if (rootType.name === 'document') {
    return TaskDocumentInput
  }
  return undefined
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function getRootType(type: any): any {
  if (!type.type) {
    return type
  }
  return getRootType(type.type)
}

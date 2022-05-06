import S from '@sanity/desk-tool/structure-builder'
import {ComposeIcon, CheckmarkCircleIcon} from '@sanity/icons'
import TaskList from '../components/TaskList'

export const getDefaultDocumentNode = ({schemaType}) => {
  if (schemaType === `article`) {
    return S.document().views([S.view.form(), S.view.component(TaskList).title('Tasks')])
  }

  return S.document()
}

const items = [
  S.documentTypeListItem('article').title('Articles').icon(ComposeIcon),
  S.divider(),
  S.documentTypeListItem('sanity.task').title('Tasks').icon(CheckmarkCircleIcon),
]

export default () => {
  return S.list().title('Content').items(items)
}

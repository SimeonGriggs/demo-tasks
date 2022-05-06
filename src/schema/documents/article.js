import {PackageIcon} from '@sanity/icons'
import sanityClient from 'part:@sanity/base/client'
import documentStore from 'part:@sanity/base/datastore/document'
import {map} from 'rxjs/operators'

const client = sanityClient.withConfig({apiVersion: `2021-05-19`})

export default {
  name: 'article',
  title: 'Article',
  icon: PackageIcon,
  type: 'document',
  validation: (Rule) => [
    Rule.custom(({_id}) =>
      client
        .fetch(`*[_id == "task.${_id.replace(`drafts.`, ``)}"][0].tasks[!complete]`)
        .then((res) =>
          // eslint-disable-next-line no-nested-ternary
          res?.length
            ? res.length === 1
              ? `There is 1 outstanding task`
              : `There are ${res.length} outstanding tasks`
            : true
        )
    ),
  ],
  fields: [
    {
      name: 'title',
      type: 'string',
    },
    {
      name: 'content',
      type: 'array',
      of: [{type: 'block'}],
    },
  ],
}

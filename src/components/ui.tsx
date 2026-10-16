import { defineComponent } from '@lubbock/runtime'

export const ui = defineComponent({
  name: 'ui',
  template: /* jsx */ `<div class="ui-root"></div>`,
  props: {
    id: { type: String, required: true }
  },
  events: {
    click: { detail: { target: String } }
  }
})
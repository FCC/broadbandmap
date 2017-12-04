import { Tooltip, Popover } from 'uiv'

export default {
  name: 'BookmarkLink',
  components: { Tooltip, Popover },
  props: [],
  mounted () {
    this.pageURL = window.location
  },
  data () {
    return {
      document,
      pageURL: '',
      showPopup: false,
      msgCopied: ''
    }
  },
  methods: {
    getURL () {
      this.show = true
    },
    setFocus () {
      this.$refs.linkField.focus()
      this.msgCopied = ''
    },
    copyLink () {
      let copyCmd = document.execCommand('copy')

      this.$refs.linkField.select()

      if (copyCmd) {
        this.msgCopied = 'Copied!'
      }
    },
    hidePopup () {
      this.showPopup = false
    }
  }
}

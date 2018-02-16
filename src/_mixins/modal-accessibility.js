// Accessibility fix to focus and trap tabbing within modal

export const modalAccessibility = {
  methods: {
    init () {
      this.dialogEl = document.querySelector('.modal.in')

      const focusableEls = this.dialogEl.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]')
      this.focusableEls = Array.prototype.slice.call(focusableEls)

      this.firstFocusableEl = this.focusableEls[0]
      this.lastFocusableEl = this.focusableEls[this.focusableEls.length - 1]

      this.open()
    },
    open () {
      const Dialog = this

      this.dialogEl.removeAttribute('aria-hidden')

      this.focusedElBeforeOpen = document.activeElement

      this.dialogEl.addEventListener('keydown', function (e) {
        Dialog._handleKeyDown(e)
      })

      this.firstFocusableEl.focus()
    },
    close () {
      this.dialogEl.setAttribute('aria-hidden', true)

      if (this.focusedElBeforeOpen) {
        this.focusedElBeforeOpen.focus()
      }
    },
    _handleKeyDown (e) {
      const Dialog = this
      const KEY_TAB = 9

      function handleBackwardTab () {
        if (document.activeElement === Dialog.firstFocusableEl) {
          e.preventDefault()
          Dialog.lastFocusableEl.focus()
        }
      }

      function handleForwardTab () {
        if (document.activeElement === Dialog.lastFocusableEl) {
          e.preventDefault()
          Dialog.firstFocusableEl.focus()
        }
      }

      switch (e.keyCode) {
        case KEY_TAB:
          if (Dialog.focusableEls.length === 1) {
            e.preventDefault()
            break
          }
          if (e.shiftKey) {
            handleBackwardTab()
          } else {
            handleForwardTab()
          }
          break
        default:
          break
      }
    }
  }
}

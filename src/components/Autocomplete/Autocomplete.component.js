// Include UIV library's Typeahead component
import { Typeahead } from 'uiv'

export default {
components: {
    Typeahead: Typeahead
},
    props: ['placeholderText'],
    data () {
        return {
            modelVar: '',
            itemKey: 'name',
            ignoreCase: true,
            matchStart: false,
            openOnFocus: false
        }
    }
}

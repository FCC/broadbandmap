// Include the needed "uiv" library components
import { Typeahead } from 'uiv'

export default {
    components: {
        Typeahead: Typeahead
    },
    props: ['placeholderText'],
    data () {
        return {
            // TYPEAHEAD vars
            typeaheadModel: '',
            itemKey: 'name'
        }
    },
    methods: {
        // Called when the user selects an address returned by the geocoder
        addressClicked (event, props, item) {
            // Select the item the user clicked
            props.select(item);
        },
        searchButtonClicked (event) {
            if (typeof this.typeaheadModel == "object") {
                this.gotoLocationSummary(event);
            } else {
                alert("No results found.");
            }
        },
        enterClicked (event) {
            if (typeof this.typeaheadModel == "object") {
                this.gotoLocationSummary(event);
            }
        },
        gotoLocationSummary (event) {
            // Create the URL
            const newUrl = "location-summary?lat=" + this.typeaheadModel.center[1] + "&lon=" + this.typeaheadModel.center[0] + "&place_name=" + encodeURIComponent(this.typeaheadModel.place_name);
            // Push the URL to the Vue router
            this.$router.push(newUrl);
        }
    }
}

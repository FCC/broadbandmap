<template>
  <section class="container-fluid">
    <typeahead ref="typeahead2"
      v-model="modelVar"
      :async-src="'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(modelVar) + '.json?country=us&access_token=pk.eyJ1IjoiZmNjIiwiYSI6IktmWXZja00ifQ.GEwhTOZ-sw8BSJK7Q17S_Q&'"
      async-key="features"
      item-key="place_name"
      :ignore-case="ignoreCase"
      :match-start="matchStart"
      :force-select="false"
      :open-on-focus="openOnFocus"
      >
      <input data-role="input" class="form-control" type="text" :placeholder="placeholderText">
    </typeahead>
    <br/>
    <div class="alert alert-info">
      <p v-if="modelVar">You selected: {{modelVar}}</p>
      <p v-else>Please select an item.</p>
    </div>
  </section>
</template>

<script>
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
</script>

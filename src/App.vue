<template>
  <div id="app">
  	 <div class="outer-container">
        <div class="inner-container">
		    <app-header></app-header>
		    <main>
		    	<router-view></router-view>
		    </main>
		    <app-footer></app-footer>    
		  </div>
  	</div>
	</div>
</template>

<script>
import AppHeader from './components/AppHeader/'
import AppFooter from './components/AppFooter/'

export default {
  name: 'app',
  components: { AppHeader, AppFooter }
}
</script>

<style lang="scss">

</style>

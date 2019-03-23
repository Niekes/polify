<template>
    <div id="app">
        <Navigation />
        <router-view/>
    </div>
</template>

<script>
import Navigation from '$components/Navigation';
import config from '$config';
import { setLanguage } from '$helper/language-helper';

export default {
    name: 'Main',

    components: {
        Navigation,
    },

    beforeCreate() {
        this.$i18n.locale = setLanguage();
    },

    mounted() {
        console.log(config);
    },

};
</script>

<style lang="scss">
@import './scss/main';
</style>

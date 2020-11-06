<template>
    <div id="app">
        <Navigation />
        <router-view />
    </div>
</template>

<script>
import Navigation from '@/components/Navigation';

export default {
    name: 'Main',

    components: {
        Navigation,
    },

};
</script>

<style lang="scss">
@import './scss/main';
</style>

<template>
    <div id="app">
        <navigation />
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

* {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

html,
body,
#app {
    height: 100%;
}

body {
    font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif,
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol";
    position: relative;
}

#app {
    padding: 0;
}

#stripe-pattern {
    height: 5000000000px;
    left: -999999999px;
    pointer-events: none;
    position: absolute;
    user-select: none;
    width: 5000000000px;
    z-index: -1000000;
}
</style>

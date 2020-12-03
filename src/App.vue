<template>
    <div id="app">
        <navigation />
        <router-view />
    </div>
</template>

<script>
import axios from 'axios';
import Navigation from '@/components/Navigation';

export default {
    name: 'Main',

    components: {
        Navigation,
    },

    data() {
        return {
            isMobileReponse: null,
        };
    },

    async created() {
        if (process.env.NODE_ENV === 'production') {
            try {
                this.isMobileReponse = await axios({
                    url: 'api/is-mobile.php',
                });
            } catch (e) {
                console.error(e);
            } finally {
                console.log(this.isMobileReponse);
                if (this.isMobileReponse !== null && this.isMobileReponse.status === 200) {
                    this.$store.commit('mobile/setMobile', this.isMobileReponse.data.isMobile);
                    this.$store.commit('mobile/setTablet', this.isMobileReponse.data.isTablet);
                }
            }
        }
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

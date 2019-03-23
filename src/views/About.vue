<template>
    <div>
        <h1>{{ $t('about.title') }}</h1>
        <SvgIcon :xlink="'#warning--sprite'" />
    </div>
</template>

<script>
import SvgIcon from '$components/SvgIcon';

export default {
    name: 'About',

    components: {
        SvgIcon,
    },

};
</script>

<style lang="scss" scoped>
/*
    Add styles here
*/
</style>

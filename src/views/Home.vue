<template>
    <div>
        <h1>{{ $t('home.title') }}</h1>
        <SvgIcon :xlink="'#home--sprite'" />
    </div>
</template>

<script>
import SvgIcon from '$components/SvgIcon';

export default {
    name: 'Home',

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

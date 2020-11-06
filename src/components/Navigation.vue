<template>
    <div>
        <router-link to="/">
            {{ $t('navigation.create') }}
        </router-link> |
        <router-link to="/adjust">
            {{ $t('navigation.adjust') }}
        </router-link>
    </div>
</template>

<script>
export default {
    name: 'Navigation',
};
</script>

<style lang="scss" scoped>
/*
    Add styles here
*/
</style>

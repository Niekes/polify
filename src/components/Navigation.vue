<template>
    <div>
        <router-link to="/">{{ $t('navigation.home') }}</router-link> |
        <router-link to="/about">{{ $t('navigation.about') }}</router-link>
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

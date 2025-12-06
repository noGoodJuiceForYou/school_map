<template>
	<view class = "userinfo" :style="{ backgroundColor:bgcolor }">
		<image :src="obj.avatar" class = "avatr"></image>
		<view class = "username">{{obj.name}}</view>
	</view>
</template>

<script setup>

defineProps({
	obj:{
		type:Object,
		default(){
			return{name:"匿名",avatar:"../../static/logo.png"}
		}
	},
	bgcolor:{
		type:String,
		default:"grey"
	}
})

</script>

<style lang="scss">

.userinfo{
	width: 100%;
	height: 200px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	.avatr{
		width: 100px;
		height: 100px;
		border-radius: 50%;
	}
	.username{
		font-size: 20px;
	}
}
</style>
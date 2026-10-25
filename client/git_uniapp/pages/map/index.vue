<template>
  <view class="page-container" @click="auth.showUserMenu.value = false">
    <SearchBar
      :searchKeyword="search.searchKeyword.value"
      :showSearchResults="search.showSearchResults.value"
      :searchResults="search.searchResults.value"
      @update:searchKeyword="(v) => search.searchKeyword.value = v"
      @search-input="search.handleSearchInput"
      @search="search.handleSearch"
      @clear-search="search.clearSearch"
      @result-click="onSearchResultClick"
    />

    <view class="container">
      <view id="mapContainer" class="map-container"></view>
    </view>

    <MapControls
      :isLocating="map.isLocating.value"
      :isLoggedIn="auth.isLoggedIn.value"
      :username="auth.username.value"
      :showUserMenu="auth.showUserMenu.value"
      @locate-me="() => map.locateMe()"
      @paint-path="route.paintpath"
      @clear-route="map.clearRoute"
      @reset-center="map.resetCenter"
      @start-ai="showCozeIframe = true"
      @toggle-user-menu="auth.toggleUserMenu"
      @show-pending-images="upload.showPendingImages"
      @logout="auth.logout"
      @show-login="() => auth.showLoginDialog.value = true"
    />

    <BeianFooter />

    <LocationPopup
      :show="map.showPopup.value"
      :currentLocation="map.currentLocation.value"
      :swiperCurrent="map.swiperCurrent.value"
      :isLoggedIn="auth.isLoggedIn.value"
      :username="auth.username.value"
      :displayedComments="map.currentLocation.value?.comments || []"
      :isCurrentUser="comments.isCurrentUser"
      @navigate-to-here="() => route.navigateToHere(map.currentLocation.value)"
      @hide-popup="map.hidePopup"
      @next-slide="map.nextSlide"
      @prev-slide="map.prevSlide"
      @touch-start="map.touchStart"
      @touch-move="map.touchMove"
      @touch-end="map.touchEnd"
      @set-swiper-current="map.setSwiperCurrent"
      @open-image-preview="openImagePreview"
      @upload-image="upload.uploadImage"
      @show-add-comment="comments.showAddCommentDialog"
      @show-all-comments="comments.showAllComments"
      @delete-comment="comments.deleteComment"
      @image-error="map.handleImageError"
    />

    <RouteDialog
      :show="route.showRouteDialog.value"
      :startLocation="route.startLocation.value"
      :endLocation="route.endLocation.value"
      @close="route.closeRouteDialog"
      @confirm="route.confirmRoute"
      @select-start-from-map="route.selectStartFromMap"
      @select-end-from-map="route.selectEndFromMap"
      @use-my-location-as-start="route.useMyLocationAsStart"
    />

    <CommentDialog
      :show="comments.showCommentDialog.value"
      :type="comments.commentDialogType.value"
      :title="comments.commentDialogTitle.value"
      :comments="comments.currentPageComments.value"
      :currentPage="comments.currentPage.value"
      :totalPages="comments.totalPages.value"
      :totalComments="comments.totalComments.value"
      :isSubmitting="comments.isSubmitting.value"
      :isCurrentUser="comments.isCurrentUser"
      @hide="comments.hideCommentDialog"
      @submit-comment="(content) => { comments.newCommentContent.value = content; comments.submitComment() }"
      @prev-page="comments.prevPage"
      @next-page="comments.nextPage"
      @delete-comment="comments.deleteComment"
    />

    <LoginDialog
      :show="auth.showLoginDialog.value"
      :loginMode="auth.loginMode.value"
      :loginError="auth.loginError.value"
      :isLoggingIn="auth.isLoggingIn.value"
      @hide="auth.hideLoginDialog"
      @submit-login="(data) => auth.submitLogin(data)"
      @switch-mode="auth.switchLoginMode"
    />

    <PendingImagesDialog
      :show="upload.showPendingImagesDialog.value"
      :images="upload.pendingImages.value"
      @hide="upload.hidePendingImagesDialog"
      @delete-image="upload.deletePendingImage"
      @open-image-preview="openImagePreview"
    />

    <ImagePreview
      :show="showImagePreview"
      :image="previewImage"
      @close="closeImagePreview"
    />

    <CozeChat
      :show="showCozeIframe"
      @close="showCozeIframe = false"
    />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMap } from '@/composables/useMap.js'
import { useAuth } from '@/composables/useAuth.js'
import { useRoutePlanning } from '@/composables/useRoutePlanning.js'
import { useComments } from '@/composables/useComments.js'
import { useImageUpload } from '@/composables/useImageUpload.js'
import { useSearch } from '@/composables/useSearch.js'

import SearchBar from '@/components/SearchBar/SearchBar.vue'
import MapControls from '@/components/MapControls/MapControls.vue'
import BeianFooter from '@/components/BeianFooter/BeianFooter.vue'
import LocationPopup from '@/components/LocationPopup/LocationPopup.vue'
import RouteDialog from '@/components/RouteDialog/RouteDialog.vue'
import CommentDialog from '@/components/CommentDialog/CommentDialog.vue'
import LoginDialog from '@/components/LoginDialog/LoginDialog.vue'
import PendingImagesDialog from '@/components/PendingImagesDialog/PendingImagesDialog.vue'
import ImagePreview from '@/components/ImagePreview/ImagePreview.vue'
import CozeChat from '@/components/CozeChat/CozeChat.vue'

const map = useMap()
const auth = useAuth()
const route = useRoutePlanning(map.map, {
  clearRoute: map.clearRoute,
  locateMe: map.locateMe,
  selectingLocation: map.selectingLocation,
})
const comments = useComments(map.currentLocation, auth)
const upload = useImageUpload(map.currentLocation, auth)
const search = useSearch(map.map, map.customMarkers)

// Wire callbacks between composables
map.loadAllComments._impl = () => comments.loadCommentsForSection()
search.handleSearchResultClick._selectedMarker = map.selectedMarker
search.handleSearchResultClick._handleMarkerClick = map.handleMarkerClick
map.onMapClickSelect('start', (loc) => { route.startLocation.value = loc; route.showRouteDialog.value = true })
map.onMapClickSelect('end', (loc) => { route.endLocation.value = loc; route.showRouteDialog.value = true })

const showImagePreview = ref(false)
const previewImage = ref('')
function openImagePreview(image) { previewImage.value = image; showImagePreview.value = true }
function closeImagePreview() { showImagePreview.value = false; previewImage.value = '' }

const showCozeIframe = ref(false)

function onSearchResultClick(result) { search.handleSearchResultClick(result) }

onMounted(() => {
  let count = 0
  function poll() {
    count++
    if (window.AMap) { console.log('AMap ready'); map.initMap() }
    else if (count < 30) { setTimeout(poll, 100) }
    else { uni.showToast({ title: '地图加载失败', icon: 'none', duration: 3000 }) }
  }
  poll()
  auth.checkLoginStatus()
})
</script>

<style lang="scss">
.page-container { display: flex; flex-direction: column; height: 100vh; }
.container { width: 100%; flex: 1; position: relative; }
.map-container { width: 100%; height: 100%; }
</style>

<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { useRecipeStore } from '@/stores/recipe'
import { useCookingStore } from '@/stores/cooking'

onLaunch(() => {
  const recipeStore = useRecipeStore()
  const cookingStore = useCookingStore()

  recipeStore.hydrate()
  cookingStore.hydrate()
})
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  background:
    radial-gradient(circle at top, rgba(255, 246, 199, 0.95), rgba(255, 247, 224, 0.85) 36%, #fff9ee 76%),
    #fff9ee;
  color: #5b4424;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

view,
text,
button,
input,
textarea {
  box-sizing: border-box;
}

input,
textarea,
uni-input,
uni-textarea,
.uni-input-input,
.uni-textarea-textarea {
  -webkit-user-select: text;
  user-select: text;
  -webkit-touch-callout: default;
  cursor: text;
}

button {
  border: none;
}
</style>

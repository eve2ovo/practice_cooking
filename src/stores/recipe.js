import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getStorage, setStorage } from '@/utils/storage'
import { generateRecipeByWorkflow } from '@/api/workflow'

function createDefaultForm() {
  return {
    dishName: '',
    servings: 2,
    taste: '家常',
    availableIngredients: ''
  }
}

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    form: createDefaultForm(),
    recipe: null,
    loading: false,
    errorMessage: ''
  }),
  actions: {
    hydrate() {
      const savedForm = getStorage(STORAGE_KEYS.latestForm, null)
      const savedRecipe = getStorage(STORAGE_KEYS.latestRecipe, null)

      if (savedForm) {
        this.form = {
          ...createDefaultForm(),
          ...savedForm
        }
      }

      if (savedRecipe) {
        this.recipe = savedRecipe
      }
    },
    persistForm() {
      setStorage(STORAGE_KEYS.latestForm, this.form)
    },
    persistRecipe() {
      setStorage(STORAGE_KEYS.latestRecipe, this.recipe)
    },
    setForm(nextForm = {}) {
      this.form = {
        ...this.form,
        ...nextForm
      }
      this.persistForm()
    },
    async generateRecipe() {
      this.loading = true
      this.errorMessage = ''

      try {
        const result = await generateRecipeByWorkflow(this.form)
        this.recipe = result
        this.persistRecipe()
        return result
      } catch (error) {
        this.errorMessage = error.message || '生成失败'
        uni.showToast({
          title: this.errorMessage,
          icon: 'none'
        })
        return null
      } finally {
        this.loading = false
      }
    },
    clearRecipe() {
      this.recipe = null
      this.persistRecipe()
    }
  }
})

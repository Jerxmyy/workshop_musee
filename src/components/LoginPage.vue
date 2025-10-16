<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <img src="/logo.png?v=4" alt="MuséeExplorer" class="logo-image" />
        </div>
        <h1 class="login-title">{{ isAuthenticated ? 'Compte' : 'Connexion' }}</h1>
        <p class="login-subtitle">
          {{
            isAuthenticated
              ? 'Gérez votre compte MuséeExplorer'
              : 'Connectez-vous à votre compte MuséeExplorer'
          }}
        </p>
      </div>

      <!-- User Info (when authenticated) -->
      <div v-if="isAuthenticated" class="user-info-section">
        <div class="user-welcome">
          <h2 class="welcome-title">Bonjour, {{ currentUser?.prenom || 'Utilisateur' }} !</h2>
          <p class="welcome-email">{{ currentUser?.email }}</p>
        </div>
        <div class="user-actions">
          <button @click="handleLogout" class="logout-btn">
            <span class="btn-icon">🚪</span>
            <span class="btn-text">Se déconnecter</span>
          </button>
        </div>
      </div>

      <form v-else @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="loginData.email"
            type="email"
            class="form-input"
            :class="{ error: errors.email }"
            placeholder="votre@email.com"
            required
            @blur="validateEmail"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Mot de passe</label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="loginData.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="Votre mot de passe"
              required
              @blur="validatePassword"
            />
            <button type="button" class="password-toggle" @click="togglePasswordVisibility">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="login-btn"
            :disabled="isLoading || !isFormValid"
            :class="{ loading: isLoading }"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>Se connecter</span>
          </button>
        </div>

        <div class="login-footer">
          <p class="no-account">
            Pas encore de compte ?
            <button type="button" class="link-btn" @click="goToRegister">Créer un compte</button>
          </p>
        </div>
      </form>

      <div v-if="error" class="error-banner">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// État d'authentification
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.userInfo)

// État du formulaire
const loginData = reactive({
  email: '',
  password: '',
})

// État de l'interface
const isLoading = ref(false)
const showPassword = ref(false)
const error = ref('')

// Validation
const errors = reactive({
  email: '',
  password: '',
})

// Validation de l'email
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!loginData.email) {
    errors.email = "L'email est requis"
  } else if (!emailRegex.test(loginData.email)) {
    errors.email = "Format d'email invalide"
  } else {
    errors.email = ''
  }
}

// Validation du mot de passe
const validatePassword = () => {
  if (!loginData.password) {
    errors.password = 'Le mot de passe est requis'
  } else if (loginData.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
  } else {
    errors.password = ''
  }
}

// Vérification de la validité du formulaire
const isFormValid = computed(() => {
  return loginData.email && loginData.password && !errors.email && !errors.password
})

// Basculer la visibilité du mot de passe
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Gestion de la connexion
const handleLogin = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ''

  try {
    await authStore.login(loginData.email, loginData.password)
    // La redirection sera gérée par le store ou le composant parent
  } catch (err) {
    error.value = err.message || 'Erreur lors de la connexion'
  } finally {
    isLoading.value = false
  }
}

// Navigation vers l'inscription
const goToRegister = () => {
  // Émettre un événement pour changer de vue
  emit('go-to-register')
}

// Gestion de la déconnexion
const handleLogout = async () => {
  try {
    await authStore.logout()
    emit('logout-success')
  } catch (err) {
    console.error('Erreur lors de la déconnexion:', err)
  }
}

// Émettre les événements
const emit = defineEmits(['go-to-register', 'login-success', 'logout-success'])
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 2rem;
}

.login-card {
  background: linear-gradient(135deg, #2d2d2d 0%, #404040 100%);
  border: 1px solid #555555;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #007acc, #00a8ff);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  margin-bottom: 0.5rem;
}

.logo-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #007acc, #00a8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: #c0c0c0;
  font-size: 1rem;
  margin: 0;
}

/* User Info Section */
.user-info-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.user-welcome {
  text-align: center;
  padding: 1.5rem;
  background: rgba(60, 60, 60, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid #555555;
  border-radius: 12px;
}

.welcome-title {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #007acc, #00a8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-email {
  color: #c0c0c0;
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
}

.user-actions {
  display: flex;
  justify-content: center;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.logout-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.logout-btn .btn-icon {
  font-size: 1.1rem;
}

.logout-btn .btn-text {
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #e5e5e5;
  font-size: 0.9rem;
}

.form-input {
  padding: 1rem;
  border: 2px solid #555555;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(60, 60, 60, 0.8);
  backdrop-filter: blur(10px);
  color: #e5e5e5;
}

.form-input::placeholder {
  color: #888888;
  font-weight: 400;
}

.form-input:focus {
  outline: none;
  border-color: #007acc;
  background: rgba(70, 70, 70, 0.9);
  box-shadow: 0 0 0 4px rgba(0, 122, 204, 0.2);
}

.form-input.error {
  border-color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #888888;
}

.password-toggle:hover {
  background: rgba(0, 122, 204, 0.2);
  color: #007acc;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8rem;
  font-weight: 500;
}

.form-actions {
  margin-top: 1rem;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #007acc, #00a8ff);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 122, 204, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 204, 0.4);
  background: linear-gradient(135deg, #0056b3, #007acc);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: #666666;
  box-shadow: none;
}

.login-btn.loading {
  color: transparent;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #555555;
}

.no-account {
  color: #c0c0c0;
  font-size: 0.9rem;
  margin: 0;
}

.link-btn {
  background: none;
  border: none;
  color: #007acc;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  transition: color 0.2s ease;
}

.link-btn:hover {
  color: #00a8ff;
}

.error-banner {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  font-size: 1.2rem;
}

.error-text {
  color: #e74c3c;
  font-weight: 500;
}
</style>

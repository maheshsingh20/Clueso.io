import { apiService } from './api'
import { 
  LoginRequest, 
  RegisterRequest, 
  User, 
  AuthTokens, 
  ApiResponse 
} from '@clueso/shared'

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    return response.data!
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/register', userData)
    return response.data!
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout')
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<ApiResponse<{ user: User }>>('/auth/profile')
    return response.data!.user
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<ApiResponse<{ user: User }>>('/auth/profile', userData)
    return response.data!.user
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.put('/auth/change-password', {
      currentPassword,
      newPassword
    })
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiService.post<ApiResponse<{ tokens: AuthTokens }>>('/auth/refresh', {
      refreshToken
    })
    return response.data!.tokens
  }
}

export const authService = new AuthService()
export default authService
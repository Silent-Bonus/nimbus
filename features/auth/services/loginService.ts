import axios, { AxiosResponse, AxiosError } from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  LogoutRequest,
  LogoutResponse,
  GetOtpRequest,
  GetOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ForgotPasswordResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SetPasswordResponse,
  SetPasswordRequest,
} from "@/features/auth/types/loginTypes";
import type { UserProfile } from "@/features/auth/types/userProfile";
import type {
  BodyVitalsCalculationApiResponse,
  BodyVitalsCalculationPayload,
  BodyVitalsProfilePatchPayload,
} from "@/features/self-care/types/bodyVitals";

type FetchUserResponse = {
  success: boolean;
  data: UserProfile;
  message: string;
};

// Login API request
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<LoginResponse> = await axios.post(
      API_ENDPOINTS.login,
      data
    );
    return response.data; // Return the data containing the token
  } catch (error: any) {
    // error.response.data - have backend response where as error.message has axios error
    // Extract error message properly
    const errorMessage =
      error.response?.data?.message ||
      "Something went wrong. Please try again.";
    throw error.response ? error.response.data : error.message;
  }
};

// Signup API request
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  try {
    const response: AxiosResponse<SignupResponse> = await axios.post(
      API_ENDPOINTS.register,
      data
    );
    return response.data; // Return the data containing the token
  } catch (error: any) {
    // Normalize error to match SignupResponse
    if (error.response?.data) {
      return error.response.data as SignupResponse;
    }
    return {
      success: false,
      message: error.message ?? "Something went wrong",
      data: {},
    };
  }
};

export const getOtp = async (data: GetOtpRequest): Promise<GetOtpResponse> => {
  try {
    const response: AxiosResponse<GetOtpResponse> = await axios.post(
      API_ENDPOINTS.getOtp,
      data
    );
    return response.data; // Return the data containing the token
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  try {
    const response: AxiosResponse<VerifyOtpResponse> = await axios.post(
      API_ENDPOINTS.verifyOtp,
      data
    );
    return response.data; // Return the data containing the token
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const forgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  try {
    const response: AxiosResponse<ForgotPasswordResponse> = await axios.post(
      API_ENDPOINTS.forgotPassword,
      data
    );
    return response.data; // Return the data containing the token
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  try {
    const response: AxiosResponse<ResetPasswordResponse> = await axios.post(
      API_ENDPOINTS.changePassword,
      data
    );
    return response.data; // Return the data containing the token
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const setPassword = async (
  data: SetPasswordRequest
): Promise<SetPasswordResponse> => {
  try {
    const response: AxiosResponse<SetPasswordResponse> = await axios.post(
      API_ENDPOINTS.setPassword,
      data
    );
    return response.data; // Return the data containing the token
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const logout = async (data: LogoutRequest): Promise<LogoutResponse> => {
  try {
    const response: AxiosResponse<LogoutResponse> = await axios.post(
      API_ENDPOINTS.logout,
      data
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getUserDetails = async (): Promise<FetchUserResponse> => {
  try {
    const response: AxiosResponse<FetchUserResponse> = await axios.get(
      API_ENDPOINTS.fetchUserDetails
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const saveUpdateUser = async (data: any): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axios.patch(
      API_ENDPOINTS.fetchUserDetails,
      data
    );
    return response.data; // Return the list data
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const calculateBodyVitals = async (
  data: BodyVitalsCalculationPayload
): Promise<BodyVitalsCalculationApiResponse> => {
  try {
    const response: AxiosResponse<BodyVitalsCalculationApiResponse> = await axios.post(
      API_ENDPOINTS.vitalsCalculator,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export const calculateProteinVitals = async (
  data: BodyVitalsCalculationPayload
): Promise<BodyVitalsCalculationApiResponse> => {
  return calculateBodyVitals(data);
};

export const calculateCalorieVitals = async (
  data: BodyVitalsCalculationPayload
): Promise<BodyVitalsCalculationApiResponse> => {
  return calculateBodyVitals(data);
};

export const calculateBodyShapeVitals = async (
  data: BodyVitalsCalculationPayload
): Promise<BodyVitalsCalculationApiResponse> => {
  return calculateBodyVitals(data);
};

export const patchBodyVitalsProfile = async (
  data: BodyVitalsProfilePatchPayload
): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axios.patch(
      API_ENDPOINTS.fetchUserDetails,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error.response ? error.response.data : error.message;
  }
};

export async function postOnboardingData(data: any) {
  return data;
}

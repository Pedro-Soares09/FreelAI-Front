"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  AccountType,
  VerificationStatus,
  ProfessionalUser,
  CompanyUser,
  VerificationData,
} from "@/types";
import { mockProfessionalUser, mockCompanyUser } from "@/mocks/users";

type UserContextType = {
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
  professionalProfile: ProfessionalUser;
  companyProfile: CompanyUser;
  verificationStatus: VerificationStatus;
  rejectionReason: string;
  policiesAccepted: boolean;
  setPoliciesAccepted: (accepted: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  updateProfessionalProfile: (data: Partial<ProfessionalUser>) => void;
  updateCompanyProfile: (data: Partial<CompanyUser>) => void;
  submitVerification: (data: {
    cpf: string;
    documentType: "rg" | "cnh" | "passaporte";
    documentFileName: string;
    selfieFileName: string;
  }) => void;
  setVerificationStatusDirectly: (
    status: VerificationStatus,
    reason?: string,
  ) => void;
  loginAs: (type: AccountType) => void;
  registerProfessional: (data: Partial<ProfessionalUser>) => void;
  registerCompany: (data: Partial<CompanyUser>) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "freelai_app_state_v1";

export function UserProvider({ children }: { children: ReactNode }) {
  const [accountType, setAccountTypeState] = useState<AccountType>("profissional");
  const [professionalProfile, setProfessionalProfile] =
    useState<ProfessionalUser>(mockProfessionalUser);
  const [companyProfile, setCompanyProfile] =
    useState<CompanyUser>(mockCompanyUser);
  const [policiesAccepted, setPoliciesAccepted] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [rejectionReason, setRejectionReason] = useState<string>(
    "A imagem da selfie está com baixa iluminação e a CNH está com as bordas cortadas.",
  );

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.accountType) setAccountTypeState(parsed.accountType);
        if (parsed.professionalProfile)
          setProfessionalProfile(parsed.professionalProfile);
        if (parsed.companyProfile) setCompanyProfile(parsed.companyProfile);
        if (typeof parsed.policiesAccepted === "boolean")
          setPoliciesAccepted(parsed.policiesAccepted);
        if (typeof parsed.notificationsEnabled === "boolean")
          setNotificationsEnabled(parsed.notificationsEnabled);
        if (parsed.rejectionReason) setRejectionReason(parsed.rejectionReason);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          accountType,
          professionalProfile,
          companyProfile,
          policiesAccepted,
          notificationsEnabled,
          rejectionReason,
        }),
      );
    } catch {
      // Ignore quota/storage errors
    }
  }, [
    accountType,
    professionalProfile,
    companyProfile,
    policiesAccepted,
    notificationsEnabled,
    rejectionReason,
  ]);

  const setAccountType = (type: AccountType) => {
    setAccountTypeState(type);
  };

  const updateProfessionalProfile = (data: Partial<ProfessionalUser>) => {
    setProfessionalProfile((prev) => ({
      ...prev,
      ...data,
      location: data.location
        ? { ...prev.location, ...data.location }
        : prev.location,
      characteristics: data.characteristics
        ? { ...prev.characteristics, ...data.characteristics }
        : prev.characteristics,
    }));
  };

  const updateCompanyProfile = (data: Partial<CompanyUser>) => {
    setCompanyProfile((prev) => ({
      ...prev,
      ...data,
      location: data.location
        ? { ...prev.location, ...data.location }
        : prev.location,
    }));
  };

  const submitVerification = ({
    cpf,
    documentType,
    documentFileName,
    selfieFileName,
  }: {
    cpf: string;
    documentType: "rg" | "cnh" | "passaporte";
    documentFileName: string;
    selfieFileName: string;
  }) => {
    const updatedVerification: VerificationData = {
      status: "em_analise",
      cpf,
      documentType,
      documentFileName,
      selfieFileName,
      submittedAt: new Date().toLocaleString("pt-BR"),
    };

    setProfessionalProfile((prev) => ({
      ...prev,
      verification: updatedVerification,
      verified: false,
    }));
  };

  const setVerificationStatusDirectly = (
    status: VerificationStatus,
    reason?: string,
  ) => {
    if (reason) setRejectionReason(reason);
    setProfessionalProfile((prev) => ({
      ...prev,
      verification: {
        ...prev.verification,
        status,
        rejectionReason: status === "recusado" ? reason || rejectionReason : undefined,
      },
      verified: status === "verificado",
    }));
  };

  const loginAs = (type: AccountType) => {
    setAccountTypeState(type);
  };

  const registerProfessional = (data: Partial<ProfessionalUser>) => {
    setAccountTypeState("profissional");
    setProfessionalProfile((prev) => ({
      ...prev,
      ...data,
      id: `usr_${Date.now()}`,
      verified: false,
      verification: {
        status: "nao_verificado",
      },
    }));
  };

  const registerCompany = (data: Partial<CompanyUser>) => {
    setAccountTypeState("empresa");
    setCompanyProfile((prev) => ({
      ...prev,
      ...data,
      id: `comp_${Date.now()}`,
      verified: true,
    }));
  };

  return (
    <UserContext.Provider
      value={{
        accountType,
        setAccountType,
        professionalProfile,
        companyProfile,
        verificationStatus: professionalProfile.verification.status,
        rejectionReason,
        policiesAccepted,
        setPoliciesAccepted,
        notificationsEnabled,
        setNotificationsEnabled,
        updateProfessionalProfile,
        updateCompanyProfile,
        submitVerification,
        setVerificationStatusDirectly,
        loginAs,
        registerProfessional,
        registerCompany,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}


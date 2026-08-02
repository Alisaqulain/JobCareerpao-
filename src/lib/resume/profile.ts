import type { IUser } from "@/models/User";
import type { ResumeType } from "@/types";

export interface ResumePayload {
  resumeType: ResumeType;
  resumeUrl?: string;
  resumePublicId?: string;
  coverLetter?: string;
}

export interface ProfileSnapshot {
  name: string;
  email: string;
  phone: string;
  bio?: string;
  location?: string;
  address?: IUser["address"];
  languages: string[];
  skills: string[];
  education: IUser["education"];
  experience: IUser["experience"];
  profilePicture?: string;
  capturedAt: string;
}

export function buildProfileSnapshot(user: IUser): ProfileSnapshot {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    bio: user.bio,
    location: user.location,
    address: user.address,
    languages: user.languages || [],
    skills: user.skills || [],
    education: user.education || [],
    experience: user.experience || [],
    profilePicture: user.profilePicture,
    capturedAt: new Date().toISOString(),
  };
}

export function formatAddress(user: IUser): string {
  if (user.address) {
    return [
      user.address.line1,
      user.address.city,
      user.address.state,
      user.address.pincode,
      user.address.country || "India",
    ]
      .filter(Boolean)
      .join(", ");
  }
  return user.location || "";
}

export function isProfileReadyForApplication(user: IUser) {
  return Boolean(
    user.name?.trim() &&
      user.phone?.trim() &&
      user.skills?.length &&
      user.education?.length &&
      user.experience?.length
  );
}

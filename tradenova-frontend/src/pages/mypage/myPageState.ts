export type StoredProfile = {
  email: string | null;
  nickname: string | null;
};

export function readStoredProfile(storage: Pick<Storage, "getItem">): StoredProfile {
  return {
    email: storage.getItem("userEmail"),
    nickname: storage.getItem("userNickname"),
  };
}

export const accountFeatureAvailability = {
  profileEdit: false,
  passwordChange: false,
  accountDeletion: false,
  trainingHistory: false,
} as const;

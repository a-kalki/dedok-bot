export type UserData = {
  id: string,
  firstName: string,
  joinedAt?: string,
  username?: string,
  updatedAt?: string,
  invitedBy?: string,
};

export type RunMode = 'development' | 'production' | 'test';

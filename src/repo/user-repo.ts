import { USERS_FILE } from "../constants";
import type { UserData } from "../types";
import { JsonRepository } from "./json";

class UserRepo extends JsonRepository<UserData> {
  constructor() {
    super(USERS_FILE);
  }

  async updateOrSave(userData: UserData): Promise<void> {
    const existingUser = await this.get(userData.id);

    if (!existingUser) {
      userData.joinedAt = new Date().toISOString();
    } else {
      userData.joinedAt = existingUser.joinedAt;
      userData.updatedAt = new Date().toISOString();
    }

    await this.update(userData.id, userData);
  }

}

export const userRepo = new UserRepo();

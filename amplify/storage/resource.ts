import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  // Give your storage resource a name
  name: "realEstateStorage",

  // 'access' defines the folder path and permissions
  access: (allow) => ({
    "property-images/{entity_id}/*": [
      // Only the current authenticated user (with matching entity_id)
      // can read, write, or delete in their own folder.
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
  }),
});

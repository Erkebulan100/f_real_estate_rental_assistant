import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Property: a
    .model({
      title: a.string(),
      description: a.string(),
      location: a.string(),
      price: a.float(),
    })
    // This ensures only the record owner can read/update/delete.
    .authorization((allow) => [allow.owner()]),

  User: a
    .model({
      name: a.string(),
      email: a.string(),
      role: a.enum(["LANDLORD", "TENANT", "ADMIN"]),
      // Add more fields here if you want (e.g. phoneNumber)
    })
    // Only let the record owner read/write this record
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // uses Cognito to require sign-in
  },
});

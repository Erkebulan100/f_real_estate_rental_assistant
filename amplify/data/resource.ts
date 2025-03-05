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
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // uses Cognito to require sign-in
  },
});

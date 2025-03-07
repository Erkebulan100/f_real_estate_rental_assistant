import { Authenticator } from '@aws-amplify/ui-react';

export default function Dashboard() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {user?.username || user?.attributes?.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      )}
    </Authenticator>
  );
}

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import * as AWS from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

AWS.Amplify.configure(outputs);

const client = generateClient({
  authMode: 'userPool',
});

export default function LandingPage() {
  // 1) State to hold properties
  const [properties, setProperties] = useState([]);

  // 2) useEffect to fetch properties on load
  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const { data: items } = await client.models.Property.list();
      // For demonstration, let's just keep them as-is
      setProperties(items);
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Landing Page</h1>
      <p>Public view of property listings (minimal info)</p>

      {/* 3) Display minimal property info */}
      {properties.map((prop) => (
        <div
          key={prop.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "1rem",
            marginBottom: "1rem"
          }}
        >
          <h2>{prop.title}</h2>
          <p>Location: {prop.location}</p>
          <p>Price: ${prop.price}</p>
          {/* No contact or landlord details here */}
        </div>
      ))}
    </div>
  );
}

import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Image,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import * as AWS from 'aws-amplify';

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

AWS.Amplify.configure(outputs);
// Use the "Property" model instead of "Note"
const client = generateClient({
  authMode: "userPool",
});

export default function App() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    // Replaces client.models.Note.list() with client.models.Property.list()
    const { data: items } = await client.models.Property.list();
    // If there's an image, get its URL from Storage
    await Promise.all(
      items.map(async (prop) => {
        if (prop.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) =>
              `property-images/${identityId}/${prop.image}`,
          });
          prop.image = linkToStorageFile.url;
        }
        return prop;
      })
    );
    setProperties(items);
  }

  async function createProperty(event) {
    event.preventDefault();
    const form = new FormData(event.target);

    // 1) Get the current Cognito user
    const currentCognitoUser = await AWS.Auth.currentAuthenticatedUser();
    
    // 2) Find the matching record in your "User" model

    const userEmail = currentCognitoUser.attributes.email;
    const { data: matchedUsers } = await client.models.User.list({
      filter: {email: userEmail },
    });

    const landlordRecord = matchedUsers[0];

    // 3) If landlordRecord.role is not "LANDLORD", optionally warn or block 
    if (landlordRecord?.role !== "LANDLORD"){
      alert("Only LANDLORD can create properties");
      return;
    }

    // 4) Create the property, linking it to the landlord's ID
    const imageFile = form.get("image")?.name || ""; 

    const { data: newProp } = await client.models.Property.create({
      title: form.get("title"),
      description: form.get("description"),
      location: form.get("location"),
      price: parseFloat(form.get("price") || "0"), // parse the price input
      image: imageFile,
      landlordID: landlordRecord.id, // link to the user's ID
    });
    // 5) Upload image if any
    if (imageFile) {
      await uploadData({
        path: ({ identityId }) =>
          `property-images/${identityId}/${imageFile}`,
        data: form.get("image"),
      }).result;
    }

    // 6) Refresh the property list and reset the form
    fetchProperties();
    event.target.reset();
  }

  async function deleteProperty(property) {
    // The "id" of the property is required to delete it
    const { data: deletedProp } = await client.models.Property.delete({
      id: property.id,
    });
    console.log("Deleted property:", deletedProp);
    fetchProperties();
  }

    // 1) State to store the User list in memory
  const [users, setUsers] = useState([]);

  // 2) Create a new user with hardcoded sample data
  async function createUser() {
    try {
      const { data } = await client.models.User.create({
        name: "John Doe",
        email: "john@example.com",
        role: "TENANT",
      });
      console.log("Created user:", data);
    } catch (err) {
      console.error("Error creating user:", err);
    }
  }

  // 3) List all existing users
  async function listUsers() {
    try {
      const { data: userList } = await client.models.User.list();
      console.log("Users found:", userList);
      setUsers(userList);
    } catch (err) {
      console.error("Error listing users:", err);
    }
  }
  async function makeMeLandlord(){
    // 1. Get the currently signed in-user's email from Cognito 
    const currentUser = await AWS.Auth.currentAuthenticatedUser();
    const userEmail = currentUser.attributes.email;
    // 2. Create a new user record in Amplify Data with role = LANDLORD
    const { data: newUser } = await client.models.User.create({
      name: "Erkebulan",
      email: userEmail, // same email you are signed in with 
      role: "LANDLORD"
    });
    console.log("Created new landlord: ", newUser);
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
  
}



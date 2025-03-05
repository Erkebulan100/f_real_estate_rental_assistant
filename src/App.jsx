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
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

Amplify.configure(outputs);

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

    // "title" is the property name, "description" for property details
    const imageFile = form.get("image").name; // If no file selected, this is empty

    const { data: newProp } = await client.models.Property.create({
      title: form.get("title"),
      description: form.get("description"),
      location: form.get("location"),
      price: parseFloat(form.get("price") || "0"), // parse the price input
      image: imageFile,
    });

    if (newProp.image) {
      await uploadData({
        path: ({ identityId }) =>
          `property-images/${identityId}/${newProp.image}`,
        data: form.get("image"),
      }).result;
    }

    // Refresh the property list
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

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >
          <Heading level={1}>My Real Estate App</Heading>
          <View as="form" margin="3rem 0" onSubmit={createProperty}>
            <Flex direction="column" justifyContent="center" gap="2rem" padding="2rem">
              <TextField
                name="title"
                placeholder="Property Title"
                label="Property Title"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="description"
                placeholder="Property Description"
                label="Property Description"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="location"
                placeholder="Property Location"
                label="Property Location"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="price"
                placeholder="Monthly Rent Price"
                label="Monthly Rent Price"
                labelHidden
                variation="quiet"
                required
                type="number"
              />
              <View
                name="image"
                as="input"
                type="file"
                alignSelf={"end"}
                accept="image/png, image/jpeg"
              />
              <Button type="submit" variation="primary">
                Create Property
              </Button>
            </Flex>
          </View>
          <Divider />
          <Heading level={2}>Current Properties</Heading>
          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {properties.map((prop) => (
              <Flex
                key={prop.id || prop.title}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="2rem"
                border="1px solid #ccc"
                padding="2rem"
                borderRadius="5%"
                className="box"
              >
                <View>
                  <Heading level="3">{prop.title}</Heading>
                </View>
                <Text fontStyle="italic">
                  {prop.description} ({prop.location})
                </Text>
                <Text fontWeight="bold">${prop.price} / month</Text>
                {prop.image && (
                  <Image
                    src={prop.image}
                    alt={`Photo of ${prop.title}`}
                    style={{ width: 400 }}
                  />
                )}
                <Button variation="destructive" onClick={() => deleteProperty(prop)}>
                  Delete Property
                </Button>
              </Flex>
            ))}
          </Grid>
          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}

const express = require("express");
const app = express();
const { port } = require("./config");
const baseUrl = process.env.BASE_URL;

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

const { verifyToken } = require("./utils");

const { processChat } = require("./chatbot");

const {
  findDocuments,
  insertDocument,
  updateDocument,
  updateWithOperator,
  upsertDocument,
} = require("./db");

const _ = require("lodash");

const cors = require("cors");

app.use(
  cors({
    origin: baseUrl, // Nuxt URL
    credentials: true,
  }),
);


const http = require("http");

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on ${port}`);
});


app.post("/login", async (req, res) => {
  const { token } = req.body;
  verifyToken(token)
    .then(async (payload) => {
      if (payload) {
        console.log("Token is valid.");
        isUserExist = await findDocuments("users", { email: payload.email });
        console.log("User existence check:", isUserExist);
        if (isUserExist.length === 0) {
          console.log("User does not exist. Creating new user.");
          await createUser(
            _.omit(payload, [
              "aud",
              "azp",
              "email_verified",
              "hd",
              "iat",
              "nbf",
              "sub",
              "jti",
              "exp",
              "iss",
            ]),
          );
        }

        const charactersChat = await fetchChat(payload.email);
        res.status(200).json({ charactersChat });
      } else {
        console.log("Token is invalid.");
        res.status(401).send("Invalid token");
      }
    })
    .catch((error) => {
      console.error("Error verifying token:", error);
      res.status(500).send("Error verifying token");
    });
});

const fetchChat = async (email) => {
  return findDocuments("charactersChat", { email: email }).catch((error) => {
    console.error("Error fetching chats:", error);
    throw error;
  });
};

const createUser = async (userData) => {
  await insertDocument("users", userData)
    .then((result) => {
      console.log("User created with ID:", result.insertedId);
      addCharacter(userData.email, {
        name: "Persona AI",
        id: '7cf12ca4-ec00-46fd-a5b7-d908beff79b4',
        profilePicture:
          `${baseUrl}/_nuxt/assets/images/logo.png`,
        history: [
        ],
      })
    })
    .catch((error) => {
      console.error("Error creating user:", error);
      throw error;
    });
};

const addCharacter = async (email, characterData) => {
  const existingcharactersChat = await findDocuments("charactersChat", {
    email: email,
  });

  let updatedcharactersChat;
  if (existingcharactersChat.length > 0) {
    updatedcharactersChat = [...existingcharactersChat[0].characters, characterData];
    await updateDocument(
      "charactersChat",
      { email: email },
      { characters: updatedcharactersChat }
    );
  } else {
    updatedcharactersChat = [characterData];
    await insertDocument("charactersChat", {
      email: email,
      characters: updatedcharactersChat,
    });
  }

  return updatedcharactersChat;
}

app.post("/chat", async (req, res) => {
  verifyToken(req.headers.authorization.split(" ")[1])
    .then(async (payload) => {
      if (payload) {
        const characterId = req.body.characterId;
        const message = req.body.message;
        try {
          const existingcharactersChat = await findDocuments("charactersChat", {
            email: payload.email,
          });
          console.log("Existing characters chat:", existingcharactersChat);
          const selectedCharacter = existingcharactersChat?.[0]?.characters.find((char) => char.id === characterId);
          const response = await processChat(
            message,
            _.cloneDeep(selectedCharacter?.history) || [],
            selectedCharacter?.name,
            selectedCharacter?.description
          );
          const chatData = {
            email: payload.email,
            characters: existingcharactersChat?.[0]?.characters.map((char) => {
              if (char.id === characterId) {
                return {
                  ...char,
                  history: [
                    ...(char.history || []),
                    { role: "user", parts: [{ text: message }] },
                    { role: "model", parts: [{ text: response }] },
                  ],
                };
              }
              return char;
            }) || [],
          };
          await upsertDocument("charactersChat", { email: payload.email }, chatData);
          res.status(200).json({ message: response, characterId: characterId });
          
        } catch (error) {
          console.error("Error saving chat:", error);
          res.status(500).json({ success: false, error: "Error saving chat" });
        }
      } else {
        console.log("Token is invalid.");
        res.status(401).send("Invalid token");
      }
    })
    .catch((error) => {
      console.error("Error verifying token:", error);
      res.status(500).send("Error verifying token");
    });
});

app.post("/add-character", async (req, res) => {
  verifyToken(req.headers.authorization.split(" ")[1])
    .then(async (payload) => {
      if (payload) {
        console.log("Token is valid.");
        try {
          const characterData = req.body.character;
          const updatedcharactersChat = await addCharacter(payload.email, characterData);
          res.status(200).json({ characters: updatedcharactersChat });
        } catch (error) {
          console.error("Error adding character:", error);
          res
            .status(500)
            .json({ success: false, error: "Error adding character" });
        }
      } else {
        console.log("Token is invalid.");
        res.status(401).send("Invalid token");
      }
    })
    .catch((error) => {
      console.error("Error verifying token:", error);
      res.status(500).send("Error verifying token");
    });
});

app.post("/clear-chat", async (req, res) => {
  verifyToken(req.headers.authorization.split(" ")[1])
    .then(async (payload) => {
      if (payload) {
        console.log("Token is valid.");
        try {
          const characterId = req.body.characterId;
          await updateWithOperator(
            "charactersChat",
            {
              email: payload.email,
              "characters.id": characterId
            },
            {
              $unset: {
                "characters.$.history": ""
              }
            }
          );
          res.status(200).json({ success: true });
        } catch (error) {
          console.error("Error clearing chat:", error);
          res
            .status(500)
            .json({ success: false, error: "Error clearing chat" });
        }
      } else {
        console.log("Token is invalid.");
        res.status(401).send("Invalid token");
      }
    })
    .catch((error) => {
      console.error("Error verifying token:", error);
      res.status(500).send("Error verifying token");
    });
});

app.post("/delete-character", async (req, res) => {
  verifyToken(req.headers.authorization.split(" ")[1])
    .then(async (payload) => {
      if (payload) {
        console.log("Token is valid.");
        try {
          const characterId = req.body.characterId;
          await updateWithOperator(
            "charactersChat",
            {
              email: payload.email
            },
            {
              $pull: {
                characters: { id: characterId }
              }
            }
          );
          res.status(200).json({ success: true });
        } catch (error) {
          console.error("Error deleting character:", error);
          res
            .status(500)
            .json({ success: false, error: "Error deleting character" });
        }
      } else {
        console.log("Token is invalid.");
        res.status(401).send("Invalid token");
      }
    })
    .catch((error) => {
      console.error("Error verifying token:", error);
      res.status(500).send("Error verifying token");
    });
});

const express = require("express");
const app = express();
const { port } = require("./config");
const baseUrl = process.env.BASE_URL;
const defaultCharacterId = process.env.DEFAULT_CHARACTER_ID;


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
        id: defaultCharacterId,
        profilePicture:"data:image/jpeg;base64,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",
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

// Local test sessions use normal signed JWTs; no production authentication bypass.
import fs from "node:fs";
import jwt from "jsonwebtoken";
import { encode } from "next-auth/jwt";
const file = process.env.WORKSPACE_TEST_CONFIG;
if (!file)
  throw Error(
    "Set WORKSPACE_TEST_CONFIG to the isolated local runtime configuration.",
  );
const config = JSON.parse(fs.readFileSync(file));
if (
  config.NEXTAUTH_URL !== "http://localhost:3100" ||
  !config.DATABASE_URL.endsWith("/workspace_test")
)
  throw Error("Use only the isolated local test environment.");
const actors = [];
for (const [id, name] of [
  ["901", "Alice"],
  ["902", "Bob"],
  ["903", "Eve"],
]) {
  const email = `${name.toLowerCase()}@workspace.test`,
    accessToken = jwt.sign(
      { user_id: Number(id), email, roles: ["ROLE_MEMBER"] },
      config.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "2h" },
    );
  const cookie = await encode({
    secret: config.NEXTAUTH_SECRET,
    token: {
      sub: id,
      name,
      email,
      role: "ROLE_MEMBER",
      accessToken,
      accessTokenExpires: Date.now() + 7200000,
      user: { name, email },
    },
    maxAge: 7200,
  });
  actors.push({ id, name, email, accessToken, cookie });
}
fs.writeFileSync(
  new URL("browser-sessions.json", `file:///${file.replaceAll("\\", "/")}`),
  JSON.stringify(actors),
);
console.log("Created three isolated browser test sessions.");

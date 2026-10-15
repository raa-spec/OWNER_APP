import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    Credentials({
      name: "Credentials",

      credentials: {
        identifier: {
          label: "Email or Phone",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        try {
          const client = await clientPromise;
          const db = client.db("rahul");
          const users = db.collection("users");

          const user = await users.findOne({
            $or: [
              {
                email: credentials.identifier,
              },
              {
                phone: credentials.identifier,
              },
            ],
          });

          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const client = await clientPromise;
          const db = client.db("rahul");
          const users = db.collection("users");

          const existingUser = await users.findOne({
            email: user.email,
          });

          if (existingUser) {
            user.id = existingUser._id.toString();
            user.name = existingUser.name;
            user.email = existingUser.email;
            user.phone = existingUser.phone;
            user.role = existingUser.role || "owner";
            user.category = existingUser.business_category || "saloon";
            user.isConfigured = !!existingUser.is_configured;
            return true;
          }

          const businessId = `biz_saloon_${Math.floor(1000 + Math.random() * 9000)}`;
          await users.insertOne({
            name: user.name,
            email: user.email,
            phone: "",
            password: "",
            role: "owner",
            business_id: businessId,
            business_name: `${user.name}'s Business`,
            business_category: "saloon",
            is_configured: false,
            createdAt: new Date(),
          });

          user.role = "owner";
          user.category = "saloon";
          user.isConfigured = false;

          return true;
        } catch (error) {
          console.error("Google authentication error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.phone = user.phone;
        token.role = user.role || "owner";
        token.category = user.category || "saloon";
        token.isConfigured = user.isConfigured ?? false;
      }
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.phone !== undefined) token.phone = session.phone;
        if (session.category !== undefined) token.category = session.category;
        if (session.isConfigured !== undefined) token.isConfigured = session.isConfigured;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.phone = token.phone;
        session.user.role = token.role || "owner";
        session.user.category = token.category || "saloon";
        session.user.isConfigured = token.isConfigured ?? false;
      }
      return session;
    },
  },

  pages: {
    signIn: "/owner/login",
  },

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "zeric-auth-secret-key-2026",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

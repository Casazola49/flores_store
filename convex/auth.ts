import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

// Helper para generar token aleatorio (Web Crypto API disponible en Convex)
function generateToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join("");
}

// Iniciar sesión
export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!user || !user.is_active) {
      return { success: false, message: "Usuario no encontrado o inactivo" };
    }

    const isValid = bcrypt.compareSync(args.password, user.password_hash);
    if (!isValid) {
      return { success: false, message: "Contraseña incorrecta" };
    }

    // Limpiar sesiones antiguas para este usuario
    const oldSessions = await ctx.db
      .query("admin_sessions")
      .collect();
    for (const session of oldSessions) {
      if (session.username === user.username) {
        await ctx.db.delete(session._id);
      }
    }

    // Crear nueva sesión (8 horas de validez)
    const token = generateToken();
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 horas

    await ctx.db.insert("admin_sessions", {
      token,
      username: user.username,
      expires_at: expiresAt,
    });

    return {
      success: true,
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  },
});

// Cerrar sesión
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

// Validar token y retornar usuario
export const me = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expires_at < Date.now()) {
      return { success: false, user: null };
    }

    const user = await ctx.db
      .query("admin_users")
      .withIndex("by_username", (q) => q.eq("username", session.username))
      .unique();

    if (!user || !user.is_active) {
      return { success: false, user: null };
    }

    return {
      success: true,
      user: {
        username: user.username,
        role: user.role,
      },
    };
  },
});

// Función auxiliar interna para verificar autenticación en otras mutaciones
export async function checkAuth(db: any, token: string) {
  const session = await db
    .query("admin_sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();

  if (!session || session.expires_at < Date.now()) {
    throw new Error("No autorizado: Sesión inválida o expirada");
  }
  return session;
}

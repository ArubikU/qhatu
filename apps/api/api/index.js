"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/infrastructure/db/prisma.ts
var prisma_exports = {};
__export(prisma_exports, {
  prisma: () => prisma
});
var import_client, globalForPrisma, prisma;
var init_prisma = __esm({
  "src/infrastructure/db/prisma.ts"() {
    "use strict";
    import_client = require("@prisma/client");
    globalForPrisma = globalThis;
    prisma = globalForPrisma.prisma ?? new import_client.PrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  }
});

// src/infrastructure/email/templates/layout.ts
function assetBase() {
  return (process.env.EMAIL_ASSET_BASE || process.env.FRONTEND_URL || "https://qhatu.app").replace(/\/$/, "");
}
function preheader(text) {
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;color:transparent;height:0;width:0;">${text}</div>`;
}
function button(label, url) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td align="center" bgcolor="${C.primary}" style="border-radius:999px;background:linear-gradient(135deg,${C.primary},${C.deep});">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:15px;font-weight:600;
                  color:${C.white};text-decoration:none;border-radius:999px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}
function codeBox(code) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:8px 0 4px;">
        <div style="display:inline-block;background:${C.bg};border:1px solid ${C.border};border-radius:16px;
                    padding:20px 28px;font-family:${FONT};font-size:38px;font-weight:700;letter-spacing:10px;
                    color:${C.lavender};">
          ${code}
        </div>
      </td>
    </tr>
  </table>`;
}
function paragraph(html) {
  return `<p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${C.muted};">${html}</p>`;
}
function heading(text) {
  return `<h1 style="margin:0 0 12px;font-family:${FONT};font-size:22px;font-weight:700;color:${C.white};">${text}</h1>`;
}
function note(html) {
  return `<p style="margin:16px 0 0;font-family:${FONT_BODY};font-size:12px;line-height:1.5;color:${C.faint};">${html}</p>`;
}
function layout({ title, preview, body }) {
  const base = assetBase();
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:${C.bg};">
  ${preheader(preview)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Header / logo -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${base}" target="_blank" style="text-decoration:none;">
                <img src="${base}/logotipo.png" alt="Qhatu" height="28"
                     style="height:28px;width:auto;border:0;outline:none;display:block;">
              </a>
            </td>
          </tr>
        </table>

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:480px;background-color:${C.card};border:1px solid ${C.border};border-radius:24px;">
          <tr>
            <td style="padding:32px 28px;">
              ${body}
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td align="center" style="padding:24px 16px 0;">
              <p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:12px;color:${C.faint};">
                Qhatu \u2014 la red social an\xF3nima de tu universidad
              </p>
              <p style="margin:0;font-family:${FONT_BODY};font-size:11px;color:${C.faint};">
                100% an\xF3nimo \xB7 Nunca compartimos tu correo
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
var C, FONT, FONT_BODY, COLORS;
var init_layout = __esm({
  "src/infrastructure/email/templates/layout.ts"() {
    "use strict";
    C = {
      bg: "#0F0D17",
      card: "#15121F",
      border: "#2A2438",
      primary: "#7B3FF2",
      deep: "#4B17B6",
      lavender: "#C8B6FF",
      white: "#FFFFFF",
      muted: "#9B95AB",
      faint: "#6B6578"
    };
    FONT = `'Poppins','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
    FONT_BODY = `'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
    COLORS = C;
  }
});

// src/infrastructure/email/templates/index.ts
var templates_exports = {};
__export(templates_exports, {
  accountDeletionEmail: () => accountDeletionEmail,
  emailChangeEmail: () => emailChangeEmail,
  otpEmail: () => otpEmail,
  qrLoginEmail: () => qrLoginEmail,
  securityAlertEmail: () => securityAlertEmail,
  welcomeEmail: () => welcomeEmail
});
function otpEmail(otp) {
  return {
    subject: "Tu c\xF3digo de acceso Qhatu",
    html: layout({
      title: "Tu c\xF3digo de acceso",
      preview: `Tu c\xF3digo es ${otp} \u2014 v\xE1lido por 15 minutos`,
      body: `
        ${heading("Verifica tu correo")}
        ${paragraph('Usa este c\xF3digo para entrar a Qhatu. Vence en <strong style="color:#C8B6FF;">15 minutos</strong>.')}
        ${codeBox(otp)}
        ${note("Si no solicitaste este c\xF3digo, ignora este correo. Nadie m\xE1s puede usarlo.")}
      `
    }),
    text: `Tu c\xF3digo de acceso Qhatu: ${otp}
V\xE1lido por 15 minutos. Si no lo solicitaste, ignora este correo.`
  };
}
function welcomeEmail(nickname) {
  const url = (process.env.FRONTEND_URL ?? "https://qhatu.app") + "/feed";
  return {
    subject: `Bienvenid@ a Qhatu, ${nickname}`,
    html: layout({
      title: "Bienvenid@ a Qhatu",
      preview: `Tu identidad an\xF3nima es ${nickname}`,
      body: `
        ${heading("\xA1Ya eres parte de Qhatu!")}
        ${paragraph(`Tu identidad an\xF3nima en el campus es <strong style="color:#C8B6FF;">${nickname}</strong>. Nadie sabe qui\xE9n eres detr\xE1s de ella.`)}
        ${paragraph("Comparte chismes, opiniones y encuestas con total anonimato. Reacciona, comenta y sigue lo que te interesa.")}
        <div style="margin:24px 0 4px;">${button("Ir a mi feed", url)}</div>
        ${note("Tu correo institucional solo se us\xF3 para verificar que perteneces a tu universidad. Lo guardamos cifrado y jam\xE1s se muestra.")}
      `
    }),
    text: `\xA1Bienvenid@ a Qhatu! Tu identidad an\xF3nima es ${nickname}. Entra: ${url}`
  };
}
function qrLoginEmail(params) {
  const { code, device = "un dispositivo", expiresMin = 2 } = params;
  return {
    subject: "Confirma tu inicio de sesi\xF3n en Qhatu",
    html: layout({
      title: "Confirma tu inicio de sesi\xF3n",
      preview: `C\xF3digo ${code} \u2014 confirma el acceso desde ${device}`,
      body: `
        ${heading("Inicio de sesi\xF3n con QR")}
        ${paragraph(`Alguien escane\xF3 tu c\xF3digo QR para entrar desde <strong style="color:#C8B6FF;">${device}</strong>. Si fuiste t\xFA, confirma con este c\xF3digo:`)}
        ${codeBox(code)}
        ${note(`El c\xF3digo QR se renueva cada pocos segundos por seguridad. Este c\xF3digo vence en ${expiresMin} minutos.<br><br><strong style="color:#C8B6FF;">\xBFNo fuiste t\xFA?</strong> No ingreses el c\xF3digo y cambia el acceso de tu cuenta de inmediato.`)}
      `
    }),
    text: `Confirma tu inicio de sesi\xF3n en Qhatu desde ${device}. C\xF3digo: ${code} (vence en ${expiresMin} min). Si no fuiste t\xFA, ign\xF3ralo.`
  };
}
function securityAlertEmail(params) {
  const { when, device = "dispositivo desconocido", location = "ubicaci\xF3n desconocida" } = params;
  const url = (process.env.FRONTEND_URL ?? "https://qhatu.app") + "/profile";
  return {
    subject: "Nuevo inicio de sesi\xF3n en tu cuenta Qhatu",
    html: layout({
      title: "Nuevo inicio de sesi\xF3n",
      preview: `Acceso detectado: ${device} \xB7 ${when}`,
      body: `
        ${heading("Nuevo inicio de sesi\xF3n")}
        ${paragraph("Detectamos un acceso a tu cuenta:")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
          ${row("Cu\xE1ndo", when)}
          ${row("Dispositivo", device)}
          ${row("Ubicaci\xF3n", location)}
        </table>
        <div style="margin:24px 0 4px;">${button("Revisar mi cuenta", url)}</div>
        ${note("Si fuiste t\xFA, no necesitas hacer nada. Si no reconoces este acceso, cierra todas las sesiones desde tu perfil.")}
      `
    }),
    text: `Nuevo inicio de sesi\xF3n en Qhatu. Cu\xE1ndo: ${when}. Dispositivo: ${device}. Ubicaci\xF3n: ${location}. Revisa: ${url}`
  };
}
function emailChangeEmail(otp) {
  return {
    subject: "Confirma el cambio de tu correo Qhatu",
    html: layout({
      title: "Confirma el cambio de correo",
      preview: `C\xF3digo ${otp} para confirmar tu nuevo correo`,
      body: `
        ${heading("Confirma tu nuevo correo")}
        ${paragraph("Recibimos una solicitud para cambiar el correo institucional de tu cuenta. Ingresa este c\xF3digo para confirmar:")}
        ${codeBox(otp)}
        ${note("Si no solicitaste este cambio, ignora este correo y tu cuenta seguir\xE1 igual.")}
      `
    }),
    text: `Confirma el cambio de correo Qhatu con el c\xF3digo: ${otp}. Si no lo solicitaste, ign\xF3ralo.`
  };
}
function accountDeletionEmail(confirmUrl) {
  return {
    subject: "Confirma la eliminaci\xF3n de tu cuenta Qhatu",
    html: layout({
      title: "Eliminar cuenta",
      preview: "Confirma que quieres eliminar tu cuenta Qhatu",
      body: `
        ${heading("\xBFEliminar tu cuenta?")}
        ${paragraph('Esto borrar\xE1 tu identidad an\xF3nima, posts, reacciones y todo tu historial. <strong style="color:#C8B6FF;">No se puede deshacer.</strong>')}
        <div style="margin:24px 0 4px;">${button("Confirmar eliminaci\xF3n", confirmUrl)}</div>
        ${note("Si no solicitaste esto, ignora este correo. Tu cuenta no se tocar\xE1.")}
      `
    }),
    text: `Confirma la eliminaci\xF3n de tu cuenta Qhatu: ${confirmUrl}. Si no lo solicitaste, ign\xF3ralo.`
  };
}
function row(label, value) {
  return `
    <tr>
      <td style="padding:6px 0;font-family:'Inter',Arial,sans-serif;font-size:13px;color:${COLORS.faint};width:110px;">${label}</td>
      <td style="padding:6px 0;font-family:'Inter',Arial,sans-serif;font-size:13px;color:${COLORS.white};">${value}</td>
    </tr>`;
}
var init_templates = __esm({
  "src/infrastructure/email/templates/index.ts"() {
    "use strict";
    init_layout();
  }
});

// src/serverless.ts
var serverless_exports = {};
__export(serverless_exports, {
  default: () => handler
});
module.exports = __toCommonJS(serverless_exports);

// src/app.ts
var import_fastify = __toESM(require("fastify"));
var import_cors = __toESM(require("@fastify/cors"));
var import_cookie = __toESM(require("@fastify/cookie"));
var import_jwt = __toESM(require("@fastify/jwt"));
var import_sensible = __toESM(require("@fastify/sensible"));
var import_rate_limit = __toESM(require("@fastify/rate-limit"));

// src/routes/auth.ts
var import_zod_to_json_schema = require("zod-to-json-schema");
var import_zod6 = require("zod");

// ../../packages/shared/src/schemas/auth.ts
var import_zod = require("zod");
var RegisterSchema = import_zod.z.object({
  email: import_zod.z.string().email().toLowerCase().trim()
});
var VerifyOtpSchema = import_zod.z.object({
  email: import_zod.z.string().email().toLowerCase().trim(),
  otp: import_zod.z.string().length(6).regex(/^\d{6}$/)
});
var RefreshTokenSchema = import_zod.z.object({
  refreshToken: import_zod.z.string().min(1)
});
var PushSubscriptionSchema = import_zod.z.object({
  subscription: import_zod.z.string().min(1)
  // JSON serialized PushSubscription
});

// ../../packages/shared/src/schemas/post.ts
var import_zod3 = require("zod");

// ../../packages/shared/src/embedding.ts
var import_zod2 = require("zod");
var EMBEDDING_DIM = 384;
var EmbeddingSchema = import_zod2.z.array(import_zod2.z.number().finite()).length(EMBEDDING_DIM);
function isValidEmbedding(v) {
  return Array.isArray(v) && v.length === EMBEDDING_DIM && v.every((n) => typeof n === "number" && Number.isFinite(n));
}

// ../../packages/shared/src/schemas/post.ts
var MAX_POST_CHARS = 1e3;
var CreatePostSchema = import_zod3.z.object({
  content: import_zod3.z.string().max(MAX_POST_CHARS).default(""),
  type: import_zod3.z.enum(["TEXT", "POLL", "EPHEMERAL"]).default("TEXT"),
  isIdentityRevealed: import_zod3.z.boolean().default(false),
  poll: import_zod3.z.object({
    question: import_zod3.z.string().min(1).max(200),
    options: import_zod3.z.array(import_zod3.z.string().min(1).max(100)).min(2).max(4)
  }).optional(),
  // Up to 6 items (≤5 images, ≤1 video). Count rules enforced in use case.
  media: import_zod3.z.array(import_zod3.z.object({
    key: import_zod3.z.string().min(1),
    type: import_zod3.z.enum(["IMAGE", "VIDEO"])
  })).max(6).optional(),
  // Client-computed semantic embedding (384-dim, on-device WebGPU/WASM). Optional.
  embedding: EmbeddingSchema.optional()
}).refine(
  (d) => d.content.trim().length > 0 || (d.media?.length ?? 0) > 0 || !!d.poll,
  { message: "El post debe tener texto, media o una encuesta." }
);
var FeedQuerySchema = import_zod3.z.object({
  tab: import_zod3.z.enum(["for-you", "trending", "recent", "following"]).default("for-you"),
  cursor: import_zod3.z.string().optional(),
  faculty: import_zod3.z.string().optional(),
  gender: import_zod3.z.enum(["M", "F", "UNSPECIFIED"]).optional(),
  ageRange: import_zod3.z.enum(["R18_20", "R21_23", "R24_PLUS"]).optional(),
  type: import_zod3.z.enum(["TEXT", "POLL", "EPHEMERAL"]).optional()
});
var CreateCommentSchema = import_zod3.z.object({
  content: import_zod3.z.string().min(1).max(300)
});
var ReactSchema = import_zod3.z.object({
  type: import_zod3.z.enum(["LIKE", "FIRE", "TEA", "DED"])
});
var PollVoteSchema = import_zod3.z.object({
  optionId: import_zod3.z.string().uuid()
});
var SearchQuerySchema = import_zod3.z.object({
  q: import_zod3.z.string().min(1).max(100),
  cursor: import_zod3.z.string().optional()
});

// ../../packages/shared/src/schemas/user.ts
var import_zod4 = require("zod");
var UpdateProfileSchema = import_zod4.z.object({
  nickname: import_zod4.z.string().min(3).max(30).regex(/^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+$/).optional(),
  faculty: import_zod4.z.string().max(50).optional(),
  gender: import_zod4.z.enum(["M", "F", "UNSPECIFIED"]).optional(),
  ageRange: import_zod4.z.enum(["R18_20", "R21_23", "R24_PLUS"]).optional()
});
var FollowSchema = import_zod4.z.object({
  targetNickname: import_zod4.z.string().min(3).max(30).optional(),
  targetHashtagId: import_zod4.z.string().uuid().optional()
}).refine((d) => d.targetNickname || d.targetHashtagId, {
  message: "Must provide either targetNickname or targetHashtagId"
});
var BlockSchema = import_zod4.z.object({
  targetNickname: import_zod4.z.string().min(3).max(30)
});

// ../../packages/shared/src/schemas/media.ts
var import_zod5 = require("zod");
var MEDIA_LIMITS = {
  maxImages: 5,
  // up to 5 images per post
  maxVideos: 1,
  // up to 1 video per post
  maxItems: 6,
  // hard ceiling (5 images + 1 video)
  image: {
    maxBytes: 5 * 1024 * 1024,
    // 5 MB
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    extensions: ["jpg", "jpeg", "png", "webp", "gif"]
  },
  video: {
    maxBytes: 50 * 1024 * 1024,
    // 50 MB
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
    extensions: ["mp4", "webm", "mov"]
  }
};
function mimeToKind(mime) {
  if (MEDIA_LIMITS.image.mimeTypes.includes(mime)) return "image";
  if (MEDIA_LIMITS.video.mimeTypes.includes(mime)) return "video";
  return null;
}
var PresignUploadSchema = import_zod5.z.object({
  contentType: import_zod5.z.string().min(1),
  size: import_zod5.z.number().int().positive()
});
function validateUpload(contentType, size) {
  const kind = mimeToKind(contentType);
  if (!kind) throw new Error(`Tipo de archivo no permitido: ${contentType}`);
  const limit = MEDIA_LIMITS[kind];
  if (size > limit.maxBytes) {
    const mb = (limit.maxBytes / 1024 / 1024).toFixed(0);
    throw new Error(`Archivo demasiado grande. M\xE1ximo ${mb} MB para ${kind === "image" ? "im\xE1genes" : "videos"}.`);
  }
  return kind;
}
var MediaItemSchema = import_zod5.z.object({
  key: import_zod5.z.string().min(1),
  type: import_zod5.z.enum(["IMAGE", "VIDEO"])
});
function validateMediaSet(items) {
  if (items.length === 0) return;
  if (items.length > MEDIA_LIMITS.maxItems) {
    throw new Error(`M\xE1ximo ${MEDIA_LIMITS.maxItems} archivos por post.`);
  }
  const images = items.filter((i) => i.type === "IMAGE").length;
  const videos = items.filter((i) => i.type === "VIDEO").length;
  if (images > MEDIA_LIMITS.maxImages) {
    throw new Error(`M\xE1ximo ${MEDIA_LIMITS.maxImages} im\xE1genes por post.`);
  }
  if (videos > MEDIA_LIMITS.maxVideos) {
    throw new Error(`M\xE1ximo ${MEDIA_LIMITS.maxVideos} video por post.`);
  }
}

// ../../packages/shared/src/rewards.ts
var RARITY_COLOR = {
  COMMON: "#9B95AB",
  RARE: "#4DA3FF",
  EPIC: "#B14DFF",
  LEGENDARY: "#FFB23E",
  MYTHIC: "#FF4D6D"
};
var RARITY_ORDER = {
  COMMON: 0,
  RARE: 1,
  EPIC: 2,
  LEGENDARY: 3,
  MYTHIC: 4
};
var FRAME_DEFS = [
  { variant: "ring", name: "Aro Simple", rarity: "COMMON", unlock: { type: "DEFAULT" }, colors: ["#9B95AB"] },
  { variant: "ring", name: "Aro Lavanda", rarity: "COMMON", unlock: { type: "POSTS", threshold: 1 }, colors: ["#C8B6FF"] },
  { variant: "dashed", name: "Aro Punteado", rarity: "COMMON", unlock: { type: "POSTS", threshold: 5 }, colors: ["#7B3FF2"] },
  { variant: "double", name: "Doble Aro", rarity: "RARE", unlock: { type: "POSTS", threshold: 20 }, colors: ["#7B3FF2", "#C8B6FF"] },
  { variant: "glow", name: "Aro Brillante", rarity: "RARE", unlock: { type: "LIKES", threshold: 50 }, colors: ["#7B3FF2"] },
  { variant: "neon", name: "Ne\xF3n Cian", rarity: "RARE", unlock: { type: "LIKES", threshold: 100 }, colors: ["#00E5FF"] },
  { variant: "neon", name: "Ne\xF3n Rosa", rarity: "RARE", unlock: { type: "FOLLOWERS", threshold: 10 }, colors: ["#FF4DA6"] },
  { variant: "andean", name: "Marco Andino", rarity: "EPIC", unlock: { type: "STREAK", threshold: 14 }, colors: ["#FF8A3D", "#7B3FF2"] },
  { variant: "fire", name: "Marco de Fuego", rarity: "EPIC", unlock: { type: "STREAK", threshold: 30 }, colors: ["#FF6B00", "#FFB23E"], animated: true },
  { variant: "ice", name: "Marco de Hielo", rarity: "EPIC", unlock: { type: "LIKES", threshold: 500 }, colors: ["#9BE5FF", "#4DA3FF"] },
  { variant: "leaves", name: "Marco Sakura", rarity: "EPIC", unlock: { type: "FOLLOWERS", threshold: 50 }, colors: ["#FFB6D9", "#FF7AB6"] },
  { variant: "gold", name: "Marco Dorado", rarity: "LEGENDARY", unlock: { type: "LIKES", threshold: 1e3 }, colors: ["#FFD700", "#FFB23E"], animated: true },
  { variant: "cosmic", name: "Marco C\xF3smico", rarity: "LEGENDARY", unlock: { type: "STREAK", threshold: 100 }, colors: ["#7B3FF2", "#00E5FF", "#FF4DA6"], animated: true },
  { variant: "glitch", name: "Marco Glitch", rarity: "LEGENDARY", unlock: { type: "RANKING", threshold: 3 }, colors: ["#FF4D6D", "#00E5FF"], animated: true },
  { variant: "crown", name: "Marco Real", rarity: "MYTHIC", unlock: { type: "RANKING", threshold: 1 }, colors: ["#FFD700", "#FF4D6D"], animated: true },
  { variant: "aurora", name: "Aurora", rarity: "MYTHIC", unlock: { type: "STREAK", threshold: 365 }, colors: ["#00E5FF", "#7B3FF2", "#FF4DA6", "#FFB23E"], animated: true },
  // — extra —
  { variant: "dashed", name: "Aro Cian", rarity: "COMMON", unlock: { type: "COMMENTS", threshold: 5 }, colors: ["#00E5FF"] },
  { variant: "glow", name: "Esmeralda", rarity: "RARE", unlock: { type: "COMMENTS", threshold: 80 }, colors: ["#3DFF8A"] },
  { variant: "neon", name: "Ne\xF3n Oro", rarity: "RARE", unlock: { type: "POSTS", threshold: 40 }, colors: ["#FFD700"] },
  { variant: "double", name: "Doble Rosa", rarity: "RARE", unlock: { type: "FOLLOWERS", threshold: 20 }, colors: ["#FF4DA6", "#FFC36F"] },
  { variant: "ice", name: "Escarcha", rarity: "EPIC", unlock: { type: "STREAK", threshold: 21 }, colors: ["#C8B6FF", "#7B3FF2"] },
  { variant: "fire", name: "Fuego Azul", rarity: "EPIC", unlock: { type: "LIKES", threshold: 750 }, colors: ["#00E5FF", "#4D7BFF"], animated: true },
  { variant: "leaves", name: "Oto\xF1o", rarity: "EPIC", unlock: { type: "POSTS", threshold: 200 }, colors: ["#FF8A3D", "#FFB23E"] },
  { variant: "cosmic", name: "Nebulosa", rarity: "LEGENDARY", unlock: { type: "LIKES", threshold: 4e3 }, colors: ["#3DFF8A", "#00E5FF", "#7B3FF2"], animated: true },
  { variant: "aurora", name: "Eclipse", rarity: "MYTHIC", unlock: { type: "STREAK", threshold: 300 }, colors: ["#B14DFF", "#FF4DA6", "#00E5FF", "#FFD700"], animated: true }
];
var NAME_DEFS = [
  { variant: "plain", name: "Normal", rarity: "COMMON", unlock: { type: "DEFAULT" }, colors: ["#FFFFFF"] },
  { variant: "gradient", name: "Degradado Qhatu", rarity: "COMMON", unlock: { type: "POSTS", threshold: 3 }, colors: ["#7B3FF2", "#C8B6FF"] },
  { variant: "gradient", name: "Lavanda", rarity: "COMMON", unlock: { type: "POSTS", threshold: 8 }, colors: ["#C8B6FF", "#E9E1FF"] },
  { variant: "glow", name: "Brillo Lavanda", rarity: "RARE", unlock: { type: "LIKES", threshold: 25 }, colors: ["#C8B6FF"], animated: true },
  { variant: "gradient", name: "Atardecer", rarity: "RARE", unlock: { type: "POSTS", threshold: 50 }, colors: ["#FF8A3D", "#FF4DA6"] },
  { variant: "gradient", name: "Oc\xE9ano", rarity: "RARE", unlock: { type: "COMMENTS", threshold: 50 }, colors: ["#00E5FF", "#4DA3FF"] },
  { variant: "gradient", name: "Caramelo", rarity: "RARE", unlock: { type: "FOLLOWERS", threshold: 5 }, colors: ["#FF6FD8", "#FFC36F"] },
  { variant: "gradient", name: "Menta", rarity: "RARE", unlock: { type: "COMMENTS", threshold: 120 }, colors: ["#3DFFC2", "#7BFFE3"] },
  { variant: "shadow", name: "Sombra", rarity: "RARE", unlock: { type: "EPHEMERAL", threshold: 5 }, colors: ["#B9B3C7"] },
  { variant: "fire", name: "Fuego", rarity: "EPIC", unlock: { type: "STREAK", threshold: 30 }, colors: ["#FF6B00", "#FFD700"], animated: true },
  { variant: "gradient", name: "T\xF3xico", rarity: "EPIC", unlock: { type: "COMMENTS", threshold: 200 }, colors: ["#9BFF3D", "#3DFF8A"] },
  { variant: "rainbow", name: "Arco\xEDris", rarity: "EPIC", unlock: { type: "FOLLOWERS", threshold: 25 }, colors: [], animated: true },
  { variant: "glow", name: "Ne\xF3n Cian", rarity: "EPIC", unlock: { type: "LIKES", threshold: 500 }, colors: ["#00E5FF"], animated: true },
  { variant: "glow", name: "Ne\xF3n Rosa", rarity: "EPIC", unlock: { type: "FOLLOWERS", threshold: 40 }, colors: ["#FF4DA6"], animated: true },
  { variant: "gradient", name: "Galaxia", rarity: "EPIC", unlock: { type: "STREAK", threshold: 45 }, colors: ["#7B3FF2", "#00E5FF", "#FF4DA6"] },
  { variant: "chrome", name: "Cromo", rarity: "EPIC", unlock: { type: "POSTS", threshold: 150 }, colors: ["#E8E8F0", "#9BA3B5"], animated: true },
  { variant: "glitch", name: "Glitch", rarity: "LEGENDARY", unlock: { type: "RANKING", threshold: 3 }, colors: ["#FF4D6D", "#00E5FF"], animated: true },
  { variant: "gold", name: "Oro L\xEDquido", rarity: "LEGENDARY", unlock: { type: "LIKES", threshold: 2e3 }, colors: ["#FFD700", "#FFB23E"], animated: true },
  { variant: "matrix", name: "Matrix", rarity: "LEGENDARY", unlock: { type: "STREAK", threshold: 100 }, colors: ["#00FF66"], animated: true },
  { variant: "gradient", name: "Lava", rarity: "LEGENDARY", unlock: { type: "LIKES", threshold: 3500 }, colors: ["#FF3D00", "#FFC400"], animated: true },
  { variant: "holo", name: "Holograma", rarity: "MYTHIC", unlock: { type: "RANKING", threshold: 1 }, colors: ["#7B3FF2", "#00E5FF", "#FF4DA6"], animated: true },
  { variant: "blood", name: "Sangre", rarity: "MYTHIC", unlock: { type: "SPECIAL" }, colors: ["#FF1A3C", "#8B0000"], animated: true },
  { variant: "holo", name: "Prisma", rarity: "MYTHIC", unlock: { type: "STREAK", threshold: 200 }, colors: ["#FF4DA6", "#9BFF3D", "#00E5FF"], animated: true }
];
var STREAK_DEFS = [
  { days: 3, name: "Chispa", style: "ember", colors: ["#FFB23E", "#FF8A3D"] },
  { days: 7, name: "Llama", style: "flame", colors: ["#FF8A3D", "#FF4D00"] },
  { days: 14, name: "Fogata", style: "fire", colors: ["#FF4D00", "#FF1A3C"] },
  { days: 30, name: "Brasa Viva", style: "blaze", colors: ["#FF4DA6", "#FF6B00"] },
  { days: 60, name: "Azul Vivo", style: "azure", colors: ["#00E5FF", "#4D7BFF"] },
  { days: 100, name: "Oro Ardiente", style: "gold", colors: ["#FFD700", "#FFB23E"] },
  { days: 150, name: "Esmeralda", style: "emerald", colors: ["#3DFF8A", "#00C46A"] },
  { days: 200, name: "Magenta", style: "magenta", colors: ["#FF4DA6", "#B14DFF"] },
  { days: 300, name: "C\xF3smico", style: "cosmic", colors: ["#7B3FF2", "#00E5FF", "#FF4DA6"] },
  { days: 365, name: "F\xE9nix", style: "phoenix", colors: ["#FFD700", "#FF4D00", "#FF1A3C"] }
];
function streakRarity(days) {
  if (days >= 300) return "MYTHIC";
  if (days >= 100) return "LEGENDARY";
  if (days >= 30) return "EPIC";
  if (days >= 7) return "RARE";
  return "COMMON";
}
var BADGE_DEFS = [
  { variant: "spark", name: "Primer Post", description: "Publicaste tu primer post", rarity: "COMMON", unlock: { type: "POSTS", threshold: 1 } },
  { variant: "pen", name: "Escritor", description: "10 posts publicados", rarity: "COMMON", unlock: { type: "POSTS", threshold: 10 } },
  { variant: "pen", name: "Prol\xEDfico", description: "100 posts publicados", rarity: "RARE", unlock: { type: "POSTS", threshold: 100 } },
  { variant: "pen", name: "Imparable", description: "500 posts publicados", rarity: "EPIC", unlock: { type: "POSTS", threshold: 500 } },
  { variant: "heart", name: "Querido", description: "10 likes recibidos", rarity: "COMMON", unlock: { type: "LIKES", threshold: 10 } },
  { variant: "heart", name: "Popular", description: "100 likes recibidos", rarity: "RARE", unlock: { type: "LIKES", threshold: 100 } },
  { variant: "heart", name: "Idolatrado", description: "1000 likes recibidos", rarity: "EPIC", unlock: { type: "LIKES", threshold: 1e3 } },
  { variant: "heart", name: "Fen\xF3meno", description: "5000 likes recibidos", rarity: "LEGENDARY", unlock: { type: "LIKES", threshold: 5e3 } },
  { variant: "chat", name: "Conversador", description: "50 comentarios hechos", rarity: "COMMON", unlock: { type: "COMMENTS", threshold: 50 } },
  { variant: "chat", name: "Debatero", description: "500 comentarios hechos", rarity: "RARE", unlock: { type: "COMMENTS", threshold: 500 } },
  { variant: "poll", name: "Encuestador", description: "5 encuestas creadas", rarity: "RARE", unlock: { type: "POLLS", threshold: 5 } },
  { variant: "poll", name: "Sondeador", description: "25 encuestas creadas", rarity: "EPIC", unlock: { type: "POLLS", threshold: 25 } },
  { variant: "ghost", name: "Ef\xEDmero", description: "10 posts ef\xEDmeros", rarity: "RARE", unlock: { type: "EPHEMERAL", threshold: 10 } },
  { variant: "ghost", name: "Fantasma", description: "50 posts ef\xEDmeros", rarity: "EPIC", unlock: { type: "EPHEMERAL", threshold: 50 } },
  { variant: "people", name: "Magn\xE9tico", description: "10 seguidores", rarity: "COMMON", unlock: { type: "FOLLOWERS", threshold: 10 } },
  { variant: "people", name: "Influencer", description: "100 seguidores", rarity: "EPIC", unlock: { type: "FOLLOWERS", threshold: 100 } },
  { variant: "people", name: "Celebridad", description: "500 seguidores", rarity: "LEGENDARY", unlock: { type: "FOLLOWERS", threshold: 500 } },
  { variant: "flame", name: "En Racha", description: "7 d\xEDas seguidos", rarity: "COMMON", unlock: { type: "STREAK", threshold: 7 } },
  { variant: "flame", name: "Constante", description: "30 d\xEDas seguidos", rarity: "RARE", unlock: { type: "STREAK", threshold: 30 } },
  { variant: "flame", name: "Devoto", description: "100 d\xEDas seguidos", rarity: "LEGENDARY", unlock: { type: "STREAK", threshold: 100 } },
  { variant: "trophy", name: "Podio", description: "Top 3 del ranking diario", rarity: "EPIC", unlock: { type: "RANKING", threshold: 3 } },
  { variant: "crown", name: "N\xFAmero Uno", description: "#1 del ranking diario", rarity: "LEGENDARY", unlock: { type: "RANKING", threshold: 1 } },
  { variant: "rocket", name: "Viral", description: "Un post que explot\xF3", rarity: "LEGENDARY", unlock: { type: "LIKES", threshold: 2500 } },
  { variant: "mask", name: "Sin M\xE1scara", description: "Revelaste tu identidad en un post", rarity: "RARE", unlock: { type: "SPECIAL" } },
  { variant: "star", name: "Pionero", description: "De los primeros en Qhatu", rarity: "MYTHIC", unlock: { type: "SPECIAL" } },
  // — extra —
  { variant: "pen", name: "Veterano", description: "250 posts publicados", rarity: "LEGENDARY", unlock: { type: "POSTS", threshold: 250 } },
  { variant: "heart", name: "Amado", description: "250 likes recibidos", rarity: "RARE", unlock: { type: "LIKES", threshold: 250 } },
  { variant: "heart", name: "Mito Vivo", description: "10000 likes recibidos", rarity: "MYTHIC", unlock: { type: "LIKES", threshold: 1e4 } },
  { variant: "chat", name: "Charlat\xE1n", description: "1000 comentarios", rarity: "EPIC", unlock: { type: "COMMENTS", threshold: 1e3 } },
  { variant: "poll", name: "Estad\xEDstico", description: "50 encuestas creadas", rarity: "LEGENDARY", unlock: { type: "POLLS", threshold: 50 } },
  { variant: "people", name: "Conocido", description: "50 seguidores", rarity: "RARE", unlock: { type: "FOLLOWERS", threshold: 50 } },
  { variant: "people", name: "Estrella", description: "1000 seguidores", rarity: "MYTHIC", unlock: { type: "FOLLOWERS", threshold: 1e3 } },
  { variant: "flame", name: "Llama Eterna", description: "200 d\xEDas seguidos", rarity: "MYTHIC", unlock: { type: "STREAK", threshold: 200 } },
  { variant: "flame", name: "Inquebrantable", description: "365 d\xEDas seguidos", rarity: "MYTHIC", unlock: { type: "STREAK", threshold: 365 } },
  { variant: "rocket", name: "Despegue", description: "50 posts ef\xEDmeros", rarity: "EPIC", unlock: { type: "EPHEMERAL", threshold: 25 } },
  { variant: "trophy", name: "Top 10", description: "Top 10 del ranking diario", rarity: "RARE", unlock: { type: "RANKING", threshold: 10 } },
  { variant: "spark", name: "Constancia", description: "14 d\xEDas seguidos", rarity: "RARE", unlock: { type: "STREAK", threshold: 14 } }
];
var TITLE_DEFS = [
  { name: "Novato", rarity: "COMMON", unlock: { type: "DEFAULT" } },
  { name: "Curioso", rarity: "COMMON", unlock: { type: "POSTS", threshold: 10 } },
  { name: "Chismoso", rarity: "RARE", unlock: { type: "POSTS", threshold: 50 } },
  { name: "Comentarista", rarity: "RARE", unlock: { type: "COMMENTS", threshold: 100 } },
  { name: "Encuestador", rarity: "RARE", unlock: { type: "POLLS", threshold: 10 } },
  { name: "B\xFAho Nocturno", rarity: "RARE", unlock: { type: "SPECIAL" } },
  { name: "Madrugador", rarity: "RARE", unlock: { type: "SPECIAL" } },
  { name: "Influencer", rarity: "EPIC", unlock: { type: "FOLLOWERS", threshold: 100 } },
  { name: "Veterano", rarity: "EPIC", unlock: { type: "STREAK", threshold: 60 } },
  { name: "El Viral", rarity: "EPIC", unlock: { type: "LIKES", threshold: 2500 } },
  { name: "Fantasma", rarity: "EPIC", unlock: { type: "EPHEMERAL", threshold: 50 } },
  { name: "Coleccionista", rarity: "LEGENDARY", unlock: { type: "SPECIAL" } },
  { name: "Leyenda del Campus", rarity: "LEGENDARY", unlock: { type: "RANKING", threshold: 1 } },
  { name: "Inmortal", rarity: "MYTHIC", unlock: { type: "STREAK", threshold: 365 } },
  { name: "M\xEDtico", rarity: "MYTHIC", unlock: { type: "LIKES", threshold: 1e4 } },
  // — extra —
  { name: "An\xF3nimo Pro", rarity: "COMMON", unlock: { type: "POSTS", threshold: 25 } },
  { name: "Tendencia", rarity: "EPIC", unlock: { type: "RANKING", threshold: 3 } },
  { name: "Sabelotodo", rarity: "RARE", unlock: { type: "COMMENTS", threshold: 300 } },
  { name: "Im\xE1n Social", rarity: "EPIC", unlock: { type: "FOLLOWERS", threshold: 200 } },
  { name: "Racha de Hierro", rarity: "LEGENDARY", unlock: { type: "STREAK", threshold: 150 } },
  { name: "\xCDdolo", rarity: "LEGENDARY", unlock: { type: "LIKES", threshold: 5e3 } },
  { name: "Esp\xEDritu Libre", rarity: "EPIC", unlock: { type: "EPHEMERAL", threshold: 30 } }
];
function slug(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function buildCatalog() {
  const out = [];
  FRAME_DEFS.forEach((f, i) => out.push({
    id: `frame-${slug(f.name)}-${i}`,
    name: f.name,
    description: `Marco ${f.rarity.toLowerCase()}`,
    category: "FRAME",
    rarity: f.rarity,
    unlock: f.unlock,
    variant: f.variant,
    colors: f.colors,
    animated: f.animated
  }));
  NAME_DEFS.forEach((n, i) => out.push({
    id: `name-${slug(n.name)}-${i}`,
    name: n.name,
    description: `Efecto de nombre ${n.rarity.toLowerCase()}`,
    category: "NAME_EFFECT",
    rarity: n.rarity,
    unlock: n.unlock,
    variant: n.variant,
    colors: n.colors,
    animated: n.animated
  }));
  STREAK_DEFS.forEach((s) => {
    const rarity = streakRarity(s.days);
    out.push({
      id: `streak-${s.days}`,
      name: `${s.name} \xB7 ${s.days}d`,
      description: `Publicaste ${s.days} d\xEDas seguidos`,
      category: "STREAK_BADGE",
      rarity,
      unlock: { type: "STREAK", threshold: s.days },
      variant: s.style,
      // unique per tier → unique visual
      colors: s.colors,
      animated: s.days >= 30
    });
  });
  BADGE_DEFS.forEach((b, i) => out.push({
    id: `badge-${slug(b.name)}-${i}`,
    name: b.name,
    description: b.description,
    category: "BADGE",
    rarity: b.rarity,
    unlock: b.unlock,
    variant: b.variant,
    colors: [RARITY_COLOR[b.rarity]],
    animated: RARITY_ORDER[b.rarity] >= 3
  }));
  TITLE_DEFS.forEach((t, i) => out.push({
    id: `title-${slug(t.name)}-${i}`,
    name: t.name,
    description: `T\xEDtulo ${t.rarity.toLowerCase()}`,
    category: "TITLE",
    rarity: t.rarity,
    unlock: t.unlock,
    variant: "title",
    colors: [RARITY_COLOR[t.rarity]]
  }));
  return out;
}
var REWARDS = buildCatalog();
var REWARDS_BY_ID = Object.fromEntries(REWARDS.map((r) => [r.id, r]));
function getReward(id) {
  return REWARDS_BY_ID[id];
}
function qualifies(reward, s) {
  const t = reward.unlock.threshold ?? 0;
  switch (reward.unlock.type) {
    case "DEFAULT":
      return true;
    case "STREAK":
      return s.streakCount >= t;
    case "POSTS":
      return s.postsCount >= t;
    case "LIKES":
      return s.likesReceived >= t;
    case "COMMENTS":
      return s.commentsCount >= t;
    case "FOLLOWERS":
      return s.followers >= t;
    case "POLLS":
      return s.pollsCreated >= t;
    case "EPHEMERAL":
      return s.ephemeralCount >= t;
    case "RANKING":
      return s.bestRank != null && s.bestRank <= t;
    case "SPECIAL":
      return false;
    // granted explicitly (events / actions)
    default:
      return false;
  }
}
function unlockedRewardIds(s) {
  return REWARDS.filter((r) => qualifies(r, s)).map((r) => r.id);
}
var TOTAL_REWARDS = REWARDS.length;

// src/routes/auth.ts
init_prisma();

// src/infrastructure/repositories/PrismaUserRepository.ts
function toDomain(record) {
  return {
    id: record.id,
    emailHash: record.emailHash,
    nickname: record.nickname,
    avatarSeed: record.avatarSeed,
    faculty: record.faculty,
    ageRange: record.ageRange,
    gender: record.gender,
    universityDomain: record.universityDomain,
    streakCount: record.streakCount,
    totalLikesEarned: record.totalLikesEarned,
    createdAt: record.createdAt
  };
}
var PrismaUserRepository = class {
  constructor(db) {
    this.db = db;
  }
  async findByEmailHash(emailHash) {
    const record = await this.db.user.findUnique({ where: { emailHash } });
    if (!record || record.deletedAt) return null;
    return toDomain(record);
  }
  async findByNickname(nickname) {
    const record = await this.db.user.findUnique({ where: { nickname } });
    return record ? toDomain(record) : null;
  }
  async findById(id) {
    const record = await this.db.user.findUnique({ where: { id } });
    if (!record || record.deletedAt) return null;
    return toDomain(record);
  }
  async nicknameExists(nickname) {
    const count = await this.db.user.count({ where: { nickname } });
    return count > 0;
  }
  async emailHashExists(emailHash) {
    const count = await this.db.user.count({ where: { emailHash } });
    return count > 0;
  }
  async updateEmailHash(userId, emailHash, universityDomain) {
    await this.db.user.update({ where: { id: userId }, data: { emailHash, universityDomain } });
  }
  async updateAvatarSeed(userId, avatarSeed) {
    await this.db.user.update({ where: { id: userId }, data: { avatarSeed } });
  }
  async softDeleteUser(userId) {
    await this.db.$transaction([
      this.db.user.update({ where: { id: userId }, data: { deletedAt: /* @__PURE__ */ new Date() } }),
      this.db.refreshToken.deleteMany({ where: { userId } })
      // kill all sessions
    ]);
  }
  async create(data) {
    const record = await this.db.user.create({
      data: {
        emailHash: data.emailHash,
        nickname: data.nickname,
        avatarSeed: data.avatarSeed,
        universityDomain: data.universityDomain,
        faculty: data.faculty ?? null,
        ageRange: data.ageRange ?? null,
        gender: data.gender ?? null
      }
    });
    return toDomain(record);
  }
  // ── OTP ──────────────────────────────────────────────────────────────────────
  async createOtpRequest(emailHash, otpHash, expiresAt) {
    await this.db.otpRequest.create({
      data: { emailHash, otpHash, expiresAt }
    });
  }
  async findValidOtpRequest(emailHash) {
    const record = await this.db.otpRequest.findFirst({
      where: {
        emailHash,
        used: false,
        expiresAt: { gt: /* @__PURE__ */ new Date() }
      },
      orderBy: { createdAt: "desc" }
    });
    if (!record) return null;
    return { id: record.id, otpHash: record.otpHash, attempts: record.attempts };
  }
  async incrementOtpAttempts(id) {
    await this.db.otpRequest.update({
      where: { id },
      data: { attempts: { increment: 1 } }
    });
  }
  async markOtpUsed(id) {
    await this.db.otpRequest.update({
      where: { id },
      data: { used: true }
    });
  }
  // ── Refresh tokens ───────────────────────────────────────────────────────────
  async createRefreshToken(userId, tokenHash, expiresAt) {
    await this.db.refreshToken.create({
      data: { userId, tokenHash, expiresAt }
    });
  }
  async findRefreshToken(tokenHash) {
    const record = await this.db.refreshToken.findUnique({ where: { tokenHash } });
    if (!record) return null;
    return { id: record.id, userId: record.userId, expiresAt: record.expiresAt };
  }
  async deleteRefreshToken(id) {
    await this.db.refreshToken.delete({ where: { id } });
  }
  async deleteExpiredRefreshTokens(userId) {
    await this.db.refreshToken.deleteMany({
      where: { userId, expiresAt: { lt: /* @__PURE__ */ new Date() } }
    });
  }
  // ─── Actualiza facultad, edad y género del usuario ───
  async updateProfile(userId, data) {
    await this.db.user.update({
      where: { id: userId },
      data: {
        faculty: data.faculty ?? void 0,
        ageRange: data.ageRange ?? void 0,
        gender: data.gender ?? void 0
      }
    });
  }
};

// src/infrastructure/email/ResendEmailService.ts
init_templates();
var ResendEmailService = class {
  async send(email, message) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("[DEV EMAIL]", email, "\u2192", message.subject);
      return;
    }
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM ?? "Qhatu <noreply@qhatu.app>";
    await resend.emails.send({
      from,
      to: email,
      subject: message.subject,
      html: message.html,
      text: message.text
    });
  }
  async sendOtp(email, otp) {
    if (!process.env.RESEND_API_KEY) {
      console.log("[DEV OTP]", email, otp);
      return;
    }
    await this.send(email, otpEmail(otp));
  }
};

// src/infrastructure/security/hashEmail.ts
var import_node_crypto = require("node:crypto");
function hashEmail(email) {
  const salt = process.env.EMAIL_HASH_SALT;
  if (!salt) throw new Error("EMAIL_HASH_SALT must be set");
  return (0, import_node_crypto.createHash)("sha256").update(email.toLowerCase().trim() + salt).digest("hex");
}

// src/infrastructure/security/hashToken.ts
var import_node_crypto2 = require("node:crypto");
function hashToken(value) {
  return (0, import_node_crypto2.createHash)("sha256").update(value).digest("hex");
}
function generateOtp() {
  const buf = (0, import_node_crypto2.randomBytes)(3);
  return String(parseInt(buf.toString("hex"), 16) % 1e6).padStart(6, "0");
}
function generateRefreshToken() {
  return (0, import_node_crypto2.randomBytes)(40).toString("hex");
}

// src/application/auth/RegisterUseCase.ts
var RegisterUseCase = class {
  constructor(userRepo, emailService) {
    this.userRepo = userRepo;
    this.emailService = emailService;
  }
  async execute(input) {
    const { email } = input;
    if (!email.includes(".edu")) {
      throw new Error("Se requiere un email universitario (.edu)");
    }
    const emailHash = hashEmail(email);
    const existing = await this.userRepo.findByEmailHash(emailHash);
    if (existing) {
      throw new Error("Este email ya est\xE1 registrado. Usa el flujo de verificaci\xF3n para iniciar sesi\xF3n.");
    }
    const otp = generateOtp();
    const otpHash = hashToken(otp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1e3);
    await this.userRepo.createOtpRequest(emailHash, otpHash, expiresAt);
    await this.emailService.sendOtp(email, otp);
    return { message: "OTP enviado. Revisa tu correo universitario." };
  }
};

// src/infrastructure/security/nicknameGenerator.ts
var ANIMALS = [
  "C\xF3ndor",
  "Puma",
  "Vicu\xF1a",
  "Alpaca",
  "Cuy",
  "Llama",
  "Zorro",
  "\xC1guila",
  "Lobo",
  "Orca",
  "Colibr\xED",
  "Tapir",
  "\xD1and\xFA",
  "Guanaco",
  "Yacar\xE9",
  "Pecar\xED",
  "Quirquincho",
  "Tigrillo",
  "Tuc\xE1n",
  "Jaguar",
  "Caim\xE1n",
  "Flamenco",
  "Nutria",
  "Manat\xED",
  "Murci\xE9lago",
  "Capibara",
  "Tortuguita",
  "Taruca",
  "Viscacha",
  "Huemul"
];
var ADJECTIVES = [
  "Veloz",
  "Andino",
  "Secreto",
  "Digital",
  "Urbano",
  "Nocturno",
  "Astuto",
  "Brillante",
  "Misterioso",
  "Silencioso",
  "Audaz",
  "Certero",
  "Sagaz",
  "Curioso",
  "Intr\xE9pido",
  "Sereno",
  "\xC1gil",
  "Furtivo",
  "Distante",
  "Libre"
];
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function generateUniqueNickname(exists) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const animal = randomItem(ANIMALS);
    const adjective = randomItem(ADJECTIVES);
    const number = randomNumber(10, 99);
    const nickname = `${animal}${adjective}${number}`;
    if (!await exists(nickname)) return nickname;
  }
  const fallback = `Usuario${randomBytes16Hex()}`;
  return fallback;
}
function randomBytes16Hex() {
  return Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0").toUpperCase();
}

// src/application/auth/VerifyOtpUseCase.ts
var VerifyOtpUseCase = class {
  constructor(userRepo, emailService, jwt2) {
    this.userRepo = userRepo;
    this.emailService = emailService;
    this.jwt = jwt2;
  }
  async execute(input) {
    const { email, otp, faculty, ageRange, gender, device } = input;
    const emailHash = hashEmail(email);
    const otpRequest = await this.userRepo.findValidOtpRequest(emailHash);
    if (!otpRequest) {
      throw new Error("No hay un c\xF3digo OTP v\xE1lido para este email. Solicita uno nuevo.");
    }
    if (otpRequest.attempts >= 5) {
      throw new Error("Demasiados intentos fallidos. Solicita un nuevo c\xF3digo OTP.");
    }
    const providedHash = hashToken(otp);
    if (providedHash !== otpRequest.otpHash) {
      await this.userRepo.incrementOtpAttempts(otpRequest.id);
      throw new Error("C\xF3digo OTP incorrecto.");
    }
    await this.userRepo.markOtpUsed(otpRequest.id);
    let user = await this.userRepo.findByEmailHash(emailHash);
    if (!user) {
      const universityDomain = email.split("@")[1] ?? "unknown.edu";
      const avatarSeed = Math.random().toString(36).slice(2, 10);
      const nickname = await generateUniqueNickname(
        (n) => this.userRepo.nicknameExists(n)
      );
      user = await this.userRepo.create({
        emailHash,
        nickname,
        avatarSeed,
        universityDomain,
        faculty,
        ageRange,
        gender
      });
      const { welcomeEmail: welcomeEmail2 } = await Promise.resolve().then(() => (init_templates(), templates_exports));
      this.emailService.send(email, welcomeEmail2(user.nickname)).catch(() => null);
    } else {
      const { securityAlertEmail: securityAlertEmail2 } = await Promise.resolve().then(() => (init_templates(), templates_exports));
      const when = (/* @__PURE__ */ new Date()).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
      this.emailService.send(email, securityAlertEmail2({ when, device })).catch(() => null);
    }
    await this.userRepo.deleteExpiredRefreshTokens(user.id);
    const accessToken = this.jwt.sign(
      { sub: user.id, nickname: user.nickname },
      { expiresIn: "15m" }
    );
    const rawRefreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(rawRefreshToken);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await this.userRepo.createRefreshToken(user.id, refreshTokenHash, refreshExpiry);
    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        nickname: user.nickname,
        avatarSeed: user.avatarSeed,
        faculty: user.faculty
      }
    };
  }
};

// src/application/auth/RefreshTokenUseCase.ts
var RefreshTokenUseCase = class {
  constructor(userRepo, jwt2) {
    this.userRepo = userRepo;
    this.jwt = jwt2;
  }
  async execute(input) {
    const incomingHash = hashToken(input.refreshToken);
    const stored = await this.userRepo.findRefreshToken(incomingHash);
    if (!stored) {
      throw new Error("Token de actualizaci\xF3n inv\xE1lido.");
    }
    if (stored.expiresAt < /* @__PURE__ */ new Date()) {
      await this.userRepo.deleteRefreshToken(stored.id);
      throw new Error("Token de actualizaci\xF3n expirado. Por favor inicia sesi\xF3n nuevamente.");
    }
    await this.userRepo.deleteRefreshToken(stored.id);
    const user = await this.userRepo.findById(stored.userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }
    const accessToken = this.jwt.sign(
      { sub: user.id, nickname: user.nickname },
      { expiresIn: "15m" }
    );
    const rawRefreshToken = generateRefreshToken();
    const newHash = hashToken(rawRefreshToken);
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await this.userRepo.createRefreshToken(user.id, newHash, newExpiry);
    return { accessToken, refreshToken: rawRefreshToken };
  }
};

// src/routes/auth.ts
var RT_COOKIE = "qhatu_rt";
var cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth",
  // client-visible path through the Next proxy (browser hits /api/auth/*)
  maxAge: 7 * 24 * 60 * 60
  // 7 days in seconds
};
var VerifyOtpExtendedSchema = VerifyOtpSchema.extend({
  faculty: import_zod6.z.string().optional(),
  ageRange: import_zod6.z.string().optional(),
  gender: import_zod6.z.string().optional()
});
var authRoutes = async (app) => {
  const userRepo = new PrismaUserRepository(prisma);
  const emailService = new ResendEmailService();
  app.post(
    "/register",
    {
      config: { rateLimit: { max: 3, timeWindow: "1 minute" } },
      schema: {
        body: (0, import_zod_to_json_schema.zodToJsonSchema)(RegisterSchema),
        response: {
          200: (0, import_zod_to_json_schema.zodToJsonSchema)(import_zod6.z.object({ message: import_zod6.z.string() }))
        }
      }
    },
    async (request, reply) => {
      const body = RegisterSchema.parse(request.body);
      const useCase = new RegisterUseCase(userRepo, emailService);
      try {
        const result = await useCase.execute({ email: body.email });
        return reply.send(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al registrar";
        throw app.httpErrors.badRequest(message);
      }
    }
  );
  app.post(
    "/verify-otp",
    {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: {
        body: (0, import_zod_to_json_schema.zodToJsonSchema)(VerifyOtpExtendedSchema),
        response: {
          200: (0, import_zod_to_json_schema.zodToJsonSchema)(
            import_zod6.z.object({
              accessToken: import_zod6.z.string(),
              user: import_zod6.z.object({
                nickname: import_zod6.z.string(),
                avatarSeed: import_zod6.z.string(),
                faculty: import_zod6.z.string().nullable()
              })
            })
          )
        }
      }
    },
    async (request, reply) => {
      const body = VerifyOtpExtendedSchema.parse(request.body);
      const useCase = new VerifyOtpUseCase(userRepo, emailService, app.jwt);
      try {
        const { accessToken, refreshToken, user } = await useCase.execute({
          email: body.email,
          otp: body.otp,
          faculty: body.faculty,
          ageRange: body.ageRange,
          gender: body.gender,
          device: summariseUserAgent(request.headers["user-agent"])
        });
        reply.setCookie(RT_COOKIE, refreshToken, cookieOpts);
        return reply.send({ accessToken, user });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al verificar OTP";
        throw app.httpErrors.badRequest(message);
      }
    }
  );
  app.post(
    "/refresh",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: {
        response: {
          200: (0, import_zod_to_json_schema.zodToJsonSchema)(
            import_zod6.z.object({
              accessToken: import_zod6.z.string()
            })
          )
        }
      }
    },
    async (request, reply) => {
      const rawToken = request.cookies[RT_COOKIE];
      if (!rawToken) {
        throw app.httpErrors.unauthorized("No se encontr\xF3 token de actualizaci\xF3n.");
      }
      const useCase = new RefreshTokenUseCase(userRepo, app.jwt);
      try {
        const { accessToken, refreshToken } = await useCase.execute({ refreshToken: rawToken });
        reply.setCookie(RT_COOKIE, refreshToken, cookieOpts);
        return reply.send({ accessToken });
      } catch (err) {
        reply.clearCookie(RT_COOKIE, { path: "/api/auth" });
        const message = err instanceof Error ? err.message : "Error al renovar token";
        throw app.httpErrors.unauthorized(message);
      }
    }
  );
  app.post(
    "/logout",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: {
        response: {
          200: (0, import_zod_to_json_schema.zodToJsonSchema)(import_zod6.z.object({ message: import_zod6.z.string() }))
        }
      }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const rawToken = request.cookies[RT_COOKIE];
      if (rawToken) {
        const tokenHash = hashToken(rawToken);
        const stored = await userRepo.findRefreshToken(tokenHash);
        if (stored) {
          await userRepo.deleteRefreshToken(stored.id);
        }
      }
      reply.clearCookie(RT_COOKIE, { path: "/api/auth" });
      return reply.send({ message: "Sesi\xF3n cerrada correctamente." });
    }
  );
};
function summariseUserAgent(ua) {
  if (!ua) return "dispositivo desconocido";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "navegador";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iOS/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} en ${os}` : browser;
}
var auth_default = authRoutes;

// src/routes/qr.ts
var import_zod_to_json_schema2 = require("zod-to-json-schema");
var import_zod7 = require("zod");
init_prisma();

// src/infrastructure/repositories/PrismaQrLoginRepository.ts
var PrismaQrLoginRepository = class {
  constructor(db) {
    this.db = db;
  }
  async create(expiresAt) {
    const rec = await this.db.qrLoginSession.create({ data: { expiresAt } });
    return toDomain2(rec);
  }
  async findById(id) {
    const rec = await this.db.qrLoginSession.findUnique({ where: { id } });
    return rec ? toDomain2(rec) : null;
  }
  async setApproved(id, userId) {
    await this.db.qrLoginSession.update({ where: { id }, data: { status: "APPROVED", approvedUserId: userId } });
  }
  async setStatus(id, status) {
    await this.db.qrLoginSession.update({ where: { id }, data: { status } });
  }
};
function toDomain2(r) {
  return { id: r.id, status: r.status, approvedUserId: r.approvedUserId, expiresAt: r.expiresAt };
}

// src/application/auth/QrLoginService.ts
var TTL_MS = 2 * 60 * 1e3;
var QrLoginService = class {
  constructor(repo) {
    this.repo = repo;
  }
  async create() {
    const session = await this.repo.create(new Date(Date.now() + TTL_MS));
    return { sessionId: session.id, expiresAt: session.expiresAt.toISOString() };
  }
  /** Public status — expires lazily. */
  async status(sessionId) {
    const s = await this.repo.findById(sessionId);
    if (!s) return "EXPIRED";
    if (s.status === "PENDING" && s.expiresAt < /* @__PURE__ */ new Date()) {
      await this.repo.setStatus(s.id, "EXPIRED");
      return "EXPIRED";
    }
    return s.status;
  }
  /** Logged-in device approves the session. */
  async approve(sessionId, userId) {
    const s = await this.repo.findById(sessionId);
    if (!s) throw new Error("Sesi\xF3n QR no encontrada.");
    if (s.expiresAt < /* @__PURE__ */ new Date()) {
      await this.repo.setStatus(s.id, "EXPIRED");
      throw new Error("El c\xF3digo QR expir\xF3. Genera uno nuevo.");
    }
    if (s.status !== "PENDING") throw new Error("Este c\xF3digo QR ya no es v\xE1lido.");
    await this.repo.setApproved(s.id, userId);
  }
  /** Desktop claims tokens once approved. Single-use → marks CONSUMED. */
  async claim(sessionId) {
    const s = await this.repo.findById(sessionId);
    if (!s) return null;
    if (s.expiresAt < /* @__PURE__ */ new Date()) {
      await this.repo.setStatus(s.id, "EXPIRED");
      return null;
    }
    if (s.status !== "APPROVED" || !s.approvedUserId) return null;
    await this.repo.setStatus(s.id, "CONSUMED");
    return s.approvedUserId;
  }
};

// src/routes/qr.ts
var RT_COOKIE2 = "qhatu_rt";
var cookieOpts2 = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth",
  // client-visible path through the Next proxy
  maxAge: 7 * 24 * 60 * 60
};
var SessionBody = import_zod7.z.object({ sessionId: import_zod7.z.string().min(1) });
var qrRoutes = async (app) => {
  const userRepo = new PrismaUserRepository(prisma);
  const qrRepo = new PrismaQrLoginRepository(prisma);
  const service = new QrLoginService(qrRepo);
  app.post(
    "/create",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    async (_req, reply) => reply.send(await service.create())
  );
  app.get(
    "/status",
    {
      config: { rateLimit: { max: 120, timeWindow: "1 minute" } },
      schema: { querystring: (0, import_zod_to_json_schema2.zodToJsonSchema)(import_zod7.z.object({ s: import_zod7.z.string().min(1) })) }
    },
    async (request, reply) => {
      const { s } = request.query;
      return reply.send({ status: await service.status(s) });
    }
  );
  app.post(
    "/approve",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: { body: (0, import_zod_to_json_schema2.zodToJsonSchema)(SessionBody) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const body = SessionBody.parse(request.body);
      try {
        await service.approve(body.sessionId, user.sub);
        return reply.send({ ok: true });
      } catch (err) {
        throw app.httpErrors.badRequest(err instanceof Error ? err.message : "Error al aprobar");
      }
    }
  );
  app.post(
    "/claim",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: { body: (0, import_zod_to_json_schema2.zodToJsonSchema)(SessionBody) }
    },
    async (request, reply) => {
      const body = SessionBody.parse(request.body);
      const userId = await service.claim(body.sessionId);
      if (!userId) throw app.httpErrors.unauthorized("Sesi\xF3n QR no aprobada o expirada.");
      const user = await userRepo.findById(userId);
      if (!user) throw app.httpErrors.unauthorized("Usuario no encontrado.");
      await userRepo.deleteExpiredRefreshTokens(user.id);
      const accessToken = app.jwt.sign({ sub: user.id, nickname: user.nickname }, { expiresIn: "15m" });
      const rawRefresh = generateRefreshToken();
      await userRepo.createRefreshToken(user.id, hashToken(rawRefresh), new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3));
      reply.setCookie(RT_COOKIE2, rawRefresh, cookieOpts2);
      return reply.send({
        accessToken,
        user: { nickname: user.nickname, avatarSeed: user.avatarSeed, faculty: user.faculty }
      });
    }
  );
};
var qr_default = qrRoutes;

// src/routes/account.ts
var import_zod_to_json_schema3 = require("zod-to-json-schema");
var import_zod8 = require("zod");
init_prisma();
init_templates();
var ChangeRequest = import_zod8.z.object({ newEmail: RegisterSchema.shape.email });
var ChangeConfirm = import_zod8.z.object({ newEmail: RegisterSchema.shape.email, otp: import_zod8.z.string().length(6) });
var DeleteRequest = import_zod8.z.object({ email: RegisterSchema.shape.email });
var DeleteConfirm = import_zod8.z.object({ token: import_zod8.z.string().min(10) });
var accountRoutes = async (app) => {
  const userRepo = new PrismaUserRepository(prisma);
  const email = new ResendEmailService();
  app.post(
    "/email/change-request",
    {
      config: { rateLimit: { max: 3, timeWindow: "5 minutes" } },
      schema: { body: (0, import_zod_to_json_schema3.zodToJsonSchema)(ChangeRequest) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const body = ChangeRequest.parse(request.body);
      const newHash = hashEmail(body.newEmail);
      if (await userRepo.emailHashExists(newHash)) {
        throw app.httpErrors.conflict("Ese correo ya est\xE1 en uso.");
      }
      const otp = generateOtp();
      await userRepo.createOtpRequest(newHash, hashToken(otp), new Date(Date.now() + 15 * 60 * 1e3));
      email.send(body.newEmail, emailChangeEmail(otp)).catch(() => null);
      return reply.send({ message: "C\xF3digo enviado al nuevo correo." });
    }
  );
  app.post(
    "/email/change-confirm",
    {
      config: { rateLimit: { max: 5, timeWindow: "5 minutes" } },
      schema: { body: (0, import_zod_to_json_schema3.zodToJsonSchema)(ChangeConfirm) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const body = ChangeConfirm.parse(request.body);
      const newHash = hashEmail(body.newEmail);
      const otpReq = await userRepo.findValidOtpRequest(newHash);
      if (!otpReq || otpReq.attempts >= 5) throw app.httpErrors.badRequest("C\xF3digo inv\xE1lido o expirado.");
      if (hashToken(body.otp) !== otpReq.otpHash) {
        await userRepo.incrementOtpAttempts(otpReq.id);
        throw app.httpErrors.badRequest("C\xF3digo incorrecto.");
      }
      await userRepo.markOtpUsed(otpReq.id);
      if (await userRepo.emailHashExists(newHash)) {
        throw app.httpErrors.conflict("Ese correo ya est\xE1 en uso.");
      }
      const domain = body.newEmail.split("@")[1] ?? "unknown.edu";
      await userRepo.updateEmailHash(user.sub, newHash, domain);
      return reply.send({ message: "Correo actualizado." });
    }
  );
  app.post(
    "/account/delete-request",
    {
      config: { rateLimit: { max: 3, timeWindow: "10 minutes" } },
      schema: { body: (0, import_zod_to_json_schema3.zodToJsonSchema)(DeleteRequest) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const body = DeleteRequest.parse(request.body);
      const me = await userRepo.findById(user.sub);
      if (!me || hashEmail(body.email) !== me.emailHash) {
        throw app.httpErrors.badRequest("El correo no coincide con tu cuenta.");
      }
      const token = app.jwt.sign({ sub: user.sub, purpose: "delete" }, { expiresIn: "30m" });
      const base = process.env.FRONTEND_URL ?? "https://qhatu.app";
      email.send(body.email, accountDeletionEmail(`${base}/account/delete?t=${token}`)).catch(() => null);
      return reply.send({ message: "Te enviamos un enlace de confirmaci\xF3n." });
    }
  );
  app.post(
    "/account/delete-confirm",
    {
      config: { rateLimit: { max: 5, timeWindow: "10 minutes" } },
      schema: { body: (0, import_zod_to_json_schema3.zodToJsonSchema)(DeleteConfirm) }
    },
    async (request, reply) => {
      const body = DeleteConfirm.parse(request.body);
      let payload;
      try {
        payload = app.jwt.verify(body.token);
      } catch {
        throw app.httpErrors.unauthorized("Enlace inv\xE1lido o expirado.");
      }
      if (payload.purpose !== "delete") throw app.httpErrors.badRequest("Token inv\xE1lido.");
      await userRepo.softDeleteUser(payload.sub);
      reply.clearCookie("qhatu_rt", { path: "/api/auth" });
      return reply.send({ message: "Cuenta eliminada." });
    }
  );
  const ProfileSchema = import_zod8.z.object({
    faculty: import_zod8.z.string().optional(),
    ageRange: import_zod8.z.string().optional(),
    gender: import_zod8.z.string().optional()
  });
  app.patch(
    "/profile",
    {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: { body: (0, import_zod_to_json_schema3.zodToJsonSchema)(ProfileSchema) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const body = ProfileSchema.parse(request.body);
      await userRepo.updateProfile(user.sub, body);
      return reply.send({ message: "Perfil actualizado." });
    }
  );
};
var account_default = accountRoutes;

// src/routes/posts.ts
var import_zod_to_json_schema4 = require("zod-to-json-schema");
var import_zod9 = require("zod");
init_prisma();

// src/infrastructure/repositories/PrismaPostRepository.ts
function toDomain3(r) {
  return { ...r, type: r.type };
}
var REACTION_FIELD = {
  LIKE: "likesCount",
  FIRE: "fireCount",
  TEA: "teaCount",
  DED: "dedCount"
};
function FEED_INCLUDE(viewerId) {
  return {
    author: { select: { nickname: true, avatarSeed: true, avatarUrl: true, faculty: true, equippedFrame: true, equippedNameEffect: true, equippedTitle: true, streakCount: true } },
    hashtags: { include: { hashtag: { select: { tag: true } } } },
    media: { orderBy: { order: "asc" }, select: { key: true, type: true } },
    reactions: { where: { userId: viewerId }, select: { type: true } },
    poll: {
      include: {
        options: {
          orderBy: { order: "asc" },
          include: { votes: { select: { voterHash: true } } }
        }
      }
    }
  };
}
var PrismaPostRepository = class {
  constructor(db, storage) {
    this.db = db;
    this.storage = storage;
  }
  async create(data) {
    const record = await this.db.post.create({
      data: {
        authorId: data.authorId,
        content: data.content,
        type: data.type,
        isIdentityRevealed: data.isIdentityRevealed,
        expiresAt: data.expiresAt,
        hashtags: {
          create: data.hashtagIds.map((hashtagId) => ({ hashtagId }))
        },
        ...data.media && data.media.length > 0 ? {
          media: {
            create: data.media.map((m, i) => ({ key: m.key, type: m.type, order: i }))
          }
        } : {},
        ...data.poll ? {
          poll: {
            create: {
              question: data.poll.question,
              options: {
                create: data.poll.options.map((text, i) => ({ text, order: i }))
              }
            }
          }
        } : {}
      }
    });
    return toDomain3(record);
  }
  async findById(id) {
    const record = await this.db.post.findUnique({ where: { id, deletedAt: null } });
    return record ? toDomain3(record) : null;
  }
  async getPublicPost(id) {
    const rows = await this.db.post.findMany({ where: { id, deletedAt: null }, include: FEED_INCLUDE("") });
    const [mapped] = await this._mapPosts(rows, "");
    return mapped ?? null;
  }
  async softDelete(id) {
    await this.db.post.update({ where: { id }, data: { deletedAt: /* @__PURE__ */ new Date() } });
  }
  async getFeed(opts) {
    const { tab, viewerId, cursor, limit } = opts;
    let orderBy;
    if (tab === "trending") {
      orderBy = [{ score: "desc" }, { createdAt: "desc" }];
    } else {
      orderBy = [{ createdAt: "desc" }];
    }
    let where = {
      deletedAt: null,
      // Hide expired ephemeral posts
      OR: [{ expiresAt: null }, { expiresAt: { gt: /* @__PURE__ */ new Date() } }]
    };
    if (tab === "following") {
      const follows = await this.db.userFollow.findMany({
        where: { followerId: viewerId, targetNickname: { not: null } },
        select: { targetNickname: true }
      });
      const nicknames = follows.map((f) => f.targetNickname);
      where = {
        ...where,
        author: { nickname: { in: nicknames } }
      };
    }
    if (cursor) {
      const cursorPost = await this.db.post.findUnique({
        where: { id: cursor },
        select: { createdAt: true, score: true }
      });
      if (cursorPost) {
        if (tab === "trending") {
          where = {
            ...where,
            OR: [
              { score: { lt: cursorPost.score } },
              { score: cursorPost.score, createdAt: { lt: cursorPost.createdAt } }
            ]
          };
        } else {
          where = { ...where, createdAt: { lt: cursorPost.createdAt } };
        }
      }
    }
    const posts = await this.db.post.findMany({
      where,
      orderBy,
      take: limit,
      include: FEED_INCLUDE(viewerId)
    });
    return this._mapPosts(posts, viewerId);
  }
  async findReaction(postId, userId, type) {
    const r = await this.db.reaction.findUnique({
      where: { postId_userId_type: { postId, userId, type } },
      select: { id: true }
    });
    return r;
  }
  async addReaction(postId, userId, type) {
    const field = REACTION_FIELD[type];
    await this.db.$transaction([
      this.db.reaction.create({ data: { postId, userId, type } }),
      this.db.post.update({
        where: { id: postId },
        data: { [field]: { increment: 1 } }
      })
    ]);
  }
  async removeReaction(id, postId, type) {
    const field = REACTION_FIELD[type];
    await this.db.$transaction([
      this.db.reaction.delete({ where: { id } }),
      this.db.post.update({
        where: { id: postId },
        data: { [field]: { decrement: 1 } }
      })
    ]);
  }
  async createComment(postId, authorId, content) {
    const [comment] = await this.db.$transaction([
      this.db.comment.create({ data: { postId, authorId, content } }),
      this.db.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      })
    ]);
    return comment;
  }
  async listComments(postId, cursor, limit = 20) {
    const where = { postId, deletedAt: null };
    if (cursor) {
      const pivot = await this.db.comment.findUnique({
        where: { id: cursor },
        select: { createdAt: true }
      });
      if (pivot) {
        where.createdAt = { lt: pivot.createdAt };
      }
    }
    const rows = await this.db.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit
    });
    return rows;
  }
  async getCommentAuthorNickname(authorId) {
    const user = await this.db.user.findUnique({
      where: { id: authorId },
      select: { nickname: true }
    });
    return user?.nickname ?? "An\xF3nimo";
  }
  async findOrCreateHashtag(tag) {
    const normalised = tag.toLowerCase().trim();
    const existing = await this.db.hashtag.findUnique({ where: { tag: normalised } });
    if (existing) {
      await this.db.hashtag.update({
        where: { id: existing.id },
        data: { postCount: { increment: 1 } }
      });
      return existing.id;
    }
    const created = await this.db.hashtag.create({
      data: { tag: normalised, postCount: 1 }
    });
    return created.id;
  }
  // ─── S3: full ranker support ─────────────────────────────────────────────────
  async getCandidates(viewerId, universityDomain, limit) {
    const posts = await this.db.post.findMany({
      where: {
        deletedAt: null,
        author: { universityDomain },
        OR: [{ expiresAt: null }, { expiresAt: { gt: /* @__PURE__ */ new Date() } }]
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: FEED_INCLUDE(viewerId)
    });
    return this._mapPosts(posts, viewerId);
  }
  // Shared async mapper: resolves media keys → URLs (presigned for private buckets)
  async _mapPosts(posts, viewerId) {
    const viewerVoterHash = await this._voterHash(viewerId);
    return Promise.all(posts.map(async (p) => {
      const media = await Promise.all(
        p.media.map(async (m) => ({
          url: await this.storage.resolveUrl(m.key),
          type: m.type
        }))
      );
      return {
        ...toDomain3(p),
        authorNickname: p.isIdentityRevealed ? p.author.nickname : "An\xF3nimo",
        authorAvatarSeed: p.author.avatarSeed,
        authorAvatarUrl: p.author.avatarUrl ?? null,
        authorFaculty: p.isIdentityRevealed ? p.author.faculty : null,
        // Frame follows the avatar (already per-author visible). Name effect / title
        // reveal more, so gate them behind identity reveal to preserve anonymity.
        authorFrame: p.author.equippedFrame ?? null,
        authorNameEffect: p.isIdentityRevealed ? p.author.equippedNameEffect ?? null : null,
        authorTitle: p.isIdentityRevealed ? p.author.equippedTitle ?? null : null,
        isMine: p.authorId === viewerId,
        authorStreakCount: p.author.streakCount ?? 0,
        hashtags: p.hashtags.map((h) => h.hashtag.tag),
        media,
        myReaction: p.reactions[0]?.type ?? null,
        poll: p.poll ? {
          id: p.poll.id,
          question: p.poll.question,
          options: p.poll.options.map((o) => ({
            id: o.id,
            text: o.text,
            votesCount: o.votes.length,
            isMyVote: o.votes.some((v) => v.voterHash === viewerVoterHash)
          }))
        } : null
      };
    }));
  }
  async getViewerFeedContext(viewerId) {
    const startOfDay2 = /* @__PURE__ */ new Date();
    startOfDay2.setHours(0, 0, 0, 0);
    const [viewer, follows, seenPosts, affinities, seenToday] = await Promise.all([
      this.db.user.findUnique({
        where: { id: viewerId },
        select: { faculty: true, ageRange: true }
      }),
      this.db.userFollow.findMany({
        where: { followerId: viewerId },
        select: { targetNickname: true, targetHashtagId: true, hashtag: { select: { tag: true } } }
      }),
      this.db.feedView.findMany({
        where: { userId: viewerId },
        orderBy: { viewedAt: "desc" },
        take: 200,
        select: { postId: true }
      }),
      this.db.userAuthorAffinity.findMany({
        where: { viewerId },
        select: { authorId: true, score: true }
      }),
      // Posts seen today, joined with their author — for feedback-fatigue penalty
      this.db.feedView.findMany({
        where: { userId: viewerId, viewedAt: { gte: startOfDay2 } },
        select: { post: { select: { authorId: true } } }
      })
    ]);
    const authorSeenToday = {};
    for (const v of seenToday) {
      const aid = v.post.authorId;
      authorSeenToday[aid] = (authorSeenToday[aid] ?? 0) + 1;
    }
    const followedNicknames = follows.filter((f) => f.targetNickname).map((f) => f.targetNickname);
    return {
      faculty: viewer?.faculty ?? null,
      ageRange: viewer?.ageRange ?? null,
      followedNicknames,
      followedHashtags: follows.filter((f) => f.hashtag).map((f) => f.hashtag.tag),
      seenPostIds: seenPosts.map((s) => s.postId),
      authorAffinities: Object.fromEntries(affinities.map((a) => [a.authorId, a.score])),
      authorSeenToday,
      isColdStart: followedNicknames.length === 0 && affinities.length === 0
    };
  }
  async markSeen(viewerId, postIds) {
    if (postIds.length === 0) return;
    await this.db.feedView.createMany({
      data: postIds.map((postId) => ({ userId: viewerId, postId })),
      skipDuplicates: true
    });
  }
  async updateScore(postId, score, velocityScore) {
    await this.db.post.update({
      where: { id: postId },
      data: { score, velocityScore }
    });
  }
  async votePoll(postId, optionId, userId) {
    const voterHash = await this._voterHash(userId);
    const poll = await this.db.poll.findUnique({
      where: { postId },
      include: { options: { select: { id: true } } }
    });
    if (!poll) throw new Error("Este post no tiene encuesta.");
    const optionIds = poll.options.map((o) => o.id);
    if (!optionIds.includes(optionId)) throw new Error("Opci\xF3n inv\xE1lida.");
    await this.db.$transaction([
      // Drop prior vote(s) by this voter across the poll → one vote per poll
      this.db.pollVote.deleteMany({ where: { optionId: { in: optionIds }, voterHash } }),
      this.db.pollVote.create({ data: { optionId, voterHash } })
    ]);
  }
  // ─── private helpers ─────────────────────────────────────────────────────────
  async _voterHash(userId) {
    const { createHash: createHash3 } = await import("node:crypto");
    const salt = process.env.EMAIL_HASH_SALT ?? "poll-anon-salt";
    return createHash3("sha256").update(userId + salt).digest("hex");
  }
};

// src/infrastructure/services/HashtagExtractor.ts
function extractHashtags(content) {
  const regex = /#([a-zA-ZÀ-ÿ0-9_]{2,30})/g;
  const matches = [...content.matchAll(regex)];
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const m of matches) {
    const tag = m[1].toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      result.push(tag);
    }
    if (result.length >= 5) break;
  }
  return result;
}

// src/application/posts/CreatePostUseCase.ts
var CreatePostUseCase = class {
  constructor(postRepo, userRepo, stream, embeddingRepo) {
    this.postRepo = postRepo;
    this.userRepo = userRepo;
    this.stream = stream;
    this.embeddingRepo = embeddingRepo;
  }
  async execute(input) {
    const { authorId, content, type, isIdentityRevealed, poll, media, embedding } = input;
    if (type === "POLL" && !poll) {
      throw new Error("Los posts de tipo POLL requieren datos de encuesta.");
    }
    if (media && media.length > 0 && poll) {
      throw new Error("Un post no puede tener media y encuesta a la vez.");
    }
    if (media && media.length > 0) {
      validateMediaSet(media);
    }
    const tags = extractHashtags(content);
    const hashtagIds = [];
    for (const tag of tags) {
      const id = await this.postRepo.findOrCreateHashtag(tag);
      hashtagIds.push(id);
    }
    const expiresAt = type === "EPHEMERAL" ? new Date(Date.now() + 24 * 60 * 60 * 1e3) : null;
    const post = await this.postRepo.create({
      authorId,
      content,
      type,
      isIdentityRevealed,
      expiresAt,
      hashtagIds,
      poll,
      media: media && media.length > 0 ? media : void 0
    });
    if (isValidEmbedding(embedding)) {
      this.embeddingRepo.savePostEmbedding(post.id, embedding).catch(() => null);
    }
    const author = await this.userRepo.findById(authorId);
    this.stream.publish({
      type: "POST_CREATED",
      postId: post.id,
      userId: authorId,
      authorId,
      universityDomain: author?.universityDomain ?? "",
      timestamp: Date.now()
    }).catch(() => null);
    return post;
  }
};

// src/application/posts/GetPostUseCase.ts
var GetPostUseCase = class {
  constructor(postRepo) {
    this.postRepo = postRepo;
  }
  async execute(id) {
    const post = await this.postRepo.getPublicPost(id);
    if (!post) return null;
    const { authorId: _drop, ...publicPost } = post;
    return publicPost;
  }
};

// src/application/posts/DeletePostUseCase.ts
var DeletePostUseCase = class {
  constructor(postRepo) {
    this.postRepo = postRepo;
  }
  async execute(input) {
    const { postId, requesterId } = input;
    const post = await this.postRepo.findById(postId);
    if (!post) throw new Error("Post no encontrado.");
    if (post.authorId !== requesterId) throw new Error("No tienes permiso para eliminar este post.");
    await this.postRepo.softDelete(postId);
  }
};

// src/domain/services/ScoreCalculator.ts
var W = {
  likes: 1,
  fire: 1.5,
  tea: 1.3,
  ded: 1.2,
  comments: 2,
  // shares no está implementado aún — sharesCount siempre llega como 0 desde el servidor
  shares: 2.5,
  // polls multiplica pollVotesCount cuando el post es una encuesta
  polls: 0.8,
  reports: -5
};
function computeBaseScore(metrics) {
  const hoursAge = Math.max(
    0,
    (Date.now() - metrics.createdAt.getTime()) / 36e5
  );
  const engagement = metrics.likesCount * W.likes + metrics.fireCount * W.fire + metrics.teaCount * W.tea + metrics.dedCount * W.ded + metrics.commentsCount * W.comments + // ─── polls multiplica pollVotesCount, no commentsCount — evita doble conteo ───
  (metrics.isPoll ? (metrics.pollVotesCount ?? 0) * W.polls : 0) + metrics.reportsCount * W.reports;
  const baseScore = engagement / Math.log2(hoursAge + 2);
  return Math.max(0, baseScore);
}
function computeFinalScore(metrics, viewer) {
  const base = computeBaseScore(metrics);
  let boost = 1;
  boost += Math.min(viewer.authorAffinity * 0.05, 0.5);
  boost += viewer.facultyMatch ? 0.15 : 0;
  boost += viewer.ageMatch ? 0.1 : 0;
  boost += Math.min(viewer.embeddingSimilarity * 0.2, 0.2);
  boost += viewer.followsAuthor ? 0.35 : 0;
  boost += viewer.followsHashtag ? 0.25 : 0;
  boost += viewer.timeOfDayMatch ? 0.1 : 0;
  boost -= viewer.seenInSession ? 0.2 : 0;
  const ephemeralBonus = metrics.isEphemeral && metrics.hoursLeft < 4 ? base * 0.4 : 0;
  const identityBonus = metrics.isIdentityRevealed ? 0.25 : 0;
  const velocityBonus = Math.min(metrics.velocityScore * 0.3, 2);
  const authorStreakBonus = Math.min(metrics.authorStreakCount * 0.05, 1);
  const seenMultiplier = viewer.seenInSession ? 0.05 : 1;
  const fatigueMultiplier = viewer.authorSeenToday > 10 ? 0.3 : 1;
  const coldStartLift = viewer.isColdStart ? base * 0.3 : 0;
  const finalScore = Math.max(
    0,
    (base * boost + authorStreakBonus + velocityBonus + ephemeralBonus + identityBonus + coldStartLift) * seenMultiplier * fatigueMultiplier
  );
  return finalScore;
}
function applyHeuristics(ranked, limit) {
  const now = Date.now();
  const twoHours = 2 * 36e5;
  ranked.sort((a, b) => b.score - a.score);
  for (const r of ranked) {
    if (r.post.reportsCount >= 5) {
      r.score = 0;
    } else if (r.post.reportsCount >= 3) {
      r.score *= 0.2;
    } else if (r.post.reportsCount >= 1) {
      r.score *= 0.8;
    }
  }
  const authorCount = /* @__PURE__ */ new Map();
  for (const r of ranked) {
    const cnt = authorCount.get(r.post.authorId) ?? 0;
    if (cnt >= 2) {
      r.score *= 0.3;
    }
    authorCount.set(r.post.authorId, cnt + 1);
  }
  ranked.sort((a, b) => b.score - a.score);
  const freshPosts = ranked.filter((r) => now - r.post.createdAt.getTime() < twoHours);
  const nonFreshPosts = ranked.filter((r) => now - r.post.createdAt.getTime() >= twoHours);
  const merged = [];
  let freshUsed = 0;
  let ni = 0;
  let fi = 0;
  while (merged.length < limit) {
    const needsFresh = freshUsed < 3 && fi < freshPosts.length && merged.length >= Math.min(6, ranked.length - 1);
    if (needsFresh) {
      merged.push(freshPosts[fi++]);
      freshUsed++;
    } else if (ni < nonFreshPosts.length && (fi >= freshPosts.length || (nonFreshPosts[ni]?.score ?? 0) >= (freshPosts[fi]?.score ?? 0))) {
      merged.push(nonFreshPosts[ni++]);
    } else if (fi < freshPosts.length) {
      merged.push(freshPosts[fi++]);
    } else {
      break;
    }
  }
  if (merged.length < limit) {
    const inMerged = new Set(merged.map((r) => r.post.id));
    for (const r of ranked) {
      if (!inMerged.has(r.post.id)) {
        merged.push(r);
        if (merged.length >= limit) break;
      }
    }
  }
  injectTrending(merged, ranked);
  balanceContentTypes(merged);
  return merged.slice(0, limit);
}
function injectTrending(feed, pool) {
  if (feed.length < 6) return;
  const trending = [...pool].sort((a, b) => b.post.velocityScore - a.post.velocityScore)[0];
  if (!trending || trending.post.velocityScore <= 0) return;
  const currentIdx = feed.findIndex((r) => r.post.id === trending.post.id);
  if (currentIdx !== -1 && currentIdx < 5) return;
  if (currentIdx !== -1) feed.splice(currentIdx, 1);
  feed.splice(3, 0, trending);
}
function balanceContentTypes(feed) {
  for (let i = 2; i < feed.length; i++) {
    const a = feed[i - 2].post.type;
    const b = feed[i - 1].post.type;
    const c = feed[i].post.type;
    if (a === b && b === c) {
      const swapIdx = feed.findIndex((r, j) => j > i && r.post.type !== c);
      if (swapIdx !== -1) {
        const tmp = feed[i];
        feed[i] = feed[swapIdx];
        feed[swapIdx] = tmp;
      }
    }
  }
}

// src/domain/services/EmbeddingCalculator.ts
function cosineSimilarity(a, b) {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, dot));
}

// src/application/posts/GetFeedUseCase.ts
function strip(posts) {
  return posts.map(({ authorId: _authorId, ...rest }) => rest);
}
var CANDIDATE_POOL = 150;
var GetFeedUseCase = class {
  constructor(postRepo, userRepo, embeddingRepo) {
    this.postRepo = postRepo;
    this.userRepo = userRepo;
    this.embeddingRepo = embeddingRepo;
  }
  async execute(input) {
    const limit = input.limit ?? 20;
    if (input.tab !== "for-you") {
      const posts2 = await this.postRepo.getFeed({
        tab: input.tab,
        viewerId: input.viewerId,
        cursor: input.cursor,
        limit: limit + 1
      });
      const hasMore2 = posts2.length > limit;
      const page2 = hasMore2 ? posts2.slice(0, limit) : posts2;
      return { posts: strip(page2), nextCursor: hasMore2 ? page2[page2.length - 1].id : null };
    }
    const viewer = await this.userRepo.findById(input.viewerId);
    if (!viewer) return { posts: [], nextCursor: null };
    const [candidates, viewerCtx, userVector] = await Promise.all([
      this.postRepo.getCandidates(input.viewerId, viewer.universityDomain, CANDIDATE_POOL),
      this.postRepo.getViewerFeedContext(input.viewerId),
      // ─── P2: el vector del viewer podría cachearse en Redis con TTL de 5min ───
      // ─── para evitar recalcularlo en cada carga del feed. Pendiente implementar. ───
      this.embeddingRepo.getUserVector(input.viewerId)
    ]);
    const seenSet = new Set(viewerCtx.seenPostIds);
    const followedSet = new Set(viewerCtx.followedNicknames);
    const postEmbeddings = userVector && userVector.length > 0 ? await this.embeddingRepo.getPostEmbeddings(candidates.map((c) => c.id)) : {};
    const ranked = candidates.map((post) => {
      const now = Date.now();
      const hoursAge = Math.max(0, (now - new Date(post.createdAt).getTime()) / 36e5);
      const hoursLeft = post.expiresAt ? Math.max(0, (new Date(post.expiresAt).getTime() - now) / 36e5) : 0;
      const metrics = {
        likesCount: post.likesCount,
        fireCount: post.fireCount,
        teaCount: post.teaCount,
        dedCount: post.dedCount,
        commentsCount: post.commentsCount,
        sharesCount: 0,
        reportsCount: post.reportsCount,
        isPoll: post.type === "POLL",
        isIdentityRevealed: post.isIdentityRevealed,
        isEphemeral: post.type === "EPHEMERAL",
        hoursLeft,
        createdAt: new Date(post.createdAt),
        velocityScore: post.velocityScore,
        // ─── streakCount del autor para el bonus de racha en el algoritmo ───
        authorStreakCount: post.authorStreakCount ?? 0
      };
      const ctx = {
        facultyMatch: !!viewerCtx.faculty && viewerCtx.faculty === post.authorFaculty,
        ageMatch: false,
        // author age not exposed (anonymous) — always false
        followsAuthor: followedSet.has(post.authorNickname),
        followsHashtag: post.hashtags.some((t) => viewerCtx.followedHashtags.includes(t)),
        authorAffinity: viewerCtx.authorAffinities[post.authorId] ?? 0,
        seenInSession: seenSet.has(post.id),
        authorSeenToday: viewerCtx.authorSeenToday[post.authorId] ?? 0,
        embeddingSimilarity: userVector && postEmbeddings[post.id] ? cosineSimilarity(userVector, postEmbeddings[post.id]) : 0,
        timeOfDayMatch: isActiveHour(),
        isColdStart: viewerCtx.isColdStart
      };
      return { post, score: computeFinalScore(metrics, ctx) };
    });
    const heuristicPosts = applyHeuristics(ranked, CANDIDATE_POOL);
    let startIdx = 0;
    if (input.cursor) {
      const idx = heuristicPosts.findIndex((r) => r.post.id === input.cursor);
      if (idx !== -1) startIdx = idx + 1;
    }
    const page = heuristicPosts.slice(startIdx, startIdx + limit + 1);
    const hasMore = page.length > limit;
    const result = hasMore ? page.slice(0, limit) : page;
    const posts = result.map((r) => r.post);
    this.postRepo.markSeen(input.viewerId, posts.map((p) => p.id)).catch(() => null);
    return {
      posts: strip(posts),
      nextCursor: hasMore ? posts[posts.length - 1].id : null
    };
  }
};
function isActiveHour() {
  const hour = (/* @__PURE__ */ new Date()).getHours();
  return hour >= 7 && hour <= 22;
}

// src/application/posts/ToggleReactionUseCase.ts
var ToggleReactionUseCase = class {
  constructor(postRepo, stream) {
    this.postRepo = postRepo;
    this.stream = stream;
  }
  async execute(input) {
    const { postId, userId, type } = input;
    const post = await this.postRepo.findById(postId);
    if (!post) throw new Error("Post no encontrado.");
    const existing = await this.postRepo.findReaction(postId, userId, type);
    let action;
    if (existing) {
      await this.postRepo.removeReaction(existing.id, postId, type);
      action = "removed";
    } else {
      await this.postRepo.addReaction(postId, userId, type);
      action = "added";
    }
    this.stream.publish({
      type: action === "added" ? "REACTION_ADDED" : "REACTION_REMOVED",
      postId,
      userId,
      authorId: post.authorId,
      reactionType: type,
      timestamp: Date.now()
    }).catch(() => null);
    return { action };
  }
};

// src/application/posts/CreateCommentUseCase.ts
var CreateCommentUseCase = class {
  constructor(postRepo, stream) {
    this.postRepo = postRepo;
    this.stream = stream;
  }
  async execute(input) {
    const { postId, authorId, content } = input;
    const post = await this.postRepo.findById(postId);
    if (!post) throw new Error("Post no encontrado.");
    const comment = await this.postRepo.createComment(postId, authorId, content);
    this.stream.publish({
      type: "COMMENT_CREATED",
      postId,
      userId: authorId,
      authorId: post.authorId,
      timestamp: Date.now()
    }).catch(() => null);
    return comment;
  }
};

// src/application/posts/ListCommentsUseCase.ts
var ListCommentsUseCase = class {
  constructor(postRepo) {
    this.postRepo = postRepo;
  }
  async execute(input) {
    const limit = input.limit ?? 20;
    const comments = await this.postRepo.listComments(input.postId, input.cursor, limit + 1);
    const hasMore = comments.length > limit;
    const page = hasMore ? comments.slice(0, limit) : comments;
    const withAuthors = await Promise.all(
      page.map(async (c) => ({
        id: c.id,
        postId: c.postId,
        authorNickname: await this.postRepo.getCommentAuthorNickname(c.authorId),
        content: c.content,
        createdAt: c.createdAt
      }))
    );
    return {
      comments: withAuthors,
      nextCursor: hasMore ? page[page.length - 1].id : null
    };
  }
};

// src/application/posts/VotePollUseCase.ts
var VotePollUseCase = class {
  constructor(postRepo) {
    this.postRepo = postRepo;
  }
  async execute(input) {
    const post = await this.postRepo.findById(input.postId);
    if (!post) throw new Error("Post no encontrado.");
    if (post.type !== "POLL") throw new Error("Este post no es una encuesta.");
    await this.postRepo.votePoll(input.postId, input.optionId, input.userId);
  }
};

// src/infrastructure/storage/S3StorageService.ts
var import_client_s3 = require("@aws-sdk/client-s3");
var import_s3_request_presigner = require("@aws-sdk/s3-request-presigner");

// src/infrastructure/storage/storageConfig.ts
function loadStorageConfig() {
  const bucket = process.env.STORAGE_BUCKET;
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;
  if (!bucket || !accessKeyId || !secretAccessKey) return null;
  return {
    endpoint: process.env.STORAGE_ENDPOINT || void 0,
    region: process.env.STORAGE_REGION || "us-east-1",
    bucket,
    accessKeyId,
    secretAccessKey,
    publicUrl: (process.env.STORAGE_PUBLIC_URL || "").replace(/\/$/, ""),
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
    isPrivate: process.env.STORAGE_PRIVATE === "true",
    presignExpiry: Number(process.env.STORAGE_PRESIGN_EXPIRY ?? 300),
    readExpiry: Number(process.env.STORAGE_READ_EXPIRY ?? 3600)
  };
}

// src/infrastructure/storage/S3StorageService.ts
var S3StorageService = class {
  config;
  client;
  constructor() {
    this.config = loadStorageConfig();
    this.client = this.config ? new import_client_s3.S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      forcePathStyle: this.config.forcePathStyle,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey
      }
    }) : null;
  }
  isConfigured() {
    return this.client !== null;
  }
  isPrivate() {
    return this.config?.isPrivate ?? false;
  }
  async presignUpload(params) {
    if (!this.client || !this.config) throw new Error("Almacenamiento de medios no configurado.");
    const command = new import_client_s3.PutObjectCommand({
      Bucket: this.config.bucket,
      Key: params.key,
      ContentType: params.contentType
    });
    const uploadUrl = await (0, import_s3_request_presigner.getSignedUrl)(this.client, command, {
      expiresIn: this.config.presignExpiry
    });
    return { uploadUrl, key: params.key, expiresIn: this.config.presignExpiry };
  }
  async resolveUrl(key) {
    if (/^https?:\/\//i.test(key)) return key;
    if (!this.client || !this.config) throw new Error("Almacenamiento de medios no configurado.");
    if (this.config.isPrivate) {
      const command = new import_client_s3.GetObjectCommand({ Bucket: this.config.bucket, Key: key });
      return (0, import_s3_request_presigner.getSignedUrl)(this.client, command, { expiresIn: this.config.readExpiry });
    }
    return this.config.publicUrl ? `${this.config.publicUrl}/${key}` : this.derivePublicUrl(key);
  }
  derivePublicUrl(key) {
    const { endpoint, bucket, region, forcePathStyle } = this.config;
    if (endpoint) {
      const base = endpoint.replace(/\/$/, "");
      return forcePathStyle ? `${base}/${bucket}/${key}` : `${base}/${key}`;
    }
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
};

// src/infrastructure/repositories/PrismaEmbeddingRepository.ts
var PrismaEmbeddingRepository = class {
  constructor(db) {
    this.db = db;
  }
  async savePostEmbedding(postId, vector) {
    await this.db.postEmbedding.upsert({
      where: { postId },
      create: { postId, vector },
      update: { vector }
    });
  }
  async getPostEmbedding(postId) {
    const rec = await this.db.postEmbedding.findUnique({ where: { postId }, select: { vector: true } });
    return rec?.vector ?? null;
  }
  async getPostEmbeddings(postIds) {
    if (postIds.length === 0) return {};
    const rows = await this.db.postEmbedding.findMany({
      where: { postId: { in: postIds } },
      select: { postId: true, vector: true }
    });
    return Object.fromEntries(rows.map((r) => [r.postId, r.vector]));
  }
  async getUserVector(userId) {
    const rec = await this.db.userInterestVector.findUnique({ where: { userId }, select: { vector: true } });
    return rec?.vector ?? null;
  }
  async saveUserVector(userId, vector) {
    await this.db.userInterestVector.upsert({
      where: { userId },
      create: { userId, vector },
      update: { vector }
    });
  }
};

// src/infrastructure/repositories/PrismaGamificationRepository.ts
var PrismaGamificationRepository = class {
  constructor(db) {
    this.db = db;
  }
  async computeStats(userId) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { nickname: true, streakCount: true, prestige: true, bestRank: true }
    });
    if (!user) {
      return { streakCount: 0, prestige: 0, postsCount: 0, likesReceived: 0, commentsCount: 0, followers: 0, pollsCreated: 0, ephemeralCount: 0, bestRank: null };
    }
    const [postAgg, postsCount, pollsCreated, ephemeralCount, commentsCount, followers] = await Promise.all([
      this.db.post.aggregate({
        where: { authorId: userId, deletedAt: null },
        _sum: { likesCount: true, fireCount: true, teaCount: true, dedCount: true }
      }),
      this.db.post.count({ where: { authorId: userId, deletedAt: null } }),
      this.db.post.count({ where: { authorId: userId, deletedAt: null, type: "POLL" } }),
      this.db.post.count({ where: { authorId: userId, deletedAt: null, type: "EPHEMERAL" } }),
      this.db.comment.count({ where: { authorId: userId, deletedAt: null } }),
      this.db.userFollow.count({ where: { targetNickname: user.nickname } })
    ]);
    const likesReceived = (postAgg._sum.likesCount ?? 0) + (postAgg._sum.fireCount ?? 0) + (postAgg._sum.teaCount ?? 0) + (postAgg._sum.dedCount ?? 0);
    return {
      streakCount: user.streakCount,
      prestige: user.prestige,
      postsCount,
      likesReceived,
      commentsCount,
      followers,
      pollsCreated,
      ephemeralCount,
      bestRank: user.bestRank
    };
  }
  async getOwnedRewardIds(userId) {
    const rows = await this.db.userReward.findMany({ where: { userId }, select: { rewardId: true } });
    return rows.map((r) => r.rewardId);
  }
  async grantRewards(userId, rewardIds) {
    if (rewardIds.length === 0) return;
    await this.db.userReward.createMany({
      data: rewardIds.map((rewardId) => ({ userId, rewardId })),
      skipDuplicates: true
    });
  }
  async getEquipped(userId) {
    const u = await this.db.user.findUnique({
      where: { id: userId },
      select: { equippedFrame: true, equippedNameEffect: true, equippedBadge: true, equippedTitle: true }
    });
    return {
      equippedFrame: u?.equippedFrame ?? null,
      equippedNameEffect: u?.equippedNameEffect ?? null,
      equippedBadge: u?.equippedBadge ?? null,
      equippedTitle: u?.equippedTitle ?? null
    };
  }
  async setEquipped(userId, slot, rewardId) {
    await this.db.user.update({ where: { id: userId }, data: { [slot]: rewardId } });
  }
  async bumpStreak(userId) {
    const user = await this.db.user.findUnique({ where: { id: userId }, select: { streakCount: true, prestige: true, lastPostDate: true } });
    if (!user) return 0;
    const today = startOfDay(/* @__PURE__ */ new Date());
    const last = user.lastPostDate ? startOfDay(user.lastPostDate) : null;
    let next;
    if (!last) {
      next = 1;
    } else {
      const days = Math.round((today.getTime() - last.getTime()) / 864e5);
      if (days === 0) next = user.streakCount;
      else if (days === 1) next = user.streakCount + 1;
      else next = 1;
    }
    const prestige = Math.max(user.prestige, Math.floor(next / 365));
    await this.db.user.update({
      where: { id: userId },
      data: { streakCount: next, prestige, lastPostDate: /* @__PURE__ */ new Date() }
    });
    return next;
  }
};
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// src/application/gamification/GamificationService.ts
var CATEGORY_SLOT = {
  FRAME: "equippedFrame",
  NAME_EFFECT: "equippedNameEffect",
  BADGE: "equippedBadge",
  TITLE: "equippedTitle",
  STREAK_BADGE: "equippedBadge"
  // streak badges share the badge slot
};
var GamificationService = class {
  constructor(repo) {
    this.repo = repo;
  }
  /** Recompute stats, grant any newly-earned threshold rewards. Returns owned ids. */
  async sync(userId, special = []) {
    const stats = await this.repo.computeStats(userId);
    const owned = new Set(await this.repo.getOwnedRewardIds(userId));
    const earned = unlockedRewardIds(stats);
    const toGrant = earned.filter((id) => !owned.has(id));
    for (const s of special) if (!owned.has(s)) toGrant.push(s);
    if (toGrant.length) {
      await this.repo.grantRewards(userId, [...new Set(toGrant)]);
      for (const id of toGrant) owned.add(id);
    }
    if (owned.size >= 40) {
      const col = REWARDS.find((r) => r.name === "Coleccionista");
      if (col && !owned.has(col.id)) {
        await this.repo.grantRewards(userId, [col.id]);
        owned.add(col.id);
      }
    }
    return [...owned];
  }
  async getProfile(userId) {
    const [stats, owned, equipped] = await Promise.all([
      this.repo.computeStats(userId),
      this.repo.getOwnedRewardIds(userId),
      this.repo.getEquipped(userId)
    ]);
    return { stats, owned, equipped };
  }
  /** Equip (or unequip with rewardId=null) a cosmetic. Validates ownership + category. */
  async equip(userId, rewardId, category) {
    const slot = CATEGORY_SLOT[category];
    if (!slot) throw new Error("Categor\xEDa no equipable.");
    if (rewardId !== null) {
      const reward = getReward(rewardId);
      if (!reward) throw new Error("Recompensa no encontrada.");
      if (CATEGORY_SLOT[reward.category] !== slot) throw new Error("La recompensa no corresponde a esta ranura.");
      const owned = await this.repo.getOwnedRewardIds(userId);
      if (!owned.includes(rewardId)) throw new Error("A\xFAn no desbloqueas esta recompensa.");
    }
    await this.repo.setEquipped(userId, slot, rewardId);
    return this.repo.getEquipped(userId);
  }
  /** Streak bump on post — also returns the streak-milestone reward to grant, if any. */
  async onPost(userId, opts) {
    await this.repo.bumpStreak(userId);
    const special = [];
    if (opts.revealedIdentity) {
      const mask = REWARDS.find((r) => r.variant === "mask" && r.category === "BADGE");
      if (mask) special.push(mask.id);
    }
    await this.sync(userId, special);
  }
};

// src/infrastructure/redis/redis.ts
var import_ioredis = __toESM(require("ioredis"));
var _redis = null;
var _subRedis = null;
function createClient() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL not configured");
  const client = new import_ioredis.default(url, {
    maxRetriesPerRequest: null,
    // required for BullMQ
    enableReadyCheck: false,
    lazyConnect: true
  });
  client.on("error", (err) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Redis] connection error (non-fatal in dev):", err.message);
    }
  });
  return client;
}
function getRedis() {
  if (!process.env.REDIS_URL) return null;
  if (!_redis) _redis = createClient();
  return _redis;
}
function getSubRedis() {
  if (!process.env.REDIS_URL) return null;
  if (!_subRedis) _subRedis = createClient();
  return _subRedis;
}

// src/infrastructure/redis/RedisStreamProducer.ts
var STREAM_KEY = "qhatu:interactions";
var RedisStreamProducer = class {
  constructor(redis) {
    this.redis = redis;
  }
  async publish(event) {
    const fields = [];
    for (const [k, v] of Object.entries(event)) {
      if (v !== void 0) {
        fields.push(k, String(v));
      }
    }
    await this.redis.xadd(STREAM_KEY, "*", ...fields);
  }
};

// src/infrastructure/redis/NullStreamProducer.ts
var NullStreamProducer = class {
  async publish(_event) {
  }
};

// src/streamProducer.ts
var redisClient = getRedis();
var streamProducer = redisClient ? new RedisStreamProducer(redisClient) : new NullStreamProducer();

// src/routes/posts.ts
var postRoutes = async (app) => {
  const storage = new S3StorageService();
  const postRepo = new PrismaPostRepository(prisma, storage);
  const userRepo = new PrismaUserRepository(prisma);
  const embeddingRepo = new PrismaEmbeddingRepository(prisma);
  const gamification = new GamificationService(new PrismaGamificationRepository(prisma));
  app.get(
    "/feed",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: { querystring: (0, import_zod_to_json_schema4.zodToJsonSchema)(FeedQuerySchema) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const viewer = request.user;
      const query = FeedQuerySchema.parse(request.query);
      const useCase = new GetFeedUseCase(postRepo, userRepo, embeddingRepo);
      const result = await useCase.execute({
        tab: query.tab,
        viewerId: viewer.sub,
        cursor: query.cursor
      });
      return reply.send(result);
    }
  );
  const PublicFeedQuerySchema = import_zod9.z.object({
    tab: import_zod9.z.enum(["recent", "trending"]).default("recent"),
    cursor: import_zod9.z.string().optional()
  });
  app.get(
    "/public",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: {
        querystring: (0, import_zod_to_json_schema4.zodToJsonSchema)(PublicFeedQuerySchema)
      }
    },
    async (request, reply) => {
      const query = PublicFeedQuerySchema.parse(request.query);
      const useCase = new GetFeedUseCase(postRepo, userRepo, embeddingRepo);
      const result = await useCase.execute({ tab: query.tab, viewerId: "", cursor: query.cursor });
      return reply.send(result);
    }
  );
  app.get(
    "/:id",
    {
      config: { rateLimit: { max: 120, timeWindow: "1 minute" } },
      schema: { params: (0, import_zod_to_json_schema4.zodToJsonSchema)(import_zod9.z.object({ id: import_zod9.z.string() })) }
    },
    async (request, reply) => {
      const { id } = request.params;
      const useCase = new GetPostUseCase(postRepo);
      const post = await useCase.execute(id);
      if (!post) throw app.httpErrors.notFound("Post no encontrado.");
      return reply.send(post);
    }
  );
  app.post(
    "/",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: { body: (0, import_zod_to_json_schema4.zodToJsonSchema)(CreatePostSchema) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const author = request.user;
      const body = CreatePostSchema.parse(request.body);
      const useCase = new CreatePostUseCase(postRepo, userRepo, streamProducer, embeddingRepo);
      try {
        const post = await useCase.execute({
          authorId: author.sub,
          content: body.content,
          type: body.type,
          isIdentityRevealed: body.isIdentityRevealed,
          media: body.media,
          embedding: body.embedding,
          poll: body.poll ? { question: body.poll.question, options: body.poll.options } : void 0
        });
        gamification.onPost(author.sub, {
          revealedIdentity: body.isIdentityRevealed,
          isEphemeral: body.type === "EPHEMERAL"
        }).catch(() => null);
        return reply.code(201).send(post);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al crear post";
        throw app.httpErrors.badRequest(message);
      }
    }
  );
  app.delete(
    "/:id",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: { params: (0, import_zod_to_json_schema4.zodToJsonSchema)(import_zod9.z.object({ id: import_zod9.z.string() })) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const requester = request.user;
      const { id } = request.params;
      const useCase = new DeletePostUseCase(postRepo);
      try {
        await useCase.execute({ postId: id, requesterId: requester.sub });
        return reply.send({ message: "Post eliminado." });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al eliminar post";
        if (message.includes("permiso")) throw app.httpErrors.forbidden(message);
        throw app.httpErrors.notFound(message);
      }
    }
  );
  app.post(
    "/:id/react",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        body: (0, import_zod_to_json_schema4.zodToJsonSchema)(ReactSchema),
        params: (0, import_zod_to_json_schema4.zodToJsonSchema)(import_zod9.z.object({ id: import_zod9.z.string() }))
      }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const { id } = request.params;
      const body = ReactSchema.parse(request.body);
      const useCase = new ToggleReactionUseCase(postRepo, streamProducer);
      try {
        const result = await useCase.execute({ postId: id, userId: user.sub, type: body.type });
        return reply.send(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al reaccionar";
        throw app.httpErrors.notFound(message);
      }
    }
  );
  app.post(
    "/:id/vote",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        body: (0, import_zod_to_json_schema4.zodToJsonSchema)(import_zod9.z.object({ optionId: import_zod9.z.string().min(1) })),
        params: (0, import_zod_to_json_schema4.zodToJsonSchema)(import_zod9.z.object({ id: import_zod9.z.string() }))
      }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const { id } = request.params;
      const body = request.body;
      const useCase = new VotePollUseCase(postRepo);
      try {
        await useCase.execute({ postId: id, optionId: body.optionId, userId: user.sub });
        return reply.send({ ok: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al votar";
        throw app.httpErrors.badRequest(message);
      }
    }
  );
  app.get(
    "/:id/comments",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: {
        params: (0, import_zod_to_json_schema4.zodToJsonSchema)(import_zod9.z.object({ id: import_zod9.z.string() })),
        querystring: (0, import_zod_to_json_schema4.zodToJsonSchema)(import_zod9.z.object({
          cursor: import_zod9.z.string().optional(),
          limit: import_zod9.z.coerce.number().min(1).max(50).default(20)
        }))
      }
    },
    async (request, reply) => {
      const { id } = request.params;
      const query = request.query;
      const useCase = new ListCommentsUseCase(postRepo);
      const result = await useCase.execute({ postId: id, cursor: query.cursor, limit: query.limit });
      return reply.send(result);
    }
  );
  app.post(
    "/:id/comments",
    {
      config: { rateLimit: { max: 15, timeWindow: "1 minute" } },
      schema: {
        body: (0, import_zod_to_json_schema4.zodToJsonSchema)(CreateCommentSchema),
        params: (0, import_zod_to_json_schema4.zodToJsonSchema)(import_zod9.z.object({ id: import_zod9.z.string() }))
      }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const author = request.user;
      const { id } = request.params;
      const body = CreateCommentSchema.parse(request.body);
      const useCase = new CreateCommentUseCase(postRepo, streamProducer);
      try {
        const comment = await useCase.execute({ postId: id, authorId: author.sub, content: body.content });
        return reply.code(201).send(comment);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al comentar";
        throw app.httpErrors.notFound(message);
      }
    }
  );
};
var posts_default = postRoutes;

// src/routes/social.ts
var import_zod_to_json_schema5 = require("zod-to-json-schema");
var import_zod10 = require("zod");
init_prisma();

// src/infrastructure/repositories/PrismaSocialRepository.ts
var PrismaSocialRepository = class {
  constructor(db) {
    this.db = db;
  }
  async followUser(followerId, targetNickname) {
    await this.db.userFollow.upsert({
      where: { followerId_targetNickname: { followerId, targetNickname } },
      create: { followerId, targetNickname },
      update: {}
    });
  }
  async unfollowUser(followerId, targetNickname) {
    await this.db.userFollow.deleteMany({
      where: { followerId, targetNickname }
    });
  }
  async isFollowingUser(followerId, targetNickname) {
    const count = await this.db.userFollow.count({
      where: { followerId, targetNickname }
    });
    return count > 0;
  }
  async getFollowedNicknames(followerId) {
    const rows = await this.db.userFollow.findMany({
      where: { followerId, targetNickname: { not: null } },
      select: { targetNickname: true }
    });
    return rows.map((r) => r.targetNickname).filter(Boolean);
  }
};

// src/application/social/FollowUseCase.ts
var FollowUseCase = class {
  constructor(socialRepo, userRepo, stream) {
    this.socialRepo = socialRepo;
    this.userRepo = userRepo;
    this.stream = stream;
  }
  async execute(input) {
    const { followerId, targetNickname, action } = input;
    const target = await this.userRepo.findByNickname(targetNickname);
    if (!target) throw new Error("Usuario no encontrado.");
    if (target.id === followerId) throw new Error("No puedes seguirte a ti mismo.");
    if (action === "follow") {
      await this.socialRepo.followUser(followerId, targetNickname);
      this.stream.publish({
        type: "USER_FOLLOWED",
        userId: followerId,
        authorId: target.id,
        timestamp: Date.now()
      }).catch(() => null);
      return { following: true };
    }
    await this.socialRepo.unfollowUser(followerId, targetNickname);
    return { following: false };
  }
};

// src/routes/social.ts
var FollowSchema2 = import_zod10.z.object({
  targetNickname: import_zod10.z.string().min(1),
  action: import_zod10.z.enum(["follow", "unfollow"])
});
var socialRoutes = async (app) => {
  const userRepo = new PrismaUserRepository(prisma);
  const socialRepo = new PrismaSocialRepository(prisma);
  app.post(
    "/follow",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        body: (0, import_zod_to_json_schema5.zodToJsonSchema)(FollowSchema2),
        response: {
          200: (0, import_zod_to_json_schema5.zodToJsonSchema)(import_zod10.z.object({ following: import_zod10.z.boolean() }))
        }
      }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const follower = request.user;
      const body = FollowSchema2.parse(request.body);
      const useCase = new FollowUseCase(socialRepo, userRepo, streamProducer);
      try {
        const result = await useCase.execute({
          followerId: follower.sub,
          targetNickname: body.targetNickname,
          action: body.action
        });
        return reply.send(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al seguir usuario";
        if (message.includes("no encontrado")) throw app.httpErrors.notFound(message);
        throw app.httpErrors.badRequest(message);
      }
    }
  );
  app.get(
    "/follow/:nickname",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: {
        params: (0, import_zod_to_json_schema5.zodToJsonSchema)(import_zod10.z.object({ nickname: import_zod10.z.string() })),
        response: {
          200: (0, import_zod_to_json_schema5.zodToJsonSchema)(import_zod10.z.object({ following: import_zod10.z.boolean() }))
        }
      }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const follower = request.user;
      const { nickname } = request.params;
      const following = await socialRepo.isFollowingUser(follower.sub, nickname);
      return reply.send({ following });
    }
  );
};
var social_default = socialRoutes;

// src/routes/users.ts
var import_zod_to_json_schema6 = require("zod-to-json-schema");
var import_zod11 = require("zod");
init_prisma();
var AvatarSchema = import_zod11.z.object({ avatarSeed: import_zod11.z.string().regex(/^[a-z0-9]{1,16}$/i, "Seed inv\xE1lido") });
var userRoutes = async (app) => {
  const userRepo = new PrismaUserRepository(prisma);
  app.patch(
    "/me/avatar",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: { body: (0, import_zod_to_json_schema6.zodToJsonSchema)(AvatarSchema), response: { 200: (0, import_zod_to_json_schema6.zodToJsonSchema)(import_zod11.z.object({ avatarSeed: import_zod11.z.string() })) } }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const body = AvatarSchema.parse(request.body);
      await userRepo.updateAvatarSeed(user.sub, body.avatarSeed);
      return reply.send({ avatarSeed: body.avatarSeed });
    }
  );
  app.get(
    "/me",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: {
        response: {
          200: (0, import_zod_to_json_schema6.zodToJsonSchema)(import_zod11.z.object({
            id: import_zod11.z.string(),
            nickname: import_zod11.z.string(),
            avatarSeed: import_zod11.z.string(),
            avatarUrl: import_zod11.z.string().nullable(),
            faculty: import_zod11.z.string().nullable(),
            ageRange: import_zod11.z.string().nullable(),
            universityDomain: import_zod11.z.string(),
            streakCount: import_zod11.z.number(),
            prestige: import_zod11.z.number(),
            totalLikesEarned: import_zod11.z.number(),
            createdAt: import_zod11.z.string(),
            equipped: import_zod11.z.object({
              frame: import_zod11.z.string().nullable(),
              nameEffect: import_zod11.z.string().nullable(),
              badge: import_zod11.z.string().nullable(),
              title: import_zod11.z.string().nullable()
            })
          }))
        }
      }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const jwt2 = request.user;
      const user = await userRepo.findById(jwt2.sub);
      if (!user) throw app.httpErrors.notFound("Usuario no encontrado.");
      const eq = await prisma.user.findUnique({
        where: { id: jwt2.sub },
        select: { prestige: true, avatarUrl: true, equippedFrame: true, equippedNameEffect: true, equippedBadge: true, equippedTitle: true }
      });
      return reply.send({
        id: user.id,
        nickname: user.nickname,
        avatarSeed: user.avatarSeed,
        avatarUrl: eq?.avatarUrl ?? null,
        faculty: user.faculty,
        ageRange: user.ageRange,
        universityDomain: user.universityDomain,
        streakCount: user.streakCount,
        prestige: eq?.prestige ?? 0,
        totalLikesEarned: user.totalLikesEarned,
        createdAt: user.createdAt.toISOString(),
        equipped: {
          frame: eq?.equippedFrame ?? null,
          nameEffect: eq?.equippedNameEffect ?? null,
          badge: eq?.equippedBadge ?? null,
          title: eq?.equippedTitle ?? null
        }
      });
    }
  );
  app.get(
    "/:nickname",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: {
        params: (0, import_zod_to_json_schema6.zodToJsonSchema)(import_zod11.z.object({ nickname: import_zod11.z.string() })),
        response: {
          200: (0, import_zod_to_json_schema6.zodToJsonSchema)(import_zod11.z.object({
            nickname: import_zod11.z.string(),
            avatarSeed: import_zod11.z.string(),
            faculty: import_zod11.z.string().nullable(),
            universityDomain: import_zod11.z.string(),
            streakCount: import_zod11.z.number(),
            totalLikesEarned: import_zod11.z.number(),
            createdAt: import_zod11.z.string()
          }))
        }
      }
    },
    async (request, reply) => {
      const { nickname } = request.params;
      const user = await userRepo.findByNickname(nickname);
      if (!user) throw app.httpErrors.notFound("Usuario no encontrado.");
      return reply.send({
        nickname: user.nickname,
        avatarSeed: user.avatarSeed,
        faculty: user.faculty,
        universityDomain: user.universityDomain,
        streakCount: user.streakCount,
        totalLikesEarned: user.totalLikesEarned,
        createdAt: user.createdAt.toISOString()
      });
    }
  );
};
var users_default = userRoutes;

// src/routes/stream.ts
var devListeners = /* @__PURE__ */ new Map();
var streamRoutes = async (app) => {
  app.get(
    "/",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } }
    },
    async (request, reply) => {
      const query = request.query;
      if (query._at) {
        try {
          request.headers.authorization = `Bearer ${query._at}`;
        } catch {
        }
      }
      await request.jwtVerify();
      const user = request.user;
      const { prisma: prisma2 } = await Promise.resolve().then(() => (init_prisma(), prisma_exports));
      const viewer = await prisma2.user.findUnique({
        where: { id: user.sub },
        select: { universityDomain: true }
      });
      const domain = viewer?.universityDomain ?? "*";
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
        // disable nginx buffering
      });
      const send = (data) => {
        reply.raw.write(`data: ${JSON.stringify(data)}

`);
      };
      send({ type: "connected" });
      const pingInterval = setInterval(() => {
        send({ type: "ping" });
      }, 3e4);
      const redisClient2 = getSubRedis();
      const channel = `feed:updates:${domain}`;
      if (redisClient2) {
        await redisClient2.subscribe(channel);
        redisClient2.on("message", (ch, message) => {
          if (ch === channel) {
            send(JSON.parse(message));
          }
        });
      } else {
        const listener = (d) => send({ type: "NEW_POSTS", universityDomain: d });
        if (!devListeners.has(domain)) devListeners.set(domain, /* @__PURE__ */ new Set());
        devListeners.get(domain).add(listener);
        request.raw.on("close", () => {
          devListeners.get(domain)?.delete(listener);
        });
      }
      request.raw.on("close", () => {
        clearInterval(pingInterval);
        if (redisClient2) {
          redisClient2.unsubscribe(channel).catch(() => null);
        }
      });
      return reply;
    }
  );
};
var stream_default = streamRoutes;

// src/routes/media.ts
var import_zod_to_json_schema7 = require("zod-to-json-schema");
var import_zod12 = require("zod");

// src/application/media/PresignUploadUseCase.ts
var import_crypto = require("crypto");
var PresignUploadUseCase = class {
  constructor(storage) {
    this.storage = storage;
  }
  async execute(input) {
    if (!this.storage.isConfigured()) {
      throw new Error("Almacenamiento de medios no configurado.");
    }
    const kind = validateUpload(input.contentType, input.size);
    const ext = extForMime(input.contentType, kind);
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const rand = (0, import_crypto.randomBytes)(16).toString("hex");
    const key = `${kind}/${today}/${rand}.${ext}`;
    const presigned = await this.storage.presignUpload({
      key,
      contentType: input.contentType
    });
    return {
      ...presigned,
      mediaType: kind === "image" ? "IMAGE" : "VIDEO"
    };
  }
};
function extForMime(mime, kind) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov"
  };
  return map[mime] ?? MEDIA_LIMITS[kind].extensions[0];
}

// src/routes/media.ts
var mediaRoutes = async (app) => {
  const storage = new S3StorageService();
  app.post(
    "/presign",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: {
        body: (0, import_zod_to_json_schema7.zodToJsonSchema)(PresignUploadSchema),
        response: {
          200: (0, import_zod_to_json_schema7.zodToJsonSchema)(import_zod12.z.object({
            uploadUrl: import_zod12.z.string(),
            key: import_zod12.z.string(),
            expiresIn: import_zod12.z.number(),
            mediaType: import_zod12.z.enum(["IMAGE", "VIDEO"])
          }))
        }
      }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const body = PresignUploadSchema.parse(request.body);
      const useCase = new PresignUploadUseCase(storage);
      try {
        const result = await useCase.execute({
          userId: user.sub,
          contentType: body.contentType,
          size: body.size
        });
        return reply.send(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al preparar la subida";
        if (message.includes("no configurado")) throw app.httpErrors.serviceUnavailable(message);
        throw app.httpErrors.badRequest(message);
      }
    }
  );
  app.get(
    "/config",
    { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
    async (_request, reply) => {
      return reply.send({ enabled: storage.isConfigured() });
    }
  );
};
var media_default = mediaRoutes;

// src/routes/search.ts
var import_zod_to_json_schema8 = require("zod-to-json-schema");
var import_zod13 = require("zod");
init_prisma();

// src/infrastructure/repositories/PrismaSearchRepository.ts
var import_client2 = require("@prisma/client");
var PrismaSearchRepository = class {
  constructor(db) {
    this.db = db;
  }
  async searchPosts(q, _universityDomain, limit) {
    const rows = await this.db.$queryRaw(import_client2.Prisma.sql`
      SELECT p.id, p.content, p."createdAt", p."likesCount", p."commentsCount",
             u.nickname, u."avatarSeed", p."isIdentityRevealed",
             EXISTS (SELECT 1 FROM post_media pm WHERE pm."postId" = p.id) AS "hasMedia"
      FROM posts p
      JOIN users u ON u.id = p."authorId"
      WHERE p."deletedAt" IS NULL
        AND (p."expiresAt" IS NULL OR p."expiresAt" > NOW())
        AND to_tsvector('spanish', p.content) @@ plainto_tsquery('spanish', ${q})
      ORDER BY ts_rank(to_tsvector('spanish', p.content), plainto_tsquery('spanish', ${q})) DESC,
               p."createdAt" DESC
      LIMIT ${limit}
    `);
    return rows.map((r) => ({
      id: r.id,
      content: r.content,
      authorNickname: r.isIdentityRevealed ? r.nickname : "An\xF3nimo",
      authorAvatarSeed: r.avatarSeed,
      createdAt: r.createdAt,
      likesCount: r.likesCount,
      commentsCount: r.commentsCount,
      hasMedia: r.hasMedia
    }));
  }
  async searchUsers(q, limit) {
    const rows = await this.db.$queryRaw(import_client2.Prisma.sql`
      SELECT nickname, "avatarSeed", faculty
      FROM users
      WHERE nickname ILIKE ${"%" + q + "%"}
         OR similarity(nickname, ${q}) > 0.2
      ORDER BY similarity(nickname, ${q}) DESC, nickname ASC
      LIMIT ${limit}
    `);
    return rows;
  }
  async searchHashtags(q, limit) {
    const clean = q.replace(/^#/, "").toLowerCase();
    const rows = await this.db.$queryRaw(import_client2.Prisma.sql`
      SELECT tag, "postCount"
      FROM hashtags
      WHERE tag ILIKE ${"%" + clean + "%"}
         OR similarity(tag, ${clean}) > 0.2
      ORDER BY "postCount" DESC, similarity(tag, ${clean}) DESC
      LIMIT ${limit}
    `);
    return rows.map((r) => ({ tag: r.tag, postCount: Number(r.postCount) }));
  }
  async allPostVectors(_universityDomain) {
    const rows = await this.db.postEmbedding.findMany({
      where: {
        post: {
          deletedAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gt: /* @__PURE__ */ new Date() } }]
        }
      },
      select: { postId: true, vector: true }
    });
    return rows;
  }
  async postsByIds(ids) {
    if (ids.length === 0) return [];
    const rows = await this.db.post.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: {
        id: true,
        content: true,
        createdAt: true,
        likesCount: true,
        commentsCount: true,
        isIdentityRevealed: true,
        author: { select: { nickname: true, avatarSeed: true } },
        media: { select: { id: true }, take: 1 }
      }
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    return ids.flatMap((id) => {
      const r = byId.get(id);
      if (!r) return [];
      return [{
        id: r.id,
        content: r.content,
        authorNickname: r.isIdentityRevealed ? r.author.nickname : "An\xF3nimo",
        authorAvatarSeed: r.author.avatarSeed,
        createdAt: r.createdAt,
        likesCount: r.likesCount,
        commentsCount: r.commentsCount,
        hasMedia: r.media.length > 0
      }];
    });
  }
};

// src/application/search/SearchUseCase.ts
var SEMANTIC_MIN = 0.25;
var SearchUseCase = class {
  constructor(searchRepo, userRepo) {
    this.searchRepo = searchRepo;
    this.userRepo = userRepo;
  }
  async execute(input) {
    const q = input.q.trim();
    if (q.length === 0) return { posts: [], users: [], hashtags: [], semantic: [] };
    const viewer = await this.userRepo.findById(input.viewerId);
    const domain = viewer?.universityDomain ?? "";
    const wantPosts = input.scope === "all" || input.scope === "posts";
    const wantUsers = input.scope === "all" || input.scope === "users";
    const wantHashtags = input.scope === "all" || input.scope === "hashtags";
    const wantSemantic = (input.scope === "all" || input.scope === "posts") && isValidEmbedding(input.embedding);
    const [posts, users, hashtags, semantic] = await Promise.all([
      wantPosts ? this.searchRepo.searchPosts(q, domain, input.scope === "posts" ? 30 : 10) : Promise.resolve([]),
      wantUsers ? this.searchRepo.searchUsers(q, input.scope === "users" ? 30 : 8) : Promise.resolve([]),
      wantHashtags ? this.searchRepo.searchHashtags(q, input.scope === "hashtags" ? 30 : 8) : Promise.resolve([]),
      wantSemantic ? this.semanticSearch(input.embedding, domain, input.scope === "posts" ? 20 : 10) : Promise.resolve([])
    ]);
    const textIds = new Set(posts.map((p) => p.id));
    const semanticOnly = semantic.filter((s) => !textIds.has(s.id));
    return {
      posts: posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
      users,
      hashtags,
      semantic: semanticOnly.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))
    };
  }
  /** Cosine-rank all post vectors in the viewer's university against the query vector. */
  async semanticSearch(queryVec, domain, limit) {
    const vectors = await this.searchRepo.allPostVectors(domain);
    const scored = vectors.map((v) => ({ postId: v.postId, score: cosineSimilarity(queryVec, v.vector) })).filter((x) => x.score >= SEMANTIC_MIN).sort((a, b) => b.score - a.score).slice(0, limit);
    return this.searchRepo.postsByIds(scored.map((s) => s.postId));
  }
};

// src/routes/search.ts
var SearchBody = import_zod13.z.object({
  q: import_zod13.z.string().min(1).max(100),
  scope: import_zod13.z.enum(["all", "posts", "users", "hashtags"]).default("all"),
  embedding: import_zod13.z.array(import_zod13.z.number()).length(384).optional()
});
var searchRoutes = async (app) => {
  const searchRepo = new PrismaSearchRepository(prisma);
  const userRepo = new PrismaUserRepository(prisma);
  app.post(
    "/",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: { body: (0, import_zod_to_json_schema8.zodToJsonSchema)(SearchBody) }
    },
    async (request, reply) => {
      let viewerId = "";
      try {
        await request.jwtVerify();
        viewerId = request.user.sub;
      } catch {
      }
      const body = SearchBody.parse(request.body);
      const useCase = new SearchUseCase(searchRepo, userRepo);
      const result = await useCase.execute({
        q: body.q,
        viewerId,
        scope: body.scope,
        embedding: body.embedding
      });
      return reply.send(result);
    }
  );
};
var search_default = searchRoutes;

// src/routes/notifications.ts
var import_zod_to_json_schema9 = require("zod-to-json-schema");
var import_zod14 = require("zod");
init_prisma();

// src/infrastructure/repositories/PrismaNotificationRepository.ts
var PrismaNotificationRepository = class {
  constructor(db) {
    this.db = db;
  }
  async create(userId, type, payload) {
    const rec = await this.db.notification.create({
      data: { userId, type, payload }
    });
    return { id: rec.id, type: rec.type, payload: rec.payload, read: rec.read, createdAt: rec.createdAt };
  }
  async list(userId, cursor, limit = 20) {
    const where = { userId };
    if (cursor) {
      const pivot = await this.db.notification.findUnique({ where: { id: cursor }, select: { createdAt: true } });
      if (pivot) where.createdAt = { lt: pivot.createdAt };
    }
    const rows = await this.db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit
    });
    return rows.map((r) => ({ id: r.id, type: r.type, payload: r.payload, read: r.read, createdAt: r.createdAt }));
  }
  async markRead(userId, id) {
    await this.db.notification.updateMany({ where: { id, userId }, data: { read: true } });
  }
  async markAllRead(userId) {
    await this.db.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  }
  async unreadCount(userId) {
    return this.db.notification.count({ where: { userId, read: false } });
  }
  // ─── Push subscriptions ────────────────────────────────────────────────────
  async savePushSubscription(userId, subscriptionJson) {
    const existing = await this.db.pushToken.findFirst({ where: { userId, subscription: subscriptionJson } });
    if (existing) return;
    await this.db.pushToken.create({ data: { userId, subscription: subscriptionJson } });
  }
  async getPushSubscriptions(userId) {
    return this.db.pushToken.findMany({ where: { userId }, select: { id: true, subscription: true } });
  }
  async deletePushSubscription(id) {
    await this.db.pushToken.delete({ where: { id } }).catch(() => null);
  }
};

// src/routes/notifications.ts
var SubscribeSchema = import_zod14.z.object({
  subscription: import_zod14.z.object({
    endpoint: import_zod14.z.string().url(),
    keys: import_zod14.z.object({ p256dh: import_zod14.z.string(), auth: import_zod14.z.string() })
  }).passthrough()
});
var notificationRoutes = async (app) => {
  const notifRepo = new PrismaNotificationRepository(prisma);
  app.get(
    "/vapid-public-key",
    { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
    async (_req, reply) => reply.send({ publicKey: process.env.VAPID_PUBLIC_KEY ?? "" })
  );
  app.get(
    "/",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: { querystring: (0, import_zod_to_json_schema9.zodToJsonSchema)(import_zod14.z.object({ cursor: import_zod14.z.string().optional() })) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const query = request.query;
      const [items, unread] = await Promise.all([
        notifRepo.list(user.sub, query.cursor, 20),
        notifRepo.unreadCount(user.sub)
      ]);
      return reply.send({
        notifications: items.map((n) => ({
          id: n.id,
          type: n.type,
          payload: n.payload,
          read: n.read,
          createdAt: n.createdAt.toISOString()
        })),
        unreadCount: unread,
        nextCursor: items.length === 20 ? items[items.length - 1].id : null
      });
    }
  );
  app.get(
    "/unread-count",
    { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      return reply.send({ count: await notifRepo.unreadCount(user.sub) });
    }
  );
  app.post(
    "/read/:id",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: { params: (0, import_zod_to_json_schema9.zodToJsonSchema)(import_zod14.z.object({ id: import_zod14.z.string() })) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const { id } = request.params;
      await notifRepo.markRead(user.sub, id);
      return reply.send({ ok: true });
    }
  );
  app.post(
    "/read-all",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      await notifRepo.markAllRead(user.sub);
      return reply.send({ ok: true });
    }
  );
  app.post(
    "/subscribe",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: { body: (0, import_zod_to_json_schema9.zodToJsonSchema)(SubscribeSchema) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const body = SubscribeSchema.parse(request.body);
      await notifRepo.savePushSubscription(user.sub, JSON.stringify(body.subscription));
      return reply.send({ ok: true });
    }
  );
};
var notifications_default = notificationRoutes;

// src/routes/rewards.ts
var import_zod_to_json_schema10 = require("zod-to-json-schema");
var import_zod15 = require("zod");
init_prisma();
var EquipSchema = import_zod15.z.object({
  rewardId: import_zod15.z.string().nullable(),
  category: import_zod15.z.enum(["FRAME", "NAME_EFFECT", "BADGE", "TITLE", "STREAK_BADGE"])
});
var rewardRoutes = async (app) => {
  const repo = new PrismaGamificationRepository(prisma);
  const gam = new GamificationService(repo);
  app.get(
    "/me",
    { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      await gam.sync(user.sub);
      const profile = await gam.getProfile(user.sub);
      return reply.send(profile);
    }
  );
  app.post(
    "/equip",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: { body: (0, import_zod_to_json_schema10.zodToJsonSchema)(EquipSchema) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const user = request.user;
      const body = EquipSchema.parse(request.body);
      try {
        const equipped = await gam.equip(user.sub, body.rewardId, body.category);
        return reply.send({ equipped });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al equipar";
        throw app.httpErrors.badRequest(message);
      }
    }
  );
};
var rewards_default = rewardRoutes;

// src/routes/rankings.ts
var import_zod_to_json_schema11 = require("zod-to-json-schema");
var import_zod16 = require("zod");
init_prisma();
var RankingsQuery = import_zod16.z.object({
  type: import_zod16.z.enum(["LIKES_RECEIVED", "POSTS_PUBLISHED", "COMMENTS_MADE"]).default("LIKES_RECEIVED")
});
var rankingRoutes = async (app) => {
  app.get(
    "/",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: { querystring: (0, import_zod_to_json_schema11.zodToJsonSchema)(RankingsQuery) }
    },
    async (request, reply) => {
      await request.jwtVerify();
      const viewer = request.user;
      const query = RankingsQuery.parse(request.query);
      const me = await prisma.user.findUnique({ where: { id: viewer.sub }, select: { universityDomain: true } });
      const domain = me?.universityDomain ?? "";
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const rows = await prisma.dailyRanking.findMany({
        where: { date: today, type: query.type, user: { universityDomain: domain } },
        orderBy: { rank: "asc" },
        take: 50,
        select: {
          rank: true,
          value: true,
          user: { select: { nickname: true, avatarSeed: true, equippedFrame: true, equippedTitle: true } }
        }
      });
      return reply.send({
        type: query.type,
        entries: rows.map((r) => ({
          rank: r.rank,
          value: r.value,
          nickname: r.user.nickname,
          avatarSeed: r.user.avatarSeed,
          frame: r.user.equippedFrame,
          title: r.user.equippedTitle
        }))
      });
    }
  );
};
var rankings_default = rankingRoutes;

// src/routes/trends.ts
init_prisma();
var trendsRoutes = async (app) => {
  app.get("/", { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } }, async (_req, reply) => {
    const [hashtags, users, postCount] = await Promise.all([
      prisma.hashtag.findMany({ orderBy: { postCount: "desc" }, take: 8, select: { tag: true, postCount: true } }),
      prisma.user.findMany({
        where: { posts: { some: { deletedAt: null } } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { nickname: true, avatarSeed: true, avatarUrl: true, faculty: true, universityDomain: true }
      }),
      prisma.post.count({ where: { deletedAt: null } })
    ]);
    return reply.send({
      hashtags: hashtags.map((h) => ({ tag: h.tag, postCount: h.postCount })),
      users: users.map((u) => ({ nickname: u.nickname, avatarSeed: u.avatarSeed, avatarUrl: u.avatarUrl, faculty: u.faculty, university: u.universityDomain })),
      stats: { totalPosts: postCount }
    });
  });
};
var trends_default = trendsRoutes;

// src/app.ts
function assertProdSecrets() {
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters in production");
  }
  if (!process.env.COOKIE_SECRET || process.env.COOKIE_SECRET.length < 32) {
    throw new Error("COOKIE_SECRET must be set and at least 32 characters in production");
  }
  if (!process.env.EMAIL_HASH_SALT) {
    throw new Error("EMAIL_HASH_SALT must be set in production");
  }
}
async function buildApp() {
  assertProdSecrets();
  const app = (0, import_fastify.default)({ logger: true, ignoreTrailingSlash: true });
  await app.register(import_cors.default, {
    origin: process.env.FRONTEND_URL ?? (process.env.NODE_ENV === "production" ? (() => {
      throw new Error("FRONTEND_URL must be set in production");
    })() : "http://localhost:3000"),
    credentials: true
  });
  await app.register(import_cookie.default, {
    secret: process.env.COOKIE_SECRET ?? process.env.JWT_SECRET ?? "cookie-secret-change-in-production"
  });
  await app.register(import_jwt.default, {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-in-production"
  });
  await app.register(import_sensible.default);
  await app.register(import_rate_limit.default, { global: false });
  await app.register(auth_default, { prefix: "/auth" });
  await app.register(qr_default, { prefix: "/auth/qr" });
  await app.register(account_default, { prefix: "/auth" });
  await app.register(posts_default, { prefix: "/posts" });
  await app.register(social_default, { prefix: "/social" });
  await app.register(users_default, { prefix: "/users" });
  await app.register(stream_default, { prefix: "/stream" });
  await app.register(media_default, { prefix: "/media" });
  await app.register(search_default, { prefix: "/search" });
  await app.register(notifications_default, { prefix: "/notifications" });
  await app.register(rewards_default, { prefix: "/rewards" });
  await app.register(rankings_default, { prefix: "/rankings" });
  await app.register(trends_default, { prefix: "/trends" });
  app.get("/health", async () => ({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    redis: !!process.env.REDIS_URL
  }));
  app.get("/", async () => ({ message: "Qhatu API v1", docs: "/health" }));
  return app;
}

// src/infrastructure/db/ensureSearchIndexes.ts
init_prisma();
async function ensureSearchIndexes() {
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS posts_content_fts ON posts USING GIN (to_tsvector('spanish', content));`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS users_nickname_trgm ON users USING GIN (nickname gin_trgm_ops);`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS hashtags_tag_trgm ON hashtags USING GIN (tag gin_trgm_ops);`
    );
    console.log("[search] indexes ensured");
  } catch (err) {
    console.error("[search] failed to ensure indexes:", err.message);
  }
}

// src/serverless.ts
var ready = null;
function getApp() {
  if (!ready) {
    ready = (async () => {
      const app = await buildApp();
      await app.ready();
      await ensureSearchIndexes().catch((e) => app.log.error(e));
      return app;
    })();
  }
  return ready;
}
async function handler(req, res) {
  const app = await getApp();
  app.server.emit("request", req, res);
}
module.exports=module.exports.default;

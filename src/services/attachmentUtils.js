const ATTACHMENT_SEPARATOR = "\n\n";

export async function computeSHA256(input) {
  let buffer;
  if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
    buffer = input;
  } else {
    buffer = await input.arrayBuffer();
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function fileExtension(filename) {
  const match = /\.([^.]+)$/.exec(filename || "");
  return match ? match[1].toLowerCase() : "jpg";
}

export function parseAttachments(relationAttachments) {
  if (!relationAttachments) {
    return [];
  }
  return relationAttachments
    .split(ATTACHMENT_SEPARATOR)
    .map((block) => {
      let name = "";
      let checksum = "";
      for (const line of block.split("\n")) {
        const index = line.indexOf("=");
        if (index === -1) {
          continue;
        }
        const key = line.slice(0, index);
        const value = line.slice(index + 1);
        if (key === "n") {
          name = value;
        } else if (key === "d") {
          checksum = value;
        }
      }
      return { name, checksum };
    })
    .filter((attachment) => attachment.name && attachment.checksum);
}

export function serializeAttachments(attachments) {
  return attachments
    .map(({ name, checksum }) => `n=${name}\nd=${checksum}`)
    .join(ATTACHMENT_SEPARATOR);
}

export function addAttachment(relationAttachments, name, checksum) {
  const attachments = parseAttachments(relationAttachments);
  const alreadyPresent = attachments.some(
    (attachment) => attachment.name === name && attachment.checksum === checksum,
  );
  if (alreadyPresent) {
    return relationAttachments;
  }
  attachments.push({ name, checksum });
  return serializeAttachments(attachments);
}

export function removeAttachment(relationAttachments, name) {
  const attachments = parseAttachments(relationAttachments).filter(
    (attachment) => attachment.name !== name,
  );
  return serializeAttachments(attachments);
}

export function attachmentChecksumsFromSurveys(surveys) {
  const map = new Map();
  for (const survey of surveys) {
    for (const { name, checksum } of parseAttachments(
      survey.RelationAttachments,
    )) {
      map.set(name, checksum);
    }
  }
  return map;
}
